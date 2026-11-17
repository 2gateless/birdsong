export type BirdHabitat = 'mountain' | 'water' | 'field' | 'urban';
export type BirdSeason = 'resident' | 'summer' | 'winter' | 'passage';

export interface BirdEntry {
  korean: string;
  english: string;
  scientific: string;
  habitat: BirdHabitat;
  season?: BirdSeason;
  hikingCommon?: boolean;
  /** 울음소리 특징 묘사 (산행 중 귀로 구분할 때 참고) */
  callDescription?: string;
  /** 소리 특징 태그 */
  soundTags?: string[];
  /** 주요 울음소리 주파수 범위 [minHz, maxHz] */
  freqRangeHz?: [number, number];
}

// 산행 중 자주 듣는 새 & 주요 한국 조류 메타데이터
const FEATURED_BIRDS: BirdEntry[] = [
  // 박새과 (산행 최다 빈도)
  {
    korean: '박새',
    english: 'Japanese tit',
    scientific: 'Parus minor',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"삐삐- 찌지배" 또는 "치치- 페에" 맑고 경쾌한 2~3음절 반복',
    soundTags: ['반복', '맑음', '고음', '산새'],
    freqRangeHz: [2800, 7500],
  },
  {
    korean: '진박새',
    english: 'Coal tit',
    scientific: 'Periparus ater',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"삐-쭈, 삐-쭈" 박새보다 가늘고 높은 금속성 2음절 반복',
    soundTags: ['고음', '반복', '침엽수', '산새'],
    freqRangeHz: [3500, 8200],
  },
  {
    korean: '쇠박새',
    english: 'Marsh tit',
    scientific: 'Poecile palustris',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"치-치- 쟈쟈쟈" 거친 비음 섞인 끝음절',
    soundTags: ['거친소리', '반복', '산새'],
    freqRangeHz: [2400, 7000],
  },
  {
    korean: '곤줄박이',
    english: 'Varied tit',
    scientific: 'Sittiparus varius',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"삐-삐-삐-" 느리고 맑은 휘파람형 또는 "찌찌찌" 콧소리',
    soundTags: ['휘파람', '맑음', '산새'],
    freqRangeHz: [2200, 6200],
  },
  {
    korean: '오목눈이',
    english: 'Long-tailed tit',
    scientific: 'Aegithalos caudatus',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"찌리리리" 가늘고 높은 무리 지저귐',
    soundTags: ['고음', '무리', '지저귐', '산새'],
    freqRangeHz: [4200, 8800],
  },
  // 딱다구리류 (산행 중 드러밍/단음)
  {
    korean: '쇠딱다구리',
    english: 'Pygmy woodpecker',
    scientific: 'Dendrocopos kizuki',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"기-익, 기-익" 날카로운 소리 및 빠른 나무 두드리기(드러밍)',
    soundTags: ['드러밍', '날카로움', '산새'],
    freqRangeHz: [1800, 5800],
  },
  {
    korean: '오색딱다구리',
    english: 'Great spotted woodpecker',
    scientific: 'Dendrocopos major',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"키옥!" 짧고 강렬한 금속성 단음과 힘찬 드러밍',
    soundTags: ['드러밍', '단음', '산새'],
    freqRangeHz: [1500, 5500],
  },
  {
    korean: '청딱다구리',
    english: 'Grey-headed woodpecker',
    scientific: 'Picus canus',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"삐-삐-삐-삐-" 하강하는 웃음소리 같은 큰 울음',
    soundTags: ['하강음', '큰소리', '산새'],
    freqRangeHz: [1400, 4200],
  },
  {
    korean: '까막딱다구리',
    english: 'Black woodpecker',
    scientific: 'Dryocopus martius',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"크르르르~" 비행 중 굴러가는 소리와 "클리이-" 큰 단음',
    soundTags: ['드러밍', '큰소리', '저음'],
    freqRangeHz: [900, 3500],
  },
  // 산림 대표 명금류
  {
    korean: '휘파람새',
    english: 'Japanese bush warbler',
    scientific: 'Horornis diphone',
    habitat: 'mountain',
    season: 'summer',
    hikingCommon: true,
    callDescription: '"호-호- 호케키요!" 길게 끌다가 꺾어지는 맑은 휘파람',
    soundTags: ['휘파람', '맑음', '여름산새'],
    freqRangeHz: [1800, 5500],
  },
  {
    korean: '동고비',
    english: 'Eurasian nuthatch',
    scientific: 'Sitta europaea',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"휘-휘-휘-" 맑고 통통 튀는 휘파람과 "튓튓" 지저귐',
    soundTags: ['휘파람', '반복', '산새'],
    freqRangeHz: [2000, 5600],
  },
  {
    korean: '굴뚝새',
    english: 'Eurasian wren',
    scientific: 'Troglodytes troglodytes',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '작은 체구에 비해 매우 크고 복잡한 트릴 연주 ("찌리리리-삐리리-")',
    soundTags: ['트릴', '지저귐', '계곡', '산새'],
    freqRangeHz: [2500, 7800],
  },
  {
    korean: '직박구리',
    english: 'Brown-eared bulbul',
    scientific: 'Hypsipetes amaurotis',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"삐-익! 삐-익!" 시끄럽고 날카로운 단음 연속',
    soundTags: ['날카로움', '큰소리', '도시/산'],
    freqRangeHz: [1800, 5400],
  },
  {
    korean: '어치',
    english: 'Eurasian jay',
    scientific: 'Garrulus glandarius',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"까악- 까악-" 거칠고 쉰 경계음 (가끔 다른 새 흉내)',
    soundTags: ['거친소리', '큰소리', '산새'],
    freqRangeHz: [900, 3800],
  },
  {
    korean: '딱새',
    english: 'Daurian redstart',
    scientific: 'Phoenicurus auroreus',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"히- 딱딱!" 부싯돌 부딪히는 듯한 딱딱 소리',
    soundTags: ['딱딱', '고음', '산새'],
    freqRangeHz: [2400, 7200],
  },
  {
    korean: '노랑턱멧새',
    english: 'Yellow-throated bunting',
    scientific: 'Emberiza elegans',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"찌릿, 찌릿" 짧은 지저귐과 부드러운 노랫소리',
    soundTags: ['지저귐', '맑음', '산새'],
    freqRangeHz: [2800, 7400],
  },
  {
    korean: '멧비둘기',
    english: 'Oriental turtle dove',
    scientific: 'Streptopelia orientalis',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"구구- 구우-" 낮고 부드러운 4박자 울음',
    soundTags: ['저음', '반복', '비둘기'],
    freqRangeHz: [350, 950],
  },
  {
    korean: '뻐꾸기',
    english: 'Common cuckoo',
    scientific: 'Cuculus canorus',
    habitat: 'mountain',
    season: 'summer',
    hikingCommon: true,
    callDescription: '"뻐꾹, 뻐꾹" 2음절의 크고 또렷한 여름 산 울음',
    soundTags: ['2음절', '저음', '여름산새'],
    freqRangeHz: [500, 1200],
  },
  {
    korean: '두견이',
    english: 'Lesser cuckoo',
    scientific: 'Cuculus poliocephalus',
    habitat: 'mountain',
    season: 'summer',
    hikingCommon: true,
    callDescription: '"쪽박 바꿔줘(삐-삐-삐비빅)" 빠른 5~6음절 리듬',
    soundTags: ['리듬', '여름산새', '야간/새벽'],
    freqRangeHz: [900, 2400],
  },
  {
    korean: '벙어리뻐꾸기',
    english: 'Oriental cuckoo',
    scientific: 'Cuculus optatus',
    habitat: 'mountain',
    season: 'summer',
    hikingCommon: true,
    callDescription: '"부우- 부우-" 낮게 울리는 북소리 같은 반복음',
    soundTags: ['저음', '반복', '여름산새'],
    freqRangeHz: [350, 850],
  },
  {
    korean: '검은등뻐꾸기',
    english: 'Indian cuckoo',
    scientific: 'Cuculus micropterus',
    habitat: 'mountain',
    season: 'summer',
    hikingCommon: true,
    callDescription: '"홀딱 벗고" 4음절로 내려가는 리드미컬한 울음',
    soundTags: ['4음절', '여름산새'],
    freqRangeHz: [650, 1800],
  },
  {
    korean: '꾀꼬리',
    english: 'Black-naped oriole',
    scientific: 'Oriolus chinensis',
    habitat: 'mountain',
    season: 'summer',
    hikingCommon: true,
    callDescription: '"꾀꼴- 꾀꼬리-" 플루트처럼 맑고 굵은 선율',
    soundTags: ['플루트', '맑음', '여름산새'],
    freqRangeHz: [1400, 3800],
  },
  {
    korean: '큰유리새',
    english: 'Blue-and-white flycatcher',
    scientific: 'Cyanoptila cyanomelana',
    habitat: 'mountain',
    season: 'summer',
    hikingCommon: true,
    callDescription: '계곡 숲에서 들리는 맑고 아름다운 음계 변화의 긴 노랫소리',
    soundTags: ['맑음', '선율', '계곡', '여름산새'],
    freqRangeHz: [2000, 6800],
  },
  {
    korean: '유리딱새',
    english: 'Red-flanked bluetail',
    scientific: 'Tarsiger cyanurus',
    habitat: 'mountain',
    season: 'winter',
    hikingCommon: true,
    callDescription: '"휫, 휫" 짧은 휘파람과 "구루룩" 낮은 소리',
    soundTags: ['휘파람', '겨울산새'],
    freqRangeHz: [2200, 6000],
  },
  {
    korean: '산솔새',
    english: 'Eastern crowned warbler',
    scientific: 'Phylloscopus coronatus',
    habitat: 'mountain',
    season: 'summer',
    hikingCommon: true,
    callDescription: '"찌-찌- 삐이!" 끝을 힘있게 올리는 반복 울음',
    soundTags: ['고음', '반복', '여름산새'],
    freqRangeHz: [3200, 7800],
  },
  {
    korean: '흰배지빠귀',
    english: 'Pale thrush',
    scientific: 'Turdus pallidus',
    habitat: 'mountain',
    season: 'summer',
    hikingCommon: true,
    callDescription: '"뾰로로- 삐-" 맑고 서정적인 숲속 노랫소리',
    soundTags: ['맑음', '선율', '산새'],
    freqRangeHz: [1800, 5200],
  },
  {
    korean: '호랑지빠귀',
    english: "White's thrush",
    scientific: 'Zoothera aurea',
    habitat: 'mountain',
    season: 'summer',
    hikingCommon: true,
    callDescription: '"히이- 호오-" 새벽/저녁 깊은 산속에서 들리는 쓸쓸한 휘파람',
    soundTags: ['휘파람', '고음', '깊은산'],
    freqRangeHz: [2200, 4200],
  },
  {
    korean: '소쩍새',
    english: 'Oriental scops owl',
    scientific: 'Otus sunia',
    habitat: 'mountain',
    season: 'summer',
    hikingCommon: true,
    callDescription: '"소쩍- 소쩍-" 또는 "소쩍다-" 야간/새벽 산행 시 들리는 맑은 울음',
    soundTags: ['야간', '반복', '올빼미'],
    freqRangeHz: [700, 1500],
  },
  {
    korean: '솔부엉이',
    english: 'Northern boobook',
    scientific: 'Ninox japonica',
    habitat: 'mountain',
    season: 'summer',
    hikingCommon: true,
    callDescription: '"호호- 호호-" 2음절이 규칙적으로 이어지는 저음 울음',
    soundTags: ['야간', '저음', '반복'],
    freqRangeHz: [450, 1000],
  },
  {
    korean: '꿩',
    english: 'Common pheasant',
    scientific: 'Phasianus colchicus',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"꿩- 꿩!" 날카로운 2음절 후 날개 퍼덕임(드러밍)',
    soundTags: ['큰소리', '산새'],
    freqRangeHz: [800, 3200],
  },
  {
    korean: '물까마귀',
    english: 'Brown dipper',
    scientific: 'Cinclus pallasii',
    habitat: 'water',
    season: 'resident',
    hikingCommon: true,
    callDescription: '계곡 물소리를 뚫고 들리는 날카로운 "지-익, 지-익"',
    soundTags: ['계곡', '날카로움'],
    freqRangeHz: [2600, 6800],
  },
  {
    korean: '노랑할미새',
    english: 'Grey wagtail',
    scientific: 'Motacilla cinerea',
    habitat: 'water',
    season: 'resident',
    hikingCommon: true,
    callDescription: '산간 계곡에서 날며 내는 "찌짓, 찌짓" 날카로운 비행음',
    soundTags: ['계곡', '고음'],
    freqRangeHz: [3200, 7200],
  },
  {
    korean: '큰부리까마귀',
    english: 'Large-billed crow',
    scientific: 'Corvus macrorhynchos',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"까악- 까악-" 굵고 탁한 큰 울음소리 (산정상·능선)',
    soundTags: ['저음', '큰소리', '거친소리'],
    freqRangeHz: [600, 2600],
  },
  {
    korean: '동박새',
    english: 'Warbling white-eye',
    scientific: 'Zosterops japonicus',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"찌이- 찌이-" 가늘고 고운 지저귐',
    soundTags: ['고음', '지저귐', '맑음'],
    freqRangeHz: [3200, 7600],
  },
  {
    korean: '방울새',
    english: 'Grey-capped greenfinch',
    scientific: 'Chloris sinica',
    habitat: 'field',
    season: 'resident',
    hikingCommon: true,
    callDescription: '"끼리리리- 찌익" 방울 굴러가는 듯한 비음 섞인 소리',
    soundTags: ['트릴', '지저귐'],
    freqRangeHz: [2400, 6800],
  },
  {
    korean: '붉은머리오목눈이',
    english: 'Vinous-throated parrotbill',
    scientific: 'Sinosuthora webbiana',
    habitat: 'mountain',
    season: 'resident',
    hikingCommon: true,
    callDescription: '산기슭 덤불에서 무리로 내는 "찌찌찌- 삣삣" 시끄러운 합창',
    soundTags: ['무리', '지저귐', '덤불'],
    freqRangeHz: [2600, 6800],
  },
  {
    korean: '쇠유리새',
    english: 'Siberian blue robin',
    scientific: 'Larvivora cyane',
    habitat: 'mountain',
    season: 'summer',
    hikingCommon: true,
    callDescription: '깊은 산 숲속에서 빠르게 반복되는 "치리리리- 치치치"',
    soundTags: ['트릴', '맑음', '여름산새'],
    freqRangeHz: [2600, 7400],
  },
  {
    korean: '파랑새',
    english: 'Oriental dollarbird',
    scientific: 'Eurystomus orientalis',
    habitat: 'mountain',
    season: 'summer',
    callDescription: '"객, 객, 객" 거칠고 쉰 듯한 연속음',
    soundTags: ['거친소리', '여름산새'],
    freqRangeHz: [1100, 3800],
  },
];

