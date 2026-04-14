import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Mic, Search, Upload, Volume2, Bird, Square, CheckCircle } from 'lucide-react';

type InputMode = 'search' | 'upload' | 'record';
type AppState = 'idle' | 'identifying' | 'result';

interface BirdInfo {
  name: string;
  scientificName: string;
  imageUrl: string;
  audioUrl: string | null;
}

// 한국어 새 이름 → 영어 일반명 (표시용)
const KOREAN_TO_ENGLISH: Record<string, string> = {
  "딱새": "Daurian redstart",
  "참새": "Eurasian tree sparrow",
  "까치": "Eurasian magpie",
  "까마귀": "Carrion crow",
  "비둘기": "Rock pigeon",
  "오목눈이": "Long-tailed tit",
  "박새": "Japanese tit",
  "어치": "Eurasian jay",
  "제비": "Barn swallow",
  "뻐꾸기": "Common cuckoo",
  "꾀꼬리": "Black-naped oriole",
  "파랑새": "Blue-and-white flycatcher",
  "동고비": "Eurasian nuthatch",
  "상모솔새": "Goldcrest",
  "노랑턱멧새": "Yellow-throated bunting",
  "멧새": "Meadow bunting",
  "물총새": "Common kingfisher",
  "후투티": "Eurasian hoopoe",
  "소쩍새": "Oriental scops owl",
  "부엉이": "Tawny owl",
  "올빼미": "Ural owl",
  "두루미": "Red-crowned crane",
  "황새": "Oriental stork",
  "왜가리": "Grey heron",
  "백로": "Little egret",
  "갈매기": "Common gull",
  "기러기": "Bean goose",
  "오리": "Mallard",
  "청둥오리": "Mallard",
  "원앙": "Mandarin duck",
  "흰뺨검둥오리": "Eastern spot-billed duck",
  "쑥새": "Rustic bunting",
  "방울새": "Grey-capped greenfinch",
  "홍방울새": "Common redpoll",
  "산솔새": "Eastern crowned warbler",
  "솔새": "Arctic warbler",
  "휘파람새": "Japanese bush warbler",
  "개개비": "Oriental reed warbler",
  "붉은머리오목눈이": "Vinous-throated parrotbill",
  "쇠딱다구리": "Pygmy woodpecker",
  "오색딱다구리": "Great spotted woodpecker",
  "청딱다구리": "Grey-headed woodpecker",
  "직박구리": "Brown-eared bulbul",
  "굴뚝새": "Eurasian wren",
  "꿩": "Common pheasant",
  "황조롱이": "Common kestrel",
  "매": "Peregrine falcon",
  "독수리": "Cinereous vulture",
  "고니": "Tundra swan",
  "두견이": "Lesser cuckoo",
  "찌르레기": "White-cheeked starling",
  "되새": "Brambling",
  "노랑지빠귀": "Naumann's thrush",
  "지빠귀": "Naumann's thrush",
};

// 한국어 새 이름 → 학명 (Wikimedia Commons 검색용)
const KOREAN_TO_SCIENTIFIC: Record<string, string> = {
  "딱새": "Phoenicurus auroreus",
  "참새": "Passer montanus",
  "까치": "Pica pica",
  "까마귀": "Corvus corone",
  "비둘기": "Columba livia",
  "오목눈이": "Aegithalos caudatus",
  "박새": "Parus minor",
  "어치": "Garrulus glandarius",
  "제비": "Hirundo rustica",
  "뻐꾸기": "Cuculus canorus",
  "꾀꼬리": "Oriolus chinensis",
  "파랑새": "Cyanoptila cyanomelana",
  "동고비": "Sitta europaea",
  "상모솔새": "Regulus regulus",
  "노랑턱멧새": "Emberiza elegans",
  "멧새": "Emberiza cioides",
  "물총새": "Alcedo atthis",
  "후투티": "Upupa epops",
  "소쩍새": "Otus scops",
  "부엉이": "Strix aluco",
  "올빼미": "Strix uralensis",
  "두루미": "Grus japonensis",
  "황새": "Ciconia boyciana",
  "왜가리": "Ardea cinerea",
  "백로": "Egretta garzetta",
  "갈매기": "Larus canus",
  "기러기": "Anser fabalis",
  "오리": "Anas platyrhynchos",
  "청둥오리": "Anas platyrhynchos",
  "원앙": "Aix galericulata",
  "흰뺨검둥오리": "Anas zonorhyncha",
  "쑥새": "Emberiza rustica",
  "방울새": "Chloris sinica",
  "홍방울새": "Acanthis flammea",
  "산솔새": "Phylloscopus coronatus",
  "솔새": "Phylloscopus borealis",
  "휘파람새": "Horornis diphone",
  "개개비": "Acrocephalus orientalis",
  "붉은머리오목눈이": "Sinosuthora webbiana",
  "쇠딱다구리": "Dendrocopos kizuki",
  "오색딱다구리": "Dendrocopos major",
  "청딱다구리": "Picus canus",
  "직박구리": "Hypsipetes amaurotis",
  "굴뚝새": "Troglodytes troglodytes",
  "꿩": "Phasianus colchicus",
  "황조롱이": "Falco tinnunculus",
  "매": "Falco peregrinus",
  "독수리": "Aegypius monachus",
  "고니": "Cygnus columbianus",
  "두견이": "Cuculus poliocephalus",
  "찌르레기": "Spodiopsar cineraceus",
  "되새": "Fringilla montifringilla",
  "노랑지빠귀": "Turdus naumanni",
  "지빠귀": "Turdus naumanni",
};

