import { recommendBirdsByFrequency } from '../data/birds';

export interface IdentificationCandidate {
  name: string;
  confidence: 'high' | 'medium' | 'low';
  reason?: string;
}

export interface IdentificationResult {
  candidates: IdentificationCandidate[];
  source: 'ai' | 'acoustic-fallback';
  peakFreqHz: number;
  durationSec: number;
  spectrogramDataUrl: string;
  notice?: string;
}

/**
 * Radix-2 Cooley-Tukey FFT (in-place)
 */
function fft(real: Float32Array, imag: Float32Array): void {
  const n = real.length;
  let j = 0;
  for (let i = 0; i < n; i++) {
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
    let m = n >> 1;
    while (m >= 1 && j >= m) {
      j -= m;
      m >>= 1;
    }
    j += m;
  }

  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1;
    const step = (-2 * Math.PI) / size;
    for (let i = 0; i < n; i += size) {
      for (let k = 0; k < half; k++) {
        const angle = step * k;
        const wr = Math.cos(angle);
        const wi = Math.sin(angle);
        const tr = wr * real[i + k + half] - wi * imag[i + k + half];
        const ti = wr * imag[i + k + half] + wi * real[i + k + half];
        real[i + k + half] = real[i + k] - tr;
        imag[i + k + half] = imag[i + k] - ti;
        real[i + k] += tr;
        imag[i + k] += ti;
      }
    }
  }
}

/**
 * 정규화된 강도(0~1)를 고대비 스펙트로그램 색상(어두운 남색 → 보라 → 주황 → 노랑)으로 매핑
 */
export function intensityToRgb(v: number): [number, number, number] {
  const x = Math.max(0, Math.min(1, v));
  if (x < 0.25) {
    const t = x / 0.25;
    return [Math.round(12 + t * 58), Math.round(16 + t * 14), Math.round(45 + t * 90)];
  }
  if (x < 0.55) {
    const t = (x - 0.25) / 0.3;
    return [Math.round(70 + t * 145), Math.round(30 + t * 35), Math.round(135 - t * 45)];
  }
  if (x < 0.85) {
    const t = (x - 0.55) / 0.3;
    return [Math.round(215 + t * 38), Math.round(65 + t * 125), Math.round(90 - t * 65)];
  }
  const t = (x - 0.85) / 0.15;
  return [255, Math.round(190 + t * 65), Math.round(25 + t * 185)];
}

/**
 * 오디오 Blob(녹음 또는 파일)을 디코딩해 분석용 스펙트로그램과 음향 특징을 추출합니다.
 */