// 전체 한국 조류 매핑 테이블 (기존 전체 종 보존 + 오류 수정 + 추가 산새)
const RAW_BIRD_PAIRS: Array<[string, string, string, BirdHabitat?]> = [
  // 참새목 - 박새과
  ['박새', 'Japanese tit', 'Parus minor', 'mountain'],
  ['진박새', 'Coal tit', 'Periparus ater', 'mountain'],
  ['쇠박새', 'Marsh tit', 'Poecile palustris', 'mountain'],
  ['곤줄박이', 'Varied tit', 'Sittiparus varius', 'mountain'],
  ['오목눈이', 'Long-tailed tit', 'Aegithalos caudatus', 'mountain'],
  // 참새목 - 참새과
  ['참새', 'Eurasian tree sparrow', 'Passer montanus', 'urban'],
  // 참새목 - 되새과
  ['방울새', 'Grey-capped greenfinch', 'Chloris sinica', 'field'],
  ['홍방울새', 'Common redpoll', 'Acanthis flammea', 'mountain'],
  ['검은머리방울새', 'Eurasian siskin', 'Spinus spinus', 'mountain'],
  ['콩새', 'Hawfinch', 'Coccothraustes coccothraustes', 'mountain'],
  ['밀화부리', 'Yellow-billed grosbeak', 'Eophona migratoria', 'mountain'],
  ['큰부리밀화부리', 'Japanese grosbeak', 'Eophona personata', 'mountain'],
  ['잣새', 'Common crossbill', 'Loxia curvirostra', 'mountain'],
  ['되새', 'Brambling', 'Fringilla montifringilla', 'mountain'],
  ['멋쟁이새', 'Eurasian bullfinch', 'Pyrrhula pyrrhula', 'mountain'],
  ['양진이', "Pallas's rosefinch", 'Carpodacus roseus', 'mountain'],
  // 참새목 - 멧새과
  ['멧새', 'Meadow bunting', 'Emberiza cioides', 'mountain'],
  ['노랑턱멧새', 'Yellow-throated bunting', 'Emberiza elegans', 'mountain'],
  ['쑥새', 'Rustic bunting', 'Emberiza rustica', 'mountain'],
  ['촉새', 'Black-faced bunting', 'Emberiza spodocephala', 'field'],
  ['검은머리쑥새', 'Yellow-breasted bunting', 'Emberiza aureola', 'field'],
  ['붉은뺨멧새', 'Chestnut-eared bunting', 'Emberiza fucata', 'field'],
  ['흰배멧새', "Tristram's bunting", 'Emberiza tristrami', 'mountain'],
  // 참새목 - 딱새과·솔딱새과
  ['딱새', 'Daurian redstart', 'Phoenicurus auroreus', 'mountain'],
  ['검은딱새', 'Siberian stonechat', 'Saxicola maurus', 'field'],
  ['울새', 'Rufous-tailed robin', 'Larvivora sibilans', 'mountain'],
  ['유리딱새', 'Red-flanked bluetail', 'Tarsiger cyanurus', 'mountain'],
  ['쇠유리새', 'Siberian blue robin', 'Larvivora cyane', 'mountain'],
  ['큰유리새', 'Blue-and-white flycatcher', 'Cyanoptila cyanomelana', 'mountain'],
  ['솔딱새', 'Dark-sided flycatcher', 'Muscicapa sibirica', 'mountain'],
  ['황금새', 'Narcissus flycatcher', 'Ficedula narcissina', 'mountain'],
  ['흰눈썹황금새', 'Yellow-rumped flycatcher', 'Ficedula zanthopygia', 'mountain'],
  ['긴꼬리딱새', 'Japanese paradise flycatcher', 'Terpsiphone atrocaudata', 'mountain'],
  // 참새목 - 지빠귀과
  ['지빠귀', "Naumann's thrush", 'Turdus naumanni', 'mountain'],
  ['노랑지빠귀', "Naumann's thrush", 'Turdus naumanni', 'mountain'],
  ['흰배지빠귀', 'Pale thrush', 'Turdus pallidus', 'mountain'],
  ['개똥지빠귀', 'Dusky thrush', 'Turdus eunomus', 'mountain'],
  ['흰눈썹지빠귀', 'Eyebrowed thrush', 'Turdus obscurus', 'mountain'],
  ['호랑지빠귀', "White's thrush", 'Zoothera aurea', 'mountain'],
  ['되지빠귀', 'Grey-backed thrush', 'Turdus hortulorum', 'mountain'],
  // 참새목 - 휘파람새과·개개비과·솔새과
  ['휘파람새', 'Japanese bush warbler', 'Horornis diphone', 'mountain'],
  ['숲새', 'Asian stubtail', 'Urosphena squameiceps', 'mountain'],
  ['개개비', 'Oriental reed warbler', 'Acrocephalus orientalis', 'water'],
  ['산솔새', 'Eastern crowned warbler', 'Phylloscopus coronatus', 'mountain'],
  ['솔새', 'Arctic warbler', 'Phylloscopus borealis', 'mountain'],
  ['노랑눈썹솔새', 'Yellow-browed warbler', 'Phylloscopus inornatus', 'mountain'],
  // 참새목 - 동박새과·직박구리과·찌르레기과
  ['동박새', 'Warbling white-eye', 'Zosterops japonicus', 'mountain'],
  ['직박구리', 'Brown-eared bulbul', 'Hypsipetes amaurotis', 'mountain'],
  ['찌르레기', 'White-cheeked starling', 'Spodiopsar cineraceus', 'urban'],
  // 참새목 - 할미새과
  ['백할미새', 'White wagtail', 'Motacilla alba', 'water'],
  ['노랑할미새', 'Grey wagtail', 'Motacilla cinerea', 'water'],
  ['알락할미새', 'Japanese wagtail', 'Motacilla grandis', 'water'],
  ['힝둥새', 'Olive-backed pipit', 'Anthus hodgsoni', 'mountain'],
  // 참새목 - 때까치과
  ['때까치', 'Bull-headed shrike', 'Lanius bucephalus', 'field'],
  ['노랑때까치', 'Brown shrike', 'Lanius cristatus', 'field'],
  // 참새목 - 까마귀과
  ['까치', 'Eurasian magpie', 'Pica pica', 'urban'],
  ['물까치', 'Azure-winged magpie', 'Cyanopica cyanus', 'mountain'],
  ['어치', 'Eurasian jay', 'Garrulus glandarius', 'mountain'],
  ['까마귀', 'Carrion crow', 'Corvus corone', 'field'],
  ['큰부리까마귀', 'Large-billed crow', 'Corvus macrorhynchos', 'mountain'],
  ['떼까마귀', 'Rook', 'Corvus frugilegus', 'field'],
  ['갈까마귀', 'Daurian jackdaw', 'Corvus dauuricus', 'field'],
  ['큰까마귀', 'Common raven', 'Corvus corax', 'mountain'],
  // 참새목 - 동고비과·굴뚝새과·물까마귀과
  ['동고비', 'Eurasian nuthatch', 'Sitta europaea', 'mountain'],
  ['굴뚝새', 'Eurasian wren', 'Troglodytes troglodytes', 'mountain'],
  ['물까마귀', 'Brown dipper', 'Cinclus pallasii', 'water'],
  // 참새목 - 상모솔새과·여새과
  ['상모솔새', 'Goldcrest', 'Regulus regulus', 'mountain'],
  ['황여새', 'Bohemian waxwing', 'Bombycilla garrulus', 'mountain'],
  ['홍여새', 'Japanese waxwing', 'Bombycilla japonica', 'mountain'],
  // 참새목 - 제비과
  ['제비', 'Barn swallow', 'Hirundo rustica', 'urban'],
  ['귀제비', 'Red-rumped swallow', 'Cecropis daurica', 'field'],
  ['흰털발제비', 'Common house martin', 'Delichon urbicum', 'mountain'],
  // 참새목 - 종다리과
  ['종다리', 'Eurasian skylark', 'Alauda arvensis', 'field'],
  // 참새목 - 꾀꼬리과·붉은머리오목눈이과
  ['꾀꼬리', 'Black-naped oriole', 'Oriolus chinensis', 'mountain'],
  ['붉은머리오목눈이', 'Vinous-throated parrotbill', 'Sinosuthora webbiana', 'mountain'],
  // 딱다구리목
  ['쇠딱다구리', 'Pygmy woodpecker', 'Dendrocopos kizuki', 'mountain'],
  ['오색딱다구리', 'Great spotted woodpecker', 'Dendrocopos major', 'mountain'],
  ['큰오색딱다구리', 'White-backed woodpecker', 'Dendrocopos leucotos', 'mountain'],
  ['청딱다구리', 'Grey-headed woodpecker', 'Picus canus', 'mountain'],
  ['까막딱다구리', 'Black woodpecker', 'Dryocopus martius', 'mountain'],
  ['개미잡이', 'Eurasian wryneck', 'Jynx torquilla', 'field'],
  // 파랑새목·물총새목·후투티목
  ['물총새', 'Common kingfisher', 'Alcedo atthis', 'water'],
  ['청호반새', 'White-throated kingfisher', 'Halcyon smyrnensis', 'water'],
  ['호반새', 'Ruddy kingfisher', 'Halcyon coromanda', 'mountain'],
  ['파랑새', 'Oriental dollarbird', 'Eurystomus orientalis', 'mountain'],
  ['후투티', 'Eurasian hoopoe', 'Upupa epops', 'field'],
  // 칼새목
  ['칼새', 'Pacific swift', 'Apus pacificus', 'mountain'],
  // 두견이목
  ['뻐꾸기', 'Common cuckoo', 'Cuculus canorus', 'mountain'],
  ['두견이', 'Lesser cuckoo', 'Cuculus poliocephalus', 'mountain'],
  ['벙어리뻐꾸기', 'Oriental cuckoo', 'Cuculus optatus', 'mountain'],
  ['검은등뻐꾸기', 'Indian cuckoo', 'Cuculus micropterus', 'mountain'],
  // 올빼미목
  ['소쩍새', 'Oriental scops owl', 'Otus sunia', 'mountain'],
  ['큰소쩍새', 'Collared scops owl', 'Otus lettia', 'mountain'],
  ['수리부엉이', 'Eurasian eagle-owl', 'Bubo bubo', 'mountain'],
  ['부엉이', 'Long-eared owl', 'Asio otus', 'mountain'],
  ['쇠부엉이', 'Short-eared owl', 'Asio flammeus', 'field'],
  ['올빼미', 'Ural owl', 'Strix uralensis', 'mountain'],
  ['솔부엉이', 'Northern boobook', 'Ninox japonica', 'mountain'],
  // 매목
  ['매', 'Peregrine falcon', 'Falco peregrinus', 'mountain'],
  ['황조롱이', 'Common kestrel', 'Falco tinnunculus', 'urban'],
  ['새호리기', 'Eurasian hobby', 'Falco subbuteo', 'mountain'],
  // 수리목
  ['독수리', 'Cinereous vulture', 'Aegypius monachus', 'field'],
  ['검독수리', 'Golden eagle', 'Aquila chrysaetos', 'mountain'],
  ['흰꼬리수리', 'White-tailed eagle', 'Haliaeetus albicilla', 'water'],
  ['참수리', "Steller's sea eagle", 'Haliaeetus pelagicus', 'water'],
  ['솔개', 'Black kite', 'Milvus migrans', 'water'],
  ['참매', 'Northern goshawk', 'Accipiter gentilis', 'mountain'],
  ['새매', 'Eurasian sparrowhawk', 'Accipiter nisus', 'mountain'],
  ['조롱이', 'Japanese sparrowhawk', 'Accipiter gularis', 'mountain'],
  ['붉은배새매', 'Chinese sparrowhawk', 'Accipiter soloensis', 'mountain'],
  ['말똥가리', 'Common buzzard', 'Buteo buteo', 'field'],
  ['개구리매', 'Eastern marsh harrier', 'Circus spilonotus', 'water'],
  ['잿빛개구리매', 'Hen harrier', 'Circus cyaneus', 'field'],
  ['알락개구리매', 'Pied harrier', 'Circus melanoleucos', 'field'],
  // 두루미목
  ['두루미', 'Red-crowned crane', 'Grus japonensis', 'water'],
  ['재두루미', 'White-naped crane', 'Antigone vipio', 'water'],
  ['흑두루미', 'Hooded crane', 'Grus monacha', 'water'],
  ['검은목두루미', 'Common crane', 'Grus grus', 'water'],
  // 황새목
  ['황새', 'Oriental stork', 'Ciconia boyciana', 'water'],
  ['저어새', 'Black-faced spoonbill', 'Platalea minor', 'water'],
  ['노랑부리저어새', 'Eurasian spoonbill', 'Platalea leucorodia', 'water'],
  ['따오기', 'Crested ibis', 'Nipponia nippon', 'water'],
  // 사다새목
  ['왜가리', 'Grey heron', 'Ardea cinerea', 'water'],
  ['중대백로', 'Great egret', 'Ardea alba', 'water'],
  ['백로', 'Little egret', 'Egretta garzetta', 'water'],
  ['노랑부리백로', 'Chinese egret', 'Egretta eulophotes', 'water'],
  ['황로', 'Cattle egret', 'Bubulcus ibis', 'field'],
  ['해오라기', 'Black-crowned night heron', 'Nycticorax nycticorax', 'water'],
  ['덤불해오라기', 'Yellow bittern', 'Ixobrychus sinensis', 'water'],
  ['알락해오라기', 'Eurasian bittern', 'Botaurus stellaris', 'water'],
  ['검은댕기해오라기', 'Striated heron', 'Butorides striata', 'water'],
  ['가마우지', 'Japanese cormorant', 'Phalacrocorax capillatus', 'water'],
  ['민물가마우지', 'Great cormorant', 'Phalacrocorax carbo', 'water'],
  // 기러기목
  ['고니', 'Tundra swan', 'Cygnus columbianus', 'water'],
  ['큰고니', 'Whooper swan', 'Cygnus cygnus', 'water'],
  ['기러기', 'Bean goose', 'Anser fabalis', 'water'],
  ['개리', 'Swan goose', 'Anser cygnoid', 'water'],
  ['쇠기러기', 'Greater white-fronted goose', 'Anser albifrons', 'water'],
  ['흑기러기', 'Brant', 'Branta bernicla', 'water'],
  ['청둥오리', 'Mallard', 'Anas platyrhynchos', 'water'],
  ['오리', 'Mallard', 'Anas platyrhynchos', 'water'],
  ['흰뺨검둥오리', 'Eastern spot-billed duck', 'Anas zonorhyncha', 'water'],
  ['원앙', 'Mandarin duck', 'Aix galericulata', 'water'],
  ['가창오리', 'Baikal teal', 'Sibirionetta formosa', 'water'],
  ['쇠오리', 'Eurasian teal', 'Anas crecca', 'water'],
  ['고방오리', 'Northern pintail', 'Anas acuta', 'water'],
  ['넓적부리', 'Northern shoveler', 'Spatula clypeata', 'water'],
  ['알락오리', 'Gadwall', 'Mareca strepera', 'water'],
  ['청머리오리', 'Eurasian wigeon', 'Mareca penelope', 'water'],
  ['흰죽지', 'Common pochard', 'Aythya ferina', 'water'],
  ['댕기흰죽지', 'Tufted duck', 'Aythya fuligula', 'water'],
  ['비오리', 'Common merganser', 'Mergus merganser', 'water'],
  ['혹부리오리', 'Common shelduck', 'Tadorna tadorna', 'water'],
  ['황오리', 'Ruddy shelduck', 'Tadorna ferruginea', 'water'],
  // 도요목 - 물떼새과
  ['검은머리물떼새', 'Eurasian oystercatcher', 'Haematopus ostralegus', 'water'],
  ['꼬마물떼새', 'Little ringed plover', 'Charadrius dubius', 'water'],
  ['흰물떼새', 'Kentish plover', 'Charadrius alexandrinus', 'water'],
  ['댕기물떼새', 'Northern lapwing', 'Vanellus vanellus', 'water'],
  // 도요목 - 도요과
  ['마도요', 'Eurasian curlew', 'Numenius arquata', 'water'],
  ['중부리도요', 'Whimbrel', 'Numenius phaeopus', 'water'],
  ['알락꼬리마도요', 'Far Eastern curlew', 'Numenius madagascariensis', 'water'],
  ['청다리도요', 'Common greenshank', 'Tringa nebularia', 'water'],
  ['삑삑도요', 'Common sandpiper', 'Actitis hypoleucos', 'water'],
  ['민물도요', 'Dunlin', 'Calidris alpina', 'water'],
  // 갈매기목
  ['갈매기', 'Common gull', 'Larus canus', 'water'],
  ['괭이갈매기', 'Black-tailed gull', 'Larus crassirostris', 'water'],
  ['재갈매기', 'Herring gull', 'Larus argentatus', 'water'],
  ['붉은부리갈매기', 'Black-headed gull', 'Chroicocephalus ridibundus', 'water'],
  ['제비갈매기', 'Common tern', 'Sterna hirundo', 'water'],
  ['쇠제비갈매기', 'Little tern', 'Sternula albifrons', 'water'],
  // 비둘기목
  ['비둘기', 'Rock pigeon', 'Columba livia', 'urban'],
  ['멧비둘기', 'Oriental turtle dove', 'Streptopelia orientalis', 'mountain'],
  // 닭목
  ['꿩', 'Common pheasant', 'Phasianus colchicus', 'mountain'],
  ['메추라기', 'Japanese quail', 'Coturnix japonica', 'field'],
  // 논병아리목·쏙독새목
  ['논병아리', 'Little grebe', 'Tachybaptus ruficollis', 'water'],
  ['뿔논병아리', 'Great crested grebe', 'Podiceps cristatus', 'water'],
  ['쏙독새', 'Grey nightjar', 'Caprimulgus jotaka', 'mountain'],
  // 두루미목 - 뜸부기과
  ['물닭', 'Eurasian coot', 'Fulica atra', 'water'],
  ['쇠물닭', 'Common moorhen', 'Gallinula chloropus', 'water'],
  ['뜸부기', 'Watercock', 'Gallicrex cinerea', 'water'],
];

