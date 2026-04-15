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
  // 참새목 - 박새과
  "박새": "Japanese tit",
  "진박새": "Coal tit",
  "쇠박새": "Marsh tit",
  "곤줄박이": "Varied tit",
  "오목눈이": "Long-tailed tit",
  // 참새목 - 참새과
  "참새": "Eurasian tree sparrow",
  // 참새목 - 되새과
  "방울새": "Grey-capped greenfinch",
  "홍방울새": "Common redpoll",
  "검은머리방울새": "Eurasian siskin",
  "콩새": "Hawfinch",
  "밀화부리": "Yellow-billed grosbeak",
  "큰부리밀화부리": "Japanese grosbeak",
  "잣새": "Common crossbill",
  "되새": "Brambling",
  // 참새목 - 멧새과
  "멧새": "Meadow bunting",
  "노랑턱멧새": "Yellow-throated bunting",
  "쑥새": "Rustic bunting",
  "촉새": "Black-faced bunting",
  "검은머리쑥새": "Yellow-breasted bunting",
  "붉은뺨멧새": "Chestnut-eared bunting",
  "흰배멧새": "Tristram's bunting",
  // 참새목 - 딱새과·솔딱새과
  "딱새": "Daurian redstart",
  "검은딱새": "Siberian stonechat",
  "울새": "Rufous-tailed robin",
  "유리딱새": "Red-flanked bluetail",
  "큰유리새": "Siberian blue robin",
  "솔딱새": "Dark-sided flycatcher",
  "황금새": "Narcissus flycatcher",
  "흰눈썹황금새": "Yellow-rumped flycatcher",
  "긴꼬리딱새": "Black paradise flycatcher",
  // 참새목 - 지빠귀과
  "지빠귀": "Naumann's thrush",
  "노랑지빠귀": "Naumann's thrush",
  "흰배지빠귀": "Pale thrush",
  "개똥지빠귀": "Dusky thrush",
  "흰눈썹지빠귀": "Eyebrowed thrush",
  // 참새목 - 휘파람새과·개개비과
  "휘파람새": "Japanese bush warbler",
  "개개비": "Oriental reed warbler",
  "산솔새": "Eastern crowned warbler",
  "솔새": "Arctic warbler",
  // 참새목 - 동박새과·찌르레기과
  "직박구리": "Brown-eared bulbul",
  "찌르레기": "White-cheeked starling",
  // 참새목 - 할미새과
  "백할미새": "White wagtail",
  "노랑할미새": "Grey wagtail",
  "알락할미새": "Japanese wagtail",
  "힝둥새": "Olive-backed pipit",
  // 참새목 - 때까치과
  "때까치": "Bull-headed shrike",
  "노랑때까치": "Brown shrike",
  // 참새목 - 까마귀과
  "까치": "Eurasian magpie",
  "물까치": "Azure-winged magpie",
  "어치": "Eurasian jay",
  "까마귀": "Carrion crow",
  "떼까마귀": "Rook",
  "갈까마귀": "Daurian jackdaw",
  "큰까마귀": "Common raven",
  // 참새목 - 동고비과·굴뚝새과·물까마귀과
  "동고비": "Eurasian nuthatch",
  "굴뚝새": "Eurasian wren",
  "물까마귀": "Brown dipper",
  // 참새목 - 상모솔새과·여새과
  "상모솔새": "Goldcrest",
  "황여새": "Bohemian waxwing",
  "홍여새": "Japanese waxwing",
  // 참새목 - 제비과
  "제비": "Barn swallow",
  "귀제비": "Red-rumped swallow",
  "흰털발제비": "Common house martin",
  // 참새목 - 종다리과
  "종다리": "Eurasian skylark",
  // 참새목 - 꾀꼬리과·붉은머리오목눈이과
  "꾀꼬리": "Black-naped oriole",
  "붉은머리오목눈이": "Vinous-throated parrotbill",
  // 딱다구리목
  "쇠딱다구리": "Pygmy woodpecker",
  "오색딱다구리": "Great spotted woodpecker",
  "큰오색딱다구리": "White-backed woodpecker",
  "청딱다구리": "Grey-headed woodpecker",
  "까막딱다구리": "Black woodpecker",
  "개미잡이": "Eurasian wryneck",
  // 파랑새목·물총새목·후투티목
  "물총새": "Common kingfisher",
  "청호반새": "White-throated kingfisher",
  "호반새": "Ruddy kingfisher",
  "파랑새": "Blue-and-white flycatcher",
  "후투티": "Eurasian hoopoe",
  // 칼새목
  "칼새": "Pacific swift",
  // 두견이목
  "뻐꾸기": "Common cuckoo",
  "두견이": "Lesser cuckoo",
  "벙어리뻐꾸기": "Oriental cuckoo",
  "검은등뻐꾸기": "Indian cuckoo",
  // 올빼미목
  "소쩍새": "Oriental scops owl",
  "큰소쩍새": "Collared scops owl",
  "수리부엉이": "Eurasian eagle-owl",
  "부엉이": "Long-eared owl",
  "쇠부엉이": "Short-eared owl",
  "올빼미": "Ural owl",
  "솔부엉이": "Northern boobook",
  // 매목
  "매": "Peregrine falcon",
  "황조롱이": "Common kestrel",
  "새호리기": "Eurasian hobby",
  // 수리목
  "독수리": "Cinereous vulture",
  "검독수리": "Golden eagle",
  "흰꼬리수리": "White-tailed eagle",
  "참수리": "Steller's sea eagle",
  "솔개": "Black kite",
  "참매": "Northern goshawk",
  "새매": "Eurasian sparrowhawk",
  "조롱이": "Japanese sparrowhawk",
  "붉은배새매": "Chinese sparrowhawk",
  "말똥가리": "Common buzzard",
  "개구리매": "Eastern marsh harrier",
  "잿빛개구리매": "Hen harrier",
  "알락개구리매": "Pied harrier",
  // 두루미목
  "두루미": "Red-crowned crane",
  "재두루미": "White-naped crane",
  "흑두루미": "Hooded crane",
  "검은목두루미": "Common crane",
  // 황새목
  "황새": "Oriental stork",
  "저어새": "Black-faced spoonbill",
  "노랑부리저어새": "Eurasian spoonbill",
  "따오기": "Crested ibis",
  // 사다새목
  "왜가리": "Grey heron",
  "중대백로": "Great egret",
  "백로": "Little egret",
  "노랑부리백로": "Chinese egret",
  "황로": "Cattle egret",
  "해오라기": "Black-crowned night heron",
  "덤불해오라기": "Yellow bittern",
  "알락해오라기": "Eurasian bittern",
  "검은댕기해오라기": "Striated heron",
  "가마우지": "Japanese cormorant",
  "민물가마우지": "Great cormorant",
  // 기러기목
  "고니": "Tundra swan",
  "큰고니": "Whooper swan",
  "기러기": "Bean goose",
  "개리": "Swan goose",
  "쇠기러기": "Greater white-fronted goose",
  "흑기러기": "Brant",
  "청둥오리": "Mallard",
  "오리": "Mallard",
  "흰뺨검둥오리": "Eastern spot-billed duck",
  "원앙": "Mandarin duck",
  "가창오리": "Baikal teal",
  "쇠오리": "Eurasian teal",
  "고방오리": "Northern pintail",
  "넓적부리": "Northern shoveler",
  "알락오리": "Gadwall",
  "청머리오리": "Eurasian wigeon",
  "흰죽지": "Common pochard",
  "댕기흰죽지": "Tufted duck",
  "비오리": "Common merganser",
  "혹부리오리": "Common shelduck",
  "황오리": "Ruddy shelduck",
  // 도요목 - 물떼새과
  "검은머리물떼새": "Eurasian oystercatcher",
  "꼬마물떼새": "Little ringed plover",
  "흰물떼새": "Kentish plover",
  "댕기물떼새": "Northern lapwing",
  // 도요목 - 도요과
  "마도요": "Eurasian curlew",
  "중부리도요": "Whimbrel",
  "알락꼬리마도요": "Far Eastern curlew",
  "청다리도요": "Common greenshank",
  "삑삑도요": "Common sandpiper",
  "민물도요": "Dunlin",
  // 갈매기목
  "갈매기": "Common gull",
  "괭이갈매기": "Black-tailed gull",
  "재갈매기": "Herring gull",
  "붉은부리갈매기": "Black-headed gull",
  "제비갈매기": "Common tern",
  "쇠제비갈매기": "Little tern",
  // 비둘기목
  "비둘기": "Rock pigeon",
  "멧비둘기": "Oriental turtle dove",
  // 닭목
  "꿩": "Common pheasant",
  "메추라기": "Japanese quail",
  // 논병아리목·쏙독새목
  "논병아리": "Little grebe",
  "뿔논병아리": "Great crested grebe",
  "쏙독새": "Grey nightjar",
  // 두루미목 - 뜸부기과
  "물닭": "Eurasian coot",
  "쇠물닭": "Common moorhen",
  "뜸부기": "Watercock",
};