export async function analyzeAudioBlob(blob: Blob): Promise<{
  spectrogramBase64: string;
  spectrogramDataUrl: string;
  peakFreqHz: number;
  durationSec: number;
}> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const decoded = await ctx.decodeAudioData(arrayBuffer);
    const sampleRate = decoded.sampleRate;
    const channel = decoded.getChannelData(0);

    // 최대 10초 구간만 분석 (산행 현장 집중 구간)
    const maxSamples = Math.min(channel.length, Math.floor(sampleRate * 10));
    const durationSec = maxSamples / sampleRate;

    const fftSize = 1024;
    const hopSize = Math.max(256, Math.floor((maxSamples - fftSize) / 220));
    const numFrames = Math.max(1, Math.floor((maxSamples - fftSize) / hopSize));

    // Hann 윈도우 사전 계산
    const hann = new Float32Array(fftSize);
    for (let i = 0; i < fftSize; i++) {
      hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
    }

    const minFreqHz = 300; // 바람·발소리 저주파 차단
    const maxFreqHz = Math.min(9500, sampleRate / 2);
    const minBin = Math.max(1, Math.floor((minFreqHz * fftSize) / sampleRate));
    const maxBin = Math.min(fftSize / 2 - 1, Math.ceil((maxFreqHz * fftSize) / sampleRate));
    const binCount = maxBin - minBin + 1;

    const dbMatrix: Float32Array[] = [];
    const binEnergySum = new Float32Array(binCount);
    let maxDb = -120;

    const real = new Float32Array(fftSize);
    const imag = new Float32Array(fftSize);

    for (let f = 0; f < numFrames; f++) {
      const start = f * hopSize;
      for (let i = 0; i < fftSize; i++) {
        real[i] = (channel[start + i] ?? 0) * hann[i];
        imag[i] = 0;
      }
      fft(real, imag);

      const frameDb = new Float32Array(binCount);
      for (let b = 0; b < binCount; b++) {
        const idx = minBin + b;
        const mag = Math.sqrt(real[idx] * real[idx] + imag[idx] * imag[idx]) / fftSize;
        const db = 20 * Math.log10(mag + 1e-7);
        frameDb[b] = db;
        if (db > maxDb) maxDb = db;
        // 고주파 새소리 대역 에너지 누적
        binEnergySum[b] += mag;
      }
      dbMatrix.push(frameDb);
    }

    // 가장 에너지가 강한 피크 주파수 계산
    let bestBinOffset = 0;
    let bestEnergy = -1;
    for (let b = 0; b < binCount; b++) {
      if (binEnergySum[b] > bestEnergy) {
        bestEnergy = binEnergySum[b];
        bestBinOffset = b;
      }
    }
    const peakFreqHz = Math.round(((minBin + bestBinOffset) * sampleRate) / fftSize);

    // 캔버스에 스펙트로그램 렌더링 (라벨 포함 → Vision 모델 판독력 향상)
    const padLeft = 44;
    const padBottom = 24;
    const plotW = Math.min(640, Math.max(320, numFrames * 2));
    const plotH = 260;

    const canvas = document.createElement('canvas');
    canvas.width = padLeft + plotW;
    canvas.height = plotH + padBottom;
    const g = canvas.getContext('2d')!;

    g.fillStyle = '#0b1022';
    g.fillRect(0, 0, canvas.width, canvas.height);

    const floorDb = Math.max(-90, maxDb - 55);
    const spanDb = Math.max(15, maxDb - floorDb);

    const colW = plotW / numFrames;
    const rowH = plotH / binCount;

    for (let f = 0; f < numFrames; f++) {
      const x = padLeft + f * colW;
      const frame = dbMatrix[f];
      for (let b = 0; b < binCount; b++) {
        const norm = (frame[b] - floorDb) / spanDb;
        const [r, gr, bl] = intensityToRgb(norm);
        g.fillStyle = `rgb(${r},${gr},${bl})`;
        const y = plotH - (b + 1) * rowH;
        g.fillRect(x, y, Math.ceil(colW), Math.ceil(rowH));
      }
    }

    // 주파수 눈금 (kHz)
    g.fillStyle = '#94a3b8';
    g.font = '11px sans-serif';
    g.textAlign = 'right';
    g.textBaseline = 'middle';
    for (const freq of [1000, 2000, 4000, 6000, 8000]) {
      if (freq > maxFreqHz || freq < minFreqHz) continue;
      const ratio = (freq - minFreqHz) / (maxFreqHz - minFreqHz);
      const y = plotH - ratio * plotH;
      g.fillText(`${freq / 1000}k`, padLeft - 6, y);
      g.strokeStyle = 'rgba(255,255,255,0.12)';
      g.beginPath();
      g.moveTo(padLeft, y);
      g.lineTo(padLeft + plotW, y);
      g.stroke();
    }

    // 시간 눈금 (초)
    g.textAlign = 'center';
    g.textBaseline = 'top';
    const stepSec = durationSec > 5 ? 2 : 1;
    for (let s = 0; s <= Math.floor(durationSec); s += stepSec) {
      const x = padLeft + (s / Math.max(0.1, durationSec)) * plotW;
      g.fillText(`${s}s`, x, plotH + 5);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64 = dataUrl.split(',')[1] ?? '';

    return {
      spectrogramBase64: base64,
      spectrogramDataUrl: dataUrl,
      peakFreqHz,
      durationSec: Number(durationSec.toFixed(1)),
    };
  } finally {
    await ctx.close().catch(() => {});
  }
}

const API_KEY_STORAGE_KEY = 'birdsong_anthropic_api_key_v1';

