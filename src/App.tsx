import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Search, Volume2, Bird, ChevronLeft, ChevronRight } from 'lucide-react';

type AppState = 'idle' | 'searching' | 'result';

interface BirdInfo {
  name: string;
  scientificName: string;
  imageUrls: string[];
  audioUrls: string[];
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

// 한국어 새 이름 → 학명
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

function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [searchText, setSearchText] = useState('');
  const [birdInfo, setBirdInfo] = useState<BirdInfo | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const searchData = async (query: string): Promise<BirdInfo> => {
    const fallbackImage = "https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=800&auto=format&fit=crop";
    const scientificName = KOREAN_TO_SCIENTIFIC[query] ?? query;
    const englishName = KOREAN_TO_ENGLISH[query] ?? '';
    const displayName = [englishName, scientificName !== query ? scientificName : '']
      .filter(Boolean).join(' · ') || '조류 데이터';

    const resultInfo: BirdInfo = {
      name: query || "알 수 없음",
      scientificName: displayName,
      imageUrls: [fallbackImage],
      audioUrls: [],
    };

    if (!query.trim()) return resultInfo;

    // iNaturalist(사진/소리) + 위키피디아 + Wikimedia Commons 병렬 요청
    const [wikiData, inatPhotoData, inatSoundData, commonsData] = await Promise.all([
      fetch(`https://ko.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(query)}&format=json&pithumbsize=800&origin=*`)
        .then(r => r.json()).catch(() => null),
      fetch(`https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(scientificName)}&photos=true&per_page=20&order_by=votes`)
        .then(r => r.json()).catch(() => null),
      fetch(`https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(scientificName)}&sounds=true&per_page=5&order_by=votes`)
        .then(r => r.json()).catch(() => null),
      fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(scientificName)}&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json&origin=*&gsrlimit=12`)
        .then(r => r.json()).catch(() => null),
    ]);

    // --- 이미지 수집 ---
    const imageUrls: string[] = [];

    // 1. 한국 위키피디아 썸네일
    const imgPages = wikiData?.query?.pages;
    if (imgPages) {
      const pageId = Object.keys(imgPages)[0];
      if (pageId !== "-1" && imgPages[pageId].thumbnail?.source) {
        imageUrls.push(imgPages[pageId].thumbnail.source);
      }
    }

    // 2. iNaturalist 관찰 사진 (square → medium으로 교체해 품질 향상)
    type InatPhoto = { url?: string };
    type InatObs = { photos?: InatPhoto[]; sounds?: { file_url?: string }[] };
    const inatPhotos = (inatPhotoData?.results as InatObs[] ?? [])
      .flatMap(obs => obs.photos ?? [])
      .map(p => p.url?.replace('/square.', '/medium.'))
      .filter((url): url is string => !!url);
    imageUrls.push(...inatPhotos.slice(0, 8));

    // 3. Wikimedia Commons 검색 결과 (SVG·오디오 파일 제외)
    const commonsPages = commonsData?.query?.pages;
    if (commonsPages) {
      const skipExt = /\.(svg|ogg|oga|mp3|wav|flac|webm|ogv|mp4)$/i;
      for (const page of Object.values(commonsPages) as { imageinfo?: { url: string }[] }[]) {
        const url = page.imageinfo?.[0]?.url;
        if (url && !skipExt.test(url)) imageUrls.push(url);
      }
    }

    // 중복 제거 후 최대 12장
    const unique = [...new Set(imageUrls)].slice(0, 12);
    resultInfo.imageUrls = unique.length > 0 ? unique : [fallbackImage];

    // --- 소리 수집 (최대 3개) ---
    resultInfo.audioUrls = (inatSoundData?.results as InatObs[] ?? [])
      .flatMap(obs => obs.sounds ?? [])
      .map(s => s.file_url)
      .filter((url): url is string => !!url)
      .slice(0, 3);

    return resultInfo;
  };

  const handleSearch = async () => {
    const target = searchText.trim();
    if (!target) return;
    setErrorMsg('');
    setAppState('searching');
    setSelectedImageIdx(0);
    try {
      const info = await searchData(target);
      setBirdInfo(info);
      setAppState('result');
    } catch {
      setErrorMsg('검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setAppState('idle');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleReset = () => {
    setAppState('idle');
    setSearchText('');
    setBirdInfo(null);
    setSelectedImageIdx(0);
    setErrorMsg('');
  };

  const prevImage = () => setSelectedImageIdx(i => Math.max(0, i - 1));
  const nextImage = () =>
    setSelectedImageIdx(i => Math.min((birdInfo?.imageUrls.length ?? 1) - 1, i + 1));

  return (
    <div className="min-h-screen pt-4 pb-20 px-4 md:px-0 md:max-w-md mx-auto relative flex flex-col">
      {/* Header */}
      <header className="flex items-center py-6">
        <div className="flex items-center space-x-2 text-primary">
          <Bird size={32} strokeWidth={2.5} />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
            Birdsong
          </h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col space-y-6 mt-4">

        {/* 검색 패널 */}
        {appState === 'idle' && (
          <div className="glass-panel rounded-3xl p-6 flex flex-col space-y-6 shadow-2xl">
            <p className="text-slate-400 text-sm text-center">새 이름을 입력하면 사진과 소리를 찾아드립니다</p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="예: 딱새, 참새, 오목눈이..."
                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-primary text-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-slate-500"
                autoFocus
              />
            </div>
            {errorMsg && (
              <p className="text-red-400 text-sm text-center">{errorMsg}</p>
            )}
            <button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg py-5 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all"
            >
              사진 · 소리 검색
            </button>
          </div>
        )}

        {/* 로딩 */}
        {appState === 'searching' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-slate-700 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Bird className="text-primary animate-pulse" size={32} />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">검색 중...</h2>
              <p className="text-slate-400">사진과 소리를 모으고 있습니다</p>
            </div>
          </div>
        )}

        {/* 결과 */}
        {appState === 'result' && birdInfo && (
          <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl animate-fade-in">

            {/* 메인 이미지 + 네비게이션 */}
            <div className="relative h-72 bg-slate-900 flex items-center justify-center overflow-hidden">
              <img
                key={birdInfo.imageUrls[selectedImageIdx]}
                src={birdInfo.imageUrls[selectedImageIdx]}
                alt={birdInfo.name}
                className="absolute inset-0 w-full h-full object-contain"
                onError={() => {
                  // 이미지 로드 실패 시 다음 이미지로 이동
                  const next = selectedImageIdx + 1;
                  if (next < birdInfo.imageUrls.length) setSelectedImageIdx(next);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent z-10" />

              {/* 이전/다음 버튼 */}
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

              {/* 이미지 카운터 */}
              {birdInfo.imageUrls.length > 1 && (
                <div className="absolute top-3 right-4 z-20 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {selectedImageIdx + 1} / {birdInfo.imageUrls.length}
                </div>
              )}

              {/* 새 이름 */}
              <div className="absolute bottom-5 left-5 z-20">
                <h2 className="text-4xl font-extrabold text-white">{birdInfo.name}</h2>
                <p className="text-slate-300 text-sm mt-1">{birdInfo.scientificName}</p>
              </div>
            </div>

            {/* 썸네일 스트립 */}
            {birdInfo.imageUrls.length > 1 && (
              <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-slate-900/80 scrollbar-hide">
                {birdInfo.imageUrls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      idx === selectedImageIdx ? 'border-emerald-400 scale-105' : 'border-transparent opacity-60 hover:opacity-90'
                    }`}
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* 소리 섹션 */}
            <div className="p-5 space-y-3 bg-slate-900/50">
              {birdInfo.audioUrls.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                    <Volume2 size={18} />
                    <span className="font-semibold text-sm">울음소리</span>
                    <span className="text-slate-500 text-xs">({birdInfo.audioUrls.length}개)</span>
                  </div>
                  {birdInfo.audioUrls.map((url, idx) => (
                    <div key={idx} className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-2">소리 {idx + 1}</p>
                      <audio controls className="w-full" src={url} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 text-center">
                  <Volume2 className="text-slate-600 mx-auto mb-2" size={24} />
                  <p className="text-slate-500 text-sm">소리 기록을 찾을 수 없습니다</p>
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full mt-2 py-4 bg-slate-800 text-white rounded-xl font-medium border border-slate-700 hover:bg-slate-700 transition-all"
              >
                다시 검색
              </button>
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