// 한국어 새 이름 → 학명
const KOREAN_TO_SCIENTIFIC: Record<string, string> = {
  // 참새목 - 박새과
  "박새": "Parus minor",
  "진박새": "Periparus ater",
  "쇠박새": "Poecile palustris",
  "곤줄박이": "Sittiparus varius",
  "오목눈이": "Aegithalos caudatus",
  // 참새목 - 참새과
  "참새": "Passer montanus",
  // 참새목 - 되새과
  "방울새": "Chloris sinica",
  "홍방울새": "Acanthis flammea",
  "검은머리방울새": "Spinus spinus",
  "콩새": "Coccothraustes coccothraustes",
  "밀화부리": "Eophona migratoria",
  "큰부리밀화부리": "Eophona personata",
  "잣새": "Loxia curvirostra",
  "되새": "Fringilla montifringilla",
  // 참새목 - 멧새과
  "멧새": "Emberiza cioides",
  "노랑턱멧새": "Emberiza elegans",
  "쑥새": "Emberiza rustica",
  "촉새": "Emberiza spodocephala",
  "검은머리쑥새": "Emberiza aureola",
  "붉은뺨멧새": "Emberiza fucata",
  "흰배멧새": "Emberiza tristrami",
  // 참새목 - 딱새과·솔딱새과
  "딱새": "Phoenicurus auroreus",
  "검은딱새": "Saxicola maurus",
  "울새": "Luscinia sibilans",
  "유리딱새": "Tarsiger cyanurus",
  "큰유리새": "Larvivora cyane",
  "솔딱새": "Muscicapa sibirica",
  "황금새": "Ficedula narcissina",
  "흰눈썹황금새": "Ficedula zanthopygia",
  "긴꼬리딱새": "Terpsiphone atrocaudata",
  // 참새목 - 지빠귀과
  "지빠귀": "Turdus naumanni",
  "노랑지빠귀": "Turdus naumanni",
  "흰배지빠귀": "Turdus pallidus",
  "개똥지빠귀": "Turdus eunomus",
  "흰눈썹지빠귀": "Turdus obscurus",
  // 참새목 - 휘파람새과·개개비과
  "휘파람새": "Horornis diphone",
  "개개비": "Acrocephalus orientalis",
  "산솔새": "Phylloscopus coronatus",
  "솔새": "Phylloscopus borealis",
  // 참새목 - 동박새과·찌르레기과
  "직박구리": "Hypsipetes amaurotis",
  "찌르레기": "Spodiopsar cineraceus",
  // 참새목 - 할미새과
  "백할미새": "Motacilla alba",
  "노랑할미새": "Motacilla cinerea",
  "알락할미새": "Motacilla lugens",
  "힝둥새": "Anthus hodgsoni",
  // 참새목 - 때까치과
  "때까치": "Lanius bucephalus",
  "노랑때까치": "Lanius cristatus",
  // 참새목 - 까마귀과
  "까치": "Pica pica",
  "물까치": "Cyanopica cyanus",
  "어치": "Garrulus glandarius",
  "까마귀": "Corvus corone",
  "떼까마귀": "Corvus frugilegus",
  "갈까마귀": "Corvus dauuricus",
  "큰까마귀": "Corvus corax",
  // 참새목 - 동고비과·굴뚝새과·물까마귀과
  "동고비": "Sitta europaea",
  "굴뚝새": "Troglodytes troglodytes",
  "물까마귀": "Cinclus pallasii",
  // 참새목 - 상모솔새과·여새과
  "상모솔새": "Regulus regulus",
  "황여새": "Bombycilla garrulus",
  "홍여새": "Bombycilla japonica",
  // 참새목 - 제비과
  "제비": "Hirundo rustica",
  "귀제비": "Cecropis daurica",
  "흰털발제비": "Delichon urbicum",
  // 참새목 - 종다리과
  "종다리": "Alauda arvensis",
  // 참새목 - 꾀꼬리과·붉은머리오목눈이과
  "꾀꼬리": "Oriolus chinensis",
  "붉은머리오목눈이": "Sinosuthora webbiana",
  // 딱다구리목
  "쇠딱다구리": "Dendrocopos kizuki",
  "오색딱다구리": "Dendrocopos major",
  "큰오색딱다구리": "Dendrocopos leucotos",
  "청딱다구리": "Picus canus",
  "까막딱다구리": "Dryocopus martius",
  "개미잡이": "Jynx torquilla",
  // 파랑새목·물총새목·후투티목
  "물총새": "Alcedo atthis",
  "청호반새": "Halcyon smyrnensis",
  "호반새": "Halcyon coromanda",
  "파랑새": "Cyanoptila cyanomelana",
  "후투티": "Upupa epops",
  // 칼새목
  "칼새": "Apus pacificus",
  // 두견이목
  "뻐꾸기": "Cuculus canorus",
  "두견이": "Cuculus poliocephalus",
  "벙어리뻐꾸기": "Cuculus optatus",
  "검은등뻐꾸기": "Cuculus micropterus",
  // 올빼미목
  "소쩍새": "Otus sunia",
  "큰소쩍새": "Otus lettia",
  "수리부엉이": "Bubo bubo",
  "부엉이": "Asio otus",
  "쇠부엉이": "Asio flammeus",
  "올빼미": "Strix uralensis",
  "솔부엉이": "Ninox japonica",
  // 매목
  "매": "Falco peregrinus",
  "황조롱이": "Falco tinnunculus",
  "새호리기": "Falco subbuteo",
  // 수리목
  "독수리": "Aegypius monachus",
  "검독수리": "Aquila chrysaetos",
  "흰꼬리수리": "Haliaeetus albicilla",
  "참수리": "Haliaeetus pelagicus",
  "솔개": "Milvus migrans",
  "참매": "Accipiter gentilis",
  "새매": "Accipiter nisus",
  "조롱이": "Accipiter gularis",
  "붉은배새매": "Accipiter soloensis",
  "말똥가리": "Buteo buteo",
  "개구리매": "Circus spilonotus",
  "잿빛개구리매": "Circus cyaneus",
  "알락개구리매": "Circus melanoleucos",
  // 두루미목
  "두루미": "Grus japonensis",
  "재두루미": "Antigone vipio",
  "흑두루미": "Grus monacha",
  "검은목두루미": "Grus grus",
  // 황새목
  "황새": "Ciconia boyciana",
  "저어새": "Platalea minor",
  "노랑부리저어새": "Platalea leucorodia",
  "따오기": "Nipponia nippon",
  // 사다새목
  "왜가리": "Ardea cinerea",
  "중대백로": "Ardea alba",
  "백로": "Egretta garzetta",
  "노랑부리백로": "Egretta eulophotes",
  "황로": "Bubulcus ibis",
  "해오라기": "Nycticorax nycticorax",
  "덤불해오라기": "Ixobrychus sinensis",
  "알락해오라기": "Botaurus stellaris",
  "검은댕기해오라기": "Butorides striata",
  "가마우지": "Phalacrocorax capillatus",
  "민물가마우지": "Phalacrocorax carbo",
  // 기러기목
  "고니": "Cygnus columbianus",
  "큰고니": "Cygnus cygnus",
  "기러기": "Anser fabalis",
  "개리": "Anser cygnoid",
  "쇠기러기": "Anser albifrons",
  "흑기러기": "Branta bernicla",
  "청둥오리": "Anas platyrhynchos",
  "오리": "Anas platyrhynchos",
  "흰뺨검둥오리": "Anas zonorhyncha",
  "원앙": "Aix galericulata",
  "가창오리": "Sibirionetta formosa",
  "쇠오리": "Anas crecca",
  "고방오리": "Anas acuta",
  "넓적부리": "Spatula clypeata",
  "알락오리": "Mareca strepera",
  "청머리오리": "Mareca penelope",
  "흰죽지": "Aythya ferina",
  "댕기흰죽지": "Aythya fuligula",
  "비오리": "Mergus merganser",
  "혹부리오리": "Tadorna tadorna",
  "황오리": "Tadorna ferruginea",
  // 도요목 - 물떼새과
  "검은머리물떼새": "Haematopus ostralegus",
  "꼬마물떼새": "Charadrius dubius",
  "흰물떼새": "Charadrius alexandrinus",
  "댕기물떼새": "Vanellus vanellus",
  // 도요목 - 도요과
  "마도요": "Numenius arquata",
  "중부리도요": "Numenius phaeopus",
  "알락꼬리마도요": "Numenius madagascariensis",
  "청다리도요": "Tringa nebularia",
  "삑삑도요": "Actitis hypoleucos",
  "민물도요": "Calidris alpina",
  // 갈매기목
  "갈매기": "Larus canus",
  "괭이갈매기": "Larus crassirostris",
  "재갈매기": "Larus argentatus",
  "붉은부리갈매기": "Chroicocephalus ridibundus",
  "제비갈매기": "Sterna hirundo",
  "쇠제비갈매기": "Sternula albifrons",
  // 비둘기목
  "비둘기": "Columba livia",
  "멧비둘기": "Streptopelia orientalis",
  // 닭목
  "꿩": "Phasianus colchicus",
  "메추라기": "Coturnix japonica",
  // 논병아리목·쏙독새목
  "논병아리": "Tachybaptus ruficollis",
  "뿔논병아리": "Podiceps cristatus",
  "쏙독새": "Caprimulgus jotaka",
  // 두루미목 - 뜸부기과
  "물닭": "Fulica atra",
  "쇠물닭": "Gallinula chloropus",
  "뜸부기": "Gallicrex cinerea",
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