export function getStoredApiKey(): string {
  try {
    return (localStorage.getItem(API_KEY_STORAGE_KEY) ?? '').trim();
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(API_KEY_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch {
    // localStorage 접근 불가 시 무시
  }
}

/**
 * 스펙트로그램과 음향 특징을 바탕으로 새를 동정합니다.
 * 브라우저에 저장된 Anthropic API 키가 있으면 Claude Vision API를 직접 호출하고,
 * 키가 없거나 오프라인/오류 시에는 주파수 대역 기반 산새 추천으로 자동 전환합니다.
 */
export async function identifyBirdFromAudio(
  blob: Blob,
  environment: 'mountain' | 'valley' | 'all' = 'mountain',
): Promise<IdentificationResult> {
  const { spectrogramBase64, spectrogramDataUrl, peakFreqHz, durationSec } =
    await analyzeAudioBlob(blob);

  const apiKey = getStoredApiKey();
  let notice =
    'API 키가 설정되지 않아 녹음된 주요 주파수 대역을 기준으로 유사 산새 후보를 추천했습니다. 상단 열쇠 아이콘에서 API 키를 입력하면 AI 정밀 동정을 사용할 수 있습니다.';

  if (apiKey) {
    const envLabel =
      environment === 'valley'
        ? '산간 계곡/물가'
        : environment === 'mountain'
          ? '산림/등산로'
          : '일반 야외';

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: spectrogramBase64,
                  },
                },
                {
                  type: 'text',
                  text: `이것은 한국 야외에서 녹음한 새소리의 스펙트로그램(세로: 주파수 kHz, 가로: 시간 초)입니다.
참고 정보: 관찰 환경: ${envLabel} / 주요 피크 주파수: 약 ${peakFreqHz}Hz / 녹음 길이: ${durationSec}초

스펙트로그램의 주파수 대역, 음절 간격, 하모닉/트릴/하강·상승 패턴을 분석하여 한국에서 서식하는 가장 가능성 높은 새 후보를 최대 3종까지 JSON으로 답하세요.
새소리가 전혀 보이지 않거나 판별이 불가능하면 candidates를 빈 배열 []로 반환하세요.

반드시 아래 JSON 형식만 출력하세요(마크다운 코드블록 없이):
{"candidates":[{"name":"박새","confidence":"high","reason":"3~6kHz 대역의 규칙적인 2~3음절 반복 패턴"}]}`,
                },
              ],
            },
          ],
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          content?: Array<{ text?: string }>;
        };
        const raw = (data.content?.[0]?.text ?? '').trim();
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        let candidates: IdentificationCandidate[] = [];

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as {
            candidates?: Array<{
              name?: string;
              confidence?: string;
              reason?: string;
            }>;
          };
          if (Array.isArray(parsed.candidates)) {
            candidates = parsed.candidates
              .filter(
                (c) =>
                  c &&
                  typeof c.name === 'string' &&
                  c.name.trim() &&
                  c.name !== '알수없음',
              )
              .slice(0, 3)
              .map((c) => ({
                name: c.name!.trim(),
                confidence:
                  c.confidence === 'high' ||
                  c.confidence === 'medium' ||
                  c.confidence === 'low'
                    ? c.confidence
                    : 'medium',
                reason:
                  typeof c.reason === 'string' ? c.reason.trim() : undefined,
              }));
          }
        }

        if (candidates.length > 0) {
          return {
            candidates,
            source: 'ai',
            peakFreqHz,
            durationSec,
            spectrogramDataUrl,
          };
        }
        notice =
          'AI가 뚜렷한 새소리를 판별하지 못해 주파수 대역 기반 유사 산새 후보를 표시합니다.';
      } else {
        notice =
          res.status === 401
            ? 'API 키가 올바르지 않습니다(401). 상단 설정에서 키를 확인해주세요. 우선 주파수 기반 후보를 표시합니다.'
            : `AI API 오류(${res.status})로 인해 주파수 기반 유사 산새 후보를 표시합니다.`;
      }
    } catch {
      notice =
        '네트워크 연결이 불안정하여 오프라인 주파수 기반 유사 산새 후보를 표시합니다.';
    }
  }

  const fallbackBirds = recommendBirdsByFrequency(peakFreqHz, 4);
  return {
    candidates: fallbackBirds.map((b, i) => ({
      name: b.korean,
      confidence: i === 0 ? 'medium' : 'low',
      reason: `주파수 대역(~${(peakFreqHz / 1000).toFixed(1)}kHz) 유사 산새: ${b.callDescription ?? ''}`,
    })),
    source: 'acoustic-fallback',
    peakFreqHz,
    durationSec,
    spectrogramDataUrl,
    notice,
  };
}
