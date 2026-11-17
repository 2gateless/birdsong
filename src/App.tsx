import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import {
  Bird,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  FileAudio,
  History,
  KeyRound,
  Maximize2,
  Mic,
  Mountain,
  Search,
  Sparkles,
  Square,
  Trash2,
  Volume2,
  Waves,
  X,
} from 'lucide-react';
import { searchBirdSuggestions, type BirdEntry } from './data/birds';
import { fetchBirdMedia, type BirdInfo } from './services/birdMedia';
import {
  getStoredApiKey,
  identifyBirdFromAudio,
  intensityToRgb,
  setStoredApiKey,
  type IdentificationResult,
} from './utils/audioSpectrogram';

type MainTab = 'listen' | 'search' | 'history';
type AppState = 'idle' | 'recording' | 'analyzing' | 'searching' | 'result';
type HabitatFilter = 'hiking' | 'mountain' | 'water' | 'all';
type ListenEnv = 'mountain' | 'valley' | 'all';

interface HistoryItem {
  name: string;
  scientificName: string;
  timestamp: number;
  mode: 'sound' | 'search';
}

const HISTORY_STORAGE_KEY = 'birdsong_hike_history_v1';
const MAX_RECORD_SEC = 10;

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, 30)));
  } catch {
    // 저장 공간 부족 시 무시
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('listen');
  const [appState, setAppState] = useState<AppState>('idle');

  // 검색 상태
  const [searchText, setSearchText] = useState('');
  const [habitatFilter, setHabitatFilter] = useState<HabitatFilter>('hiking');

  // 산행 소리 동정 상태
  const [listenEnv, setListenEnv] = useState<ListenEnv>('mountain');
  const [recordSec, setRecordSec] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [identification, setIdentification] = useState<IdentificationResult | null>(null);

  // 결과 & UI 상태
  const [birdInfo, setBirdInfo] = useState<BirdInfo | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getStoredApiKey());
  const [hasApiKey, setHasApiKey] = useState(() => Boolean(getStoredApiKey()));
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());

  // 녹음 & 실시간 스펙트로그램 refs
  const liveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 검색 자동완성 & 빠른 탐색 목록
  const suggestions = useMemo(
    () =>
      searchBirdSuggestions(searchText, {
        habitat: habitatFilter,
        limit: searchText.trim() ? 16 : 18,
      }),
    [searchText, habitatFilter],
  );

  // 녹음 리소스 정리
  const cleanupRecordingResources = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupRecordingResources();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  const recordHistory = (info: BirdInfo, mode: 'sound' | 'search') => {
    setHistory((prev) => {
      const next: HistoryItem[] = [
        {
          name: info.name,
          scientificName: info.scientificName,
          timestamp: Date.now(),
          mode,
        },
        ...prev.filter((item) => item.name !== info.name),
      ].slice(0, 30);
      saveHistory(next);
      return next;
    });
  };

  const loadBirdResult = async (
    birdName: string,
    mode: 'sound' | 'search',
    keepIdentification = false,
  ) => {
    setErrorMsg('');
    setAppState('searching');
    setSelectedImageIdx(0);
    if (!keepIdentification) {
      setIdentification(null);
    }
    try {
      const info = await fetchBirdMedia(birdName);
      setBirdInfo(info);
      setAppState('result');
      recordHistory(info, mode);
    } catch {
      setErrorMsg('새 정보를 불러오는 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
      setAppState('idle');
    }
  };

  const handleSearch = (overrideName?: string) => {
    const target = (overrideName ?? searchText).trim();
    if (!target) return;
    setSearchText(target);
    void loadBirdResult(target, 'search', false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const analyzeBlobAndShow = async (blob: Blob) => {
    setErrorMsg('');
    setAppState('analyzing');

    setRecordedAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });

    try {
      const result = await identifyBirdFromAudio(blob, listenEnv);
      setIdentification(result);
      const topName = result.candidates[0]?.name;
      if (!topName) {
        setErrorMsg('뚜렷한 새소리를 찾지 못했습니다. 조금 더 가까이에서 다시 녹음해보세요.');
        setAppState('idle');
        return;
      }
      await loadBirdResult(topName, 'sound', true);
    } catch {
      setErrorMsg('오디오를 분석하지 못했습니다. 다른 파일이나 녹음으로 다시 시도해주세요.');
      setAppState('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanupRecordingResources();
  };

  const startRecording = async () => {
    setErrorMsg('');
    setIdentification(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg('이 브라우저에서는 마이크 녹음을 지원하지 않습니다. 오디오 파일 업로드를 이용해주세요.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.25;
      source.connect(analyser);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        chunksRef.current = [];
        if (blob.size > 0) {
          void analyzeBlobAndShow(blob);
        } else {
          setAppState('idle');
        }
      };

      recorder.start(250);
      setRecordSec(0);
      setAppState('recording');

      // 실시간 워터폴 스펙트로그램 렌더링
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      const sampleRate = ctx.sampleRate;
      const maxFreqBin = Math.min(
        freqData.length - 1,
        Math.ceil((9500 * analyser.fftSize) / sampleRate),
      );
      const minFreqBin = Math.max(
        1,
        Math.floor((300 * analyser.fftSize) / sampleRate),
      );

      const drawLive = () => {
        const canvas = liveCanvasRef.current;
        if (!canvas) return;
        const g = canvas.getContext('2d');
        if (!g) return;

        analyser.getByteFrequencyData(freqData);
        const w = canvas.width;
        const h = canvas.height;

        // 기존 이미지를 왼쪽으로 2px 스크롤
        const img = g.getImageData(2, 0, w - 2, h);
        g.putImageData(img, 0, 0);

        const bins = maxFreqBin - minFreqBin + 1;
        for (let y = 0; y < h; y++) {
          const ratio = 1 - y / h;
          const binIdx = minFreqBin + Math.floor(ratio * (bins - 1));
          const v = freqData[binIdx] / 255;
          const [r, gr, bl] = intensityToRgb(v);
          g.fillStyle = `rgb(${r},${gr},${bl})`;
          g.fillRect(w - 2, y, 2, 1);
        }

        rafRef.current = requestAnimationFrame(drawLive);
      };
      rafRef.current = requestAnimationFrame(drawLive);

      let elapsed = 0;
      timerRef.current = window.setInterval(() => {
        elapsed += 1;
        setRecordSec(elapsed);
        if (elapsed >= MAX_RECORD_SEC) {
          stopRecording();
        }
      }, 1000);
    } catch {
      cleanupRecordingResources();
      setErrorMsg('마이크 접근 권한이 필요합니다. 브라우저 설정에서 마이크를 허용해주세요.');
      setAppState('idle');
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    void analyzeBlobAndShow(file);
  };

  const handleReset = () => {
    cleanupRecordingResources();
    setAppState('idle');
    setBirdInfo(null);
    setSelectedImageIdx(0);
    setErrorMsg('');
    setLightboxOpen(false);
  };

  const switchTab = (tab: MainTab) => {
    if (appState === 'recording') stopRecording();
    setActiveTab(tab);
    if (appState === 'result') {
      setAppState('idle');
    }
    setErrorMsg('');
  };

  const prevImage = () => setSelectedImageIdx((i) => Math.max(0, i - 1));
  const nextImage = () =>
    setSelectedImageIdx((i) => Math.min((birdInfo?.imageUrls.length ?? 1) - 1, i + 1));

  const currentImage = birdInfo?.imageUrls[selectedImageIdx];

  return (
    <div className="min-h-screen pt-3 pb-24 px-4 md:px-0 md:max-w-md mx-auto relative flex flex-col">
      {/* Header */}
      <header className="relative flex flex-col items-center pt-4 pb-3 space-y-4">
        <button
          onClick={() => {
            setApiKeyInput(getStoredApiKey());
            setApiKeyModalOpen(true);
          }}
          title={hasApiKey ? 'Google Gemini API 키 설정됨' : 'Google Gemini API 키 설정'}
          className={`absolute right-0 top-4 w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
            hasApiKey
              ? 'bg-emerald-500/20 border-emerald-400/70 text-emerald-300'
              : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white'
          }`}
        >
          <KeyRound size={15} />
        </button>

        {/* 중앙 상단: 새 아이콘 + Birdsong */}
        <button
          onClick={handleReset}
          className="flex flex-col items-center space-y-1 text-primary"
        >
          <div className="flex items-center space-x-2">
            <Bird size={32} strokeWidth={2.5} />
            <h1 className="text-2xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
              Birdsong
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 leading-none">산행 새소리 동정 · 도감</p>
        </button>

        {/* 아랫줄: 소리로 동정 / 도감 검색 / 기록 검색 */}
        <div className="w-full grid grid-cols-3 gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-1">
          <button
            onClick={() => switchTab('listen')}
            className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'listen'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Mic size={14} />
            소리로 동정
          </button>
          <button
            onClick={() => switchTab('search')}
            className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'search'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Search size={14} />
            도감 검색
          </button>
          <button
            onClick={() => switchTab('history')}
            className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <History size={14} />
            기록 검색
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col space-y-5 mt-2">
        {/* 1. 소리 동정 탭 */}
        {activeTab === 'listen' && appState === 'idle' && (
          <div className="glass-panel rounded-3xl p-6 flex flex-col items-center space-y-6 shadow-2xl">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white">들리는 새소리를 녹음하세요</h2>
              <p className="text-slate-400 text-xs">
                최대 {MAX_RECORD_SEC}초 녹음 후 스펙트로그램 분석 및 실제 소리와 비교합니다
              </p>
            </div>

            {/* 산행 환경 선택 */}
            <div className="w-full flex items-center justify-center gap-2">
              {(
                [
                  { id: 'mountain', label: '산림 · 등산로', icon: Mountain },
                  { id: 'valley', label: '계곡 · 물가', icon: Waves },
                  { id: 'all', label: '일반 야외', icon: Compass },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setListenEnv(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                    listenEnv === id
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-semibold'
                      : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            {/* 원터치 대형 녹음 버튼 */}
            <button
              onClick={() => void startRecording()}
              className="w-36 h-36 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex flex-col items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.45)] hover:scale-105 active:scale-95 transition-all"
            >
              <Mic size={44} strokeWidth={2.2} />
              <span className="text-sm font-extrabold mt-2">새소리 듣기</span>
            </button>

            {errorMsg && (
              <p className="text-red-400 text-xs text-center bg-red-950/40 border border-red-900/60 rounded-xl px-3 py-2 w-full">
                {errorMsg}
              </p>
            )}

            {/* 오디오 파일 불러오기 */}
            <div className="w-full pt-2 border-t border-slate-700/60 flex items-center justify-between gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-all"
              >
                <FileAudio size={16} className="text-emerald-400" />
                녹음해둔 오디오 파일로 동정하기
              </button>
            </div>
          </div>
        )}

        {/* 녹음 중 + 실시간 스펙트로그램 */}
        {appState === 'recording' && (
          <div className="glass-panel rounded-3xl p-6 flex flex-col items-center space-y-5 shadow-2xl">
            <div className="flex items-center justify-between w-full">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                주변 새소리 수집 중...
              </span>
              <span className="text-sm font-mono text-slate-200">
                {recordSec}s / {MAX_RECORD_SEC}s
              </span>
            </div>

            <div className="w-full rounded-2xl overflow-hidden border border-slate-700 bg-[#0b1022]">
              <canvas
                ref={liveCanvasRef}
                width={360}
                height={150}
                className="w-full h-36 block"
              />
              <div className="flex justify-between px-3 py-1 text-[10px] text-slate-400 bg-slate-900/80">
                <span>저음 (0.3kHz)</span>
                <span>실시간 스펙트로그램</span>
                <span>고음 (9.5kHz)</span>
              </div>
            </div>

            <button
              onClick={stopRecording}
              className="w-24 h-24 rounded-full bg-rose-500 hover:bg-rose-400 text-white flex flex-col items-center justify-center ripple-recording transition-all"
            >
              <Square size={26} fill="currentColor" />
              <span className="text-xs font-bold mt-1.5">지금 분석</span>
            </button>

            <p className="text-xs text-slate-400 text-center">
              새소리가 잘 잡히면 [지금 분석]을 누르거나 {MAX_RECORD_SEC}초 후 자동 분석됩니다
            </p>
          </div>
        )}

        {/* 2. 도감 / 새 검색 탭 */}
        {activeTab === 'search' && appState === 'idle' && (
          <div className="glass-panel rounded-3xl p-5 flex flex-col space-y-4 shadow-2xl">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="새 이름·초성(ㅂㅅ)·울음소리(뻐꾹, 드러밍)..."
                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-primary text-white text-sm rounded-2xl py-3.5 pl-11 pr-10 outline-none transition-all placeholder:text-slate-500"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* 서식지 빠른 필터 */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {(
                [
                  { id: 'hiking', label: '산행 자주 보는 새' },
                  { id: 'mountain', label: '산림 전체' },
                  { id: 'water', label: '계곡 · 물가' },
                  { id: 'all', label: '전체' },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setHabitatFilter(id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border transition-all ${
                    habitatFilter === id
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-semibold'
                      : 'bg-slate-800/70 border-slate-700 text-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {errorMsg && <p className="text-red-400 text-xs text-center">{errorMsg}</p>}

            {/* 추천/자동완성 목록 */}
            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
              {suggestions.length > 0 ? (
                suggestions.map((bird: BirdEntry) => (
                  <button
                    key={bird.korean}
                    onClick={() => handleSearch(bird.korean)}
                    className="w-full text-left bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-3.5 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{bird.korean}</span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {bird.english}
                        </span>
                      </div>
                      {bird.callDescription && (
                        <p className="text-xs text-emerald-300/90 mt-1 line-clamp-1">
                          {bird.callDescription}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-slate-500 flex-shrink-0 mt-1" />
                  </button>
                ))
              ) : (
                <button
                  onClick={() => handleSearch()}
                  className="w-full py-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold"
                >
                  "{searchText}" 직접 검색하기
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. 탐조 기록 탭 */}
        {activeTab === 'history' && appState === 'idle' && (
          <div className="glass-panel rounded-3xl p-5 flex flex-col space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock size={16} className="text-emerald-400" />
                산행 탐조 기록
              </h2>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([]);
                    saveHistory([]);
                  }}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  비우기
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                아직 동정하거나 검색한 새가 없습니다.
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {history.map((item) => (
                  <button
                    key={`${item.name}-${item.timestamp}`}
                    onClick={() => void loadBirdResult(item.name, 'search', false)}
                    className="w-full text-left bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{item.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                          {item.mode === 'sound' ? '소리 동정' : '도감 검색'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{item.scientificName}</p>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 분석 / 검색 로딩 */}
        {(appState === 'analyzing' || appState === 'searching') && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-16">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-slate-700 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Bird className="text-primary animate-pulse" size={32} />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">
                {appState === 'analyzing' ? '새소리 패턴 분석 중...' : '사진 · 소리 불러오는 중...'}
              </h2>
              <p className="text-slate-400 text-sm">
                {appState === 'analyzing'
                  ? '스펙트로그램 주파수와 리듬을 판독하고 있습니다'
                  : 'iNaturalist · GBIF · Wikimedia에서 자료를 모으고 있습니다'}
              </p>
            </div>
          </div>
        )}

        {/* 결과 화면 */}
        {appState === 'result' && birdInfo && (
          <div className="space-y-4 animate-fade-in">
            {/* AI / 주파수 동정 후보 전환 바 */}
            {identification && (
              <div className="glass-panel rounded-2xl p-4 space-y-3 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles size={14} />
                    {identification.source === 'ai'
                      ? 'AI 스펙트로그램 동정 후보'
                      : '주파수 대역 유사 산새 후보'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    피크 {(identification.peakFreqHz / 1000).toFixed(1)}kHz ·{' '}
                    {identification.durationSec}s
                  </span>
                </div>

                {identification.notice && (
                  <p className="text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-800/40 rounded-xl px-2.5 py-1.5">
                    {identification.notice}
                  </p>
                )}

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {identification.candidates.map((cand, idx) => {
                    const active = cand.name === birdInfo.name;
                    return (
                      <button
                        key={`${cand.name}-${idx}`}
                        onClick={() => void loadBirdResult(cand.name, 'sound', true)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          active
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-emerald-500/50'
                        }`}
                      >
                        {idx + 1}. {cand.name}
                      </button>
                    );
                  })}
                </div>

                {(() => {
                  const activeCand = identification.candidates.find(
                    (c) => c.name === birdInfo.name,
                  );
                  return activeCand?.reason ? (
                    <p className="text-xs text-slate-300">{activeCand.reason}</p>
                  ) : null;
                })()}

                {/* 내 녹음 소리 + 스펙트로그램 (A/B 비교용) */}
                {recordedAudioUrl && (
                  <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="font-semibold text-emerald-400">내가 녹음한 소리</span>
                      <span>아래 실제 울음소리와 번갈아 비교해보세요</span>
                    </div>
                    <audio controls className="w-full h-9" src={recordedAudioUrl} />
                    <img
                      src={identification.spectrogramDataUrl}
                      alt="녹음 스펙트로그램"
                      className="w-full rounded-lg border border-slate-800"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 메인 새 정보 카드 */}
            <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
              {/* 메인 이미지 */}
              <div className="relative h-72 bg-slate-900 flex items-center justify-center overflow-hidden">
                {currentImage && (
                  <img
                    key={currentImage.url}
                    src={currentImage.url}
                    alt={birdInfo.name}
                    className="absolute inset-0 w-full h-full object-contain"
                    onError={() => {
                      const next = selectedImageIdx + 1;
                      if (next < birdInfo.imageUrls.length) setSelectedImageIdx(next);
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent z-10 pointer-events-none" />

                {birdInfo.imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      disabled={selectedImageIdx === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center disabled:opacity-20 hover:bg-black/70 transition-all"
                    >
                      <ChevronLeft size={20} className="text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      disabled={selectedImageIdx === birdInfo.imageUrls.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center disabled:opacity-20 hover:bg-black/70 transition-all"
                    >
                      <ChevronRight size={20} className="text-white" />
                    </button>
                  </>
                )}

                <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                  {currentImage && (
                    <span className="bg-black/55 text-slate-200 text-[10px] px-2 py-1 rounded-full">
                      {currentImage.source}
                    </span>
                  )}
                  {birdInfo.imageUrls.length > 1 && (
                    <span className="bg-black/55 text-white text-xs px-2 py-1 rounded-full">
                      {selectedImageIdx + 1} / {birdInfo.imageUrls.length}
                    </span>
                  )}
                  <button
                    onClick={() => setLightboxOpen(true)}
                    title="사진 확대"
                    className="w-7 h-7 rounded-full bg-black/55 flex items-center justify-center text-white hover:bg-black/80"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>

                <div className="absolute bottom-4 left-5 right-5 z-20">
                  <h2 className="text-3xl font-extrabold text-white">{birdInfo.name}</h2>
                  <p className="text-slate-300 text-xs mt-1">{birdInfo.displaySubtitle}</p>
                </div>
              </div>

              {/* 썸네일 스트립 */}
              {birdInfo.imageUrls.length > 1 && (
                <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-slate-900/80">
                  {birdInfo.imageUrls.map((img, idx) => (
                    <button
                      key={`${img.url}-${idx}`}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        idx === selectedImageIdx
                          ? 'border-emerald-400 scale-105'
                          : 'border-transparent opacity-60 hover:opacity-90'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* 울음소리 특징 & 요약 */}
              {(birdInfo.callDescription ?? birdInfo.summary) && (
                <div className="px-5 pt-4 pb-2 space-y-2.5 bg-slate-900/50">
                  {birdInfo.callDescription && (
                    <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-2xl p-3">
                      <p className="text-[11px] font-semibold text-emerald-400 mb-0.5">
                        울음소리 특징
                      </p>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {birdInfo.callDescription}
                      </p>
                    </div>
                  )}
                  {birdInfo.summary && (
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {birdInfo.summary}
                    </p>
                  )}
                </div>
              )}

              {/* 실제 새소리 섹션 (최대 12개) */}
              <div className="p-5 space-y-3 bg-slate-900/50">
                {birdInfo.audioItems.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                      <Volume2 size={18} />
                      <span className="font-semibold text-sm">실제 울음소리 비교</span>
                      <span className="text-slate-400 text-xs">
                        ({birdInfo.audioItems.length}개)
                      </span>
                    </div>
                    {birdInfo.audioItems.map((item, idx) => (
                      <div
                        key={`${item.url}-${idx}`}
                        className="bg-slate-800/80 rounded-xl p-3 border border-slate-700"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs text-slate-200 font-medium truncate">
                            {idx + 1}. {item.label}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-emerald-300 flex-shrink-0">
                            {item.source}
                          </span>
                        </div>
                        {item.location && (
                          <p className="text-[11px] text-slate-400 mb-2 truncate">
                            {item.location}
                          </p>
                        )}
                        <audio controls preload="none" className="w-full h-9" src={item.url} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 text-center">
                    <Volume2 className="text-slate-600 mx-auto mb-2" size={24} />
                    <p className="text-slate-400 text-sm">소리 기록을 찾을 수 없습니다</p>
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="w-full mt-2 py-3.5 bg-slate-800 text-white rounded-xl font-medium border border-slate-700 hover:bg-slate-700 transition-all"
                >
                  새로 동정 · 검색하기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 이미지 확대 모달 */}
      {lightboxOpen && currentImage && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center"
          >
            <X size={20} />
          </button>
          <img
            src={currentImage.url}
            alt={birdInfo?.name ?? ''}
            className="max-w-full max-h-[88vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* API 키 설정 모달 (브라우저 로컬 저장 전용) */}
      {apiKeyModalOpen && (
        <div
          onClick={() => setApiKeyModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm glass-panel rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound size={17} className="text-emerald-400" />
                Google Gemini API 키 설정
              </h3>
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              입력한 Google Gemini API 키는 서버나 GitHub에 전송되지 않고{' '}
              <strong className="text-emerald-300">현재 브라우저(localStorage)에만 저장</strong>됩니다.
              스펙트로그램과 녹음 오디오를 함께 분석하며, 키가 없으면 주파수 기반 유사 산새 추천 모드로 동작합니다.
            </p>

            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none font-mono"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setStoredApiKey(apiKeyInput);
                  setHasApiKey(Boolean(apiKeyInput.trim()));
                  setApiKeyModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all"
              >
                저장
              </button>
              {hasApiKey && (
                <button
                  onClick={() => {
                    setApiKeyInput('');
                    setStoredApiKey('');
                    setHasApiKey(false);
                    setApiKeyModalOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 text-rose-300 text-sm font-medium transition-all"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Background Decorative Blobs */}
      <div className="fixed top-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

export default App;