const FEATURED_MAP = new Map<string, BirdEntry>(
  FEATURED_BIRDS.map((b) => [b.korean, b]),
);

export const ALL_BIRDS: BirdEntry[] = RAW_BIRD_PAIRS.map(
  ([korean, english, scientific, habitat]) => {
    const featured = FEATURED_MAP.get(korean);
    if (featured) return featured;
    return {
      korean,
      english,
      scientific,
      habitat: habitat ?? 'field',
    };
  },
);

export const BIRD_BY_KOREAN = new Map<string, BirdEntry>(
  ALL_BIRDS.map((b) => [b.korean, b]),
);

export const HIKING_BIRDS: BirdEntry[] = ALL_BIRDS.filter((b) => b.hikingCommon);

// 한글 초성 추출 (산행 중 빠른 한 손 초성 검색 지원: 예 "ㅂㅅ" -> 박새)
const CHOSEONG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
  'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

function getChoseong(str: string): string {
  let out = '';
  for (const ch of str) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const idx = Math.floor((code - 0xac00) / (21 * 28));
      out += CHOSEONG[idx];
    } else {
      out += ch;
    }
  }
  return out;
}

function isChoseongOnly(str: string): boolean {
  return /^[ㄱ-ㅎ]+$/.test(str);
}

export function searchBirdSuggestions(
  query: string,
  options?: { habitat?: BirdHabitat | 'all' | 'hiking'; limit?: number },
): BirdEntry[] {
  const q = query.trim().toLowerCase();
  const habitat = options?.habitat ?? 'all';
  const limit = options?.limit ?? 15;

  let pool = ALL_BIRDS;
  if (habitat === 'hiking') {
    pool = HIKING_BIRDS;
  } else if (habitat !== 'all') {
    pool = ALL_BIRDS.filter((b) => b.habitat === habitat);
  }

  if (!q) {
    return pool.slice(0, limit);
  }

  const choseongMode = isChoseongOnly(q);

  return pool
    .filter((b) => {
      if (choseongMode) {
        return getChoseong(b.korean).includes(q);
      }
      return (
        b.korean.toLowerCase().includes(q) ||
        b.english.toLowerCase().includes(q) ||
        b.scientific.toLowerCase().includes(q) ||
        (b.callDescription?.toLowerCase().includes(q) ?? false) ||
        (b.soundTags?.some((t) => t.toLowerCase().includes(q)) ?? false)
      );
    })
    .slice(0, limit);
}

/**
 * 클라이언트 음향 분석 결과(피크 주파수)를 기반으로
 * 산행 중 가능성이 높은 새 후보를 추천합니다 (오프라인 / AI 백엔드 미연결 시 폴백).
 */
export function recommendBirdsByFrequency(
  peakFreqHz: number,
  limit = 4,
): BirdEntry[] {
  const candidates = HIKING_BIRDS.filter((b) => b.freqRangeHz);
  const scored = candidates.map((bird) => {
    const [min, max] = bird.freqRangeHz!;
    const mid = (min + max) / 2;
    const inRange = peakFreqHz >= min && peakFreqHz <= max;
    const distance = Math.abs(peakFreqHz - mid);
    return {
      bird,
      score: (inRange ? 0 : 3000) + distance,
    };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit).map((s) => s.bird);
}