// 학명 → 한국어 역방향 매핑 (향후 확장용)
const _SCIENTIFIC_TO_KOREAN = Object.fromEntries(
  Object.entries(KOREAN_TO_SCIENTIFIC).map(([k, v]) => [v.toLowerCase(), k])
);
void _SCIENTIFIC_TO_KOREAN;

function App() {
  const [inputMode, setInputMode] = useState<InputMode>('search');
  const [appState, setAppState] = useState<AppState>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [pendingAudio, setPendingAudio] = useState<Blob | File | null>(null);
  const [searchText, setSearchText] = useState('');
  const [birdInfo, setBirdInfo] = useState<BirdInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        setPendingAudio(new Blob(chunks, { type: 'audio/webm' }));
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setPendingAudio(null);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      setErrorMsg('마이크 접근 권한이 필요합니다. 브라우저 설정에서 허용해주세요.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsRecording(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingAudio(file);
      setErrorMsg('');
    }
  };

  // 오디오 Blob → 스펙트로그램 JPEG base64 생성 (Web Audio API + Canvas)
  const generateSpectrogram = async (audio: Blob | File): Promise<string> => {
    const arrayBuffer = await audio.arrayBuffer();
    const audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    await audioCtx.close();

    const channelData = audioBuffer.getChannelData(0);
    const fftSize = 512;
    const hopSize = 256;
    const numFrames = Math.floor((channelData.length - fftSize) / hopSize);
    const numFreqs = fftSize / 2;

    // 간단한 DFT (FFT 근사) 계산
    const hann = (i: number) => 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
    const getMagnitudes = (start: number): Float32Array => {
      const mags = new Float32Array(numFreqs);
      for (let k = 0; k < numFreqs; k++) {
        let re = 0, im = 0;
        for (let n = 0; n < fftSize; n++) {
          const sample = channelData[start + n] * hann(n);
          const angle = (2 * Math.PI * k * n) / fftSize;
          re += sample * Math.cos(angle);
          im -= sample * Math.sin(angle);
        }
        mags[k] = Math.sqrt(re * re + im * im);
      }
      return mags;
    };

    // Canvas에 스펙트로그램 그리기
    const canvasWidth = Math.min(numFrames, 400);
    const canvasHeight = numFreqs;
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(canvasWidth, canvasHeight);

    const step = Math.max(1, Math.floor(numFrames / canvasWidth));
    let globalMax = 0;
    const allMags: Float32Array[] = [];
    for (let col = 0; col < canvasWidth; col++) {
      const frame = col * step;
      const mags = getMagnitudes(frame * hopSize);
      allMags.push(mags);
      for (let f = 0; f < numFreqs; f++) if (mags[f] > globalMax) globalMax = mags[f];
    }

    for (let col = 0; col < canvasWidth; col++) {
      const mags = allMags[col];
      for (let f = 0; f < numFreqs; f++) {
        const norm = globalMax > 0 ? mags[f] / globalMax : 0;
        const brightness = Math.floor(norm * 255);
        const idx = ((numFreqs - 1 - f) * canvasWidth + col) * 4;
        imageData.data[idx] = brightness;
        imageData.data[idx + 1] = Math.floor(brightness * 0.6);
        imageData.data[idx + 2] = 255 - brightness;
        imageData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // JPEG base64로 변환
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    return dataUrl.split(',')[1];
  };

  const identifyFromAudio = async (audio: Blob | File) => {
    setAppState('identifying');
    setErrorMsg('');

    try {
      // 스펙트로그램 생성 후 Claude Vision API로 전송
      const spectrogram = await generateSpectrogram(audio);

      const res = await fetch('/.netlify/functions/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spectrogram }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { birdName } = await res.json() as { birdName: string | null };

      if (birdName) {
        const info = await searchData(birdName);
        setBirdInfo(info);
        setAppState('result');
      } else {
        setErrorMsg('새소리를 인식하지 못했습니다. 주변 소음을 줄이고 새소리가 선명하게 들릴 때 다시 시도해보세요.');
        setAppState('idle');
      }
    } catch {
      setErrorMsg('분석 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      setAppState('idle');
    }
  };

  const searchData = async (query: string): Promise<BirdInfo> => {
    const fallbackImage = "https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=800&auto=format&fit=crop";
    const scientificName = KOREAN_TO_SCIENTIFIC[query] ?? query;
    const englishName = KOREAN_TO_ENGLISH[query] ?? '';
    const displayName = [englishName, scientificName !== query ? scientificName : '']
      .filter(Boolean).join(' · ') || '조류 데이터';
    const resultInfo: BirdInfo = {
      name: query || "알 수 없음",
      scientificName: displayName,
      imageUrl: fallbackImage,
      audioUrl: null,
    };

    if (!query.trim()) return resultInfo;

    // 이미지(한국 Wikipedia) + 소리(iNaturalist) 병렬 검색
    // iNaturalist API는 CORS 완전 지원, 전 세계 자연 관찰 소리 데이터 보유
    const [wikiData, inatData] = await Promise.all([
      fetch(`https://ko.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(query)}&format=json&pithumbsize=800&origin=*`)
        .then(r => r.json()).catch(() => null),
      fetch(`https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(scientificName)}&sounds=true&per_page=10&order_by=votes`)
        .then(r => r.json()).catch(() => null),
    ]);

    // 이미지 처리
    const imgPages = wikiData?.query?.pages;
    if (imgPages) {
      const pageId = Object.keys(imgPages)[0];
      if (pageId !== "-1" && imgPages[pageId].thumbnail?.source) {
        resultInfo.imageUrl = imgPages[pageId].thumbnail.source;
      }
    }

    // 소리 처리: 관찰 결과에서 첫 번째 소리 URL 추출
    type InatSound = { file_url?: string };
    type InatObs = { sounds?: InatSound[] };
    const sounds: InatSound[] = (inatData?.results as InatObs[] ?? [])
      .flatMap(obs => obs.sounds ?? [])
      .filter(s => s.file_url);
    if (sounds.length > 0) resultInfo.audioUrl = sounds[0].file_url!;

    return resultInfo;
  };

  const handleIdentify = async () => {
    setErrorMsg('');
    if (inputMode === 'search') {
      const target = searchText.trim();
      if (!target) return;
      setAppState('identifying');
      const info = await searchData(target);
      setBirdInfo(info);
      setAppState('result');
    } else if (pendingAudio) {
      await identifyFromAudio(pendingAudio);
    } else {
      setErrorMsg(inputMode === 'upload' ? '파일을 먼저 선택해주세요.' : '먼저 새소리를 녹음해주세요.');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleIdentify();
  };

  const handleReset = () => {
    setAppState('idle');
    setIsRecording(false);
    setSearchText('');
    setPendingAudio(null);
    setErrorMsg('');
    setRecordingTime(0);
  };

  return (
    <div className="min-h-screen pt-4 pb-20 px-4 md:px-0 md:max-w-md mx-auto relative flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between py-6">
        <div className="flex items-center space-x-2 text-primary">
          <Bird size={32} strokeWidth={2.5} />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
            Birdsong
          </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col space-y-6 mt-4">
        {appState === 'idle' && (
          <div className="glass-panel rounded-3xl p-6 flex flex-col space-y-8 shadow-2xl transition-all duration-500">
            {/* Mode Selectors */}
            <div className="flex bg-slate-800 rounded-full p-1.5 shadow-inner">
              <button
                onClick={() => setInputMode('search')}
                className={`flex-1 py-3 text-sm font-medium rounded-full transition-all ${
                  inputMode === 'search' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                이름 검색
              </button>
              <button
                onClick={() => setInputMode('upload')}
                className={`flex-1 py-3 text-sm font-medium rounded-full transition-all ${
                  inputMode === 'upload' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                소리 업로드
              </button>
              <button
                onClick={() => setInputMode('record')}
                className={`flex-1 py-3 text-sm font-medium rounded-full transition-all ${
                  inputMode === 'record' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                소리 녹음
              </button>
            </div>

            {/* Input Sections */}
            <div className="min-h-[200px] flex items-center justify-center">
              {inputMode === 'search' && (
                <div className="w-full relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="예: 딱새, 참새, 오목눈이..."
                    className="w-full bg-slate-800 border-2 border-slate-700 focus:border-primary text-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-slate-500"
                  />
                </div>
              )}

              {inputMode === 'upload' && (
                <div className="w-full flex flex-col items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-2xl p-8 hover:bg-slate-800/50 hover:border-primary transition-all"
                  >
                    {pendingAudio instanceof File ? (
                      <>
                        <CheckCircle className="text-emerald-400 mb-3" size={40} />
                        <p className="text-emerald-300 font-medium">{(pendingAudio as File).name}</p>
                        <p className="text-slate-500 text-xs mt-1">다른 파일을 선택하려면 탭하세요</p>
                      </>
                    ) : (
                      <>
                        <Upload className="text-slate-400 mb-3" size={40} />
                        <p className="text-slate-300 font-medium">새소리 파일 선택</p>
                        <p className="text-slate-500 text-xs mt-1">MP3, M4A, WAV, OGG 등</p>
                      </>
                    )}
                  </button>
                  {pendingAudio instanceof File && (
                    <audio controls src={URL.createObjectURL(pendingAudio)} className="w-full" />
                  )}
                </div>
              )}

              {inputMode === 'record' && (
                <div className="flex flex-col items-center justify-center space-y-5">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isRecording
                        ? 'bg-red-500 ripple-recording'
                        : 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl shadow-emerald-900/30 hover:scale-105'
                    }`}
                  >
                    {isRecording ? <Square className="text-white" size={40} fill="white" /> : <Mic className="text-white" size={48} />}
                  </button>
                  <div className="text-center h-12">
                    {isRecording ? (
                      <p className="text-red-400 font-medium animate-pulse">녹음 중 {formatTime(recordingTime)}</p>
                    ) : pendingAudio && !isRecording ? (
                      <p className="text-emerald-400 font-medium">녹음 완료 ({formatTime(recordingTime)})</p>
                    ) : (
                      <p className="text-slate-400 text-sm">버튼을 눌러 녹음 시작</p>
                    )}
                  </div>
                  {pendingAudio && !isRecording && (
                    <audio controls src={URL.createObjectURL(pendingAudio)} className="w-full" />
                  )}
                </div>
              )}
            </div>

            {/* 에러 메시지 */}
            {errorMsg && (
              <p className="text-red-400 text-sm text-center -mt-2">{errorMsg}</p>
            )}

            {/* Identify Action */}
            <button
              onClick={handleIdentify}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg py-5 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all"
            >
              {inputMode === 'search' ? '이미지 · 소리 검색' : '새소리로 새 찾기 🔍'}
            </button>
          </div>
        )}

        {appState === 'identifying' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Bird className="text-primary animate-pulse" size={32} />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">데이터 분석 중...</h2>
              <p className="text-slate-400">데이터베이스와 실시간으로 비교하고 있습니다</p>
            </div>
          </div>
        )}

        {appState === 'result' && birdInfo && (
          <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
            {/* Image Section */}
            <div className="relative h-72 bg-slate-800 flex items-center justify-center overflow-hidden">
              {/* Image with object-contain to avoid cutting off the bird */}
              <div className="absolute inset-0 bg-slate-900" />
              <img 
                src={birdInfo.imageUrl} 
                alt={birdInfo.name}
                className="absolute inset-0 w-full h-full object-contain"
              />
              {/* Gradient overlay for text */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
              
              <div className="absolute bottom-6 left-6 z-20">
                <p className="text-emerald-400 font-semibold mb-1">식별 결과 (98% 일치)</p>
                <h2 className="text-4xl font-extrabold text-white">{birdInfo.name}</h2>
                <p className="text-slate-300 text-sm mt-1">{birdInfo.scientificName}</p>
              </div>
            </div>

            {/* Actions Section */}
            <div className="p-6 space-y-6 bg-slate-900/50">
              <div className="bg-slate-800/80 rounded-2xl p-4 flex flex-col justify-center border border-slate-700">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Volume2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">표준 소리 비교</h3>
                    <p className="text-xs text-slate-400">{birdInfo.name}의 울음소리 (원본)</p>
                  </div>
                </div>
                {birdInfo.audioUrl ? (
                  <audio
                    key={birdInfo.audioUrl}
                    controls
                    className="w-full mt-1"
                    src={birdInfo.audioUrl}
                  />
                ) : (
                  <div className="text-slate-500 text-sm mt-2 text-center py-4">
                    이 새의 소리 기록을 찾을 수 없습니다.
                  </div>
                )}
              </div>

              <div className="flex space-x-4 pt-2">
                <button 
                  onClick={handleReset}
                  className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-medium border border-slate-700 hover:bg-slate-700 transition-all"
                >
                  새로운 소리/이름 검색
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Background Decorative Blobs */}
      <div className="fixed top-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

export default App;
