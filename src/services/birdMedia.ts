import { BIRD_BY_KOREAN } from '../data/birds';

export interface BirdAudioItem {
  url: string;
  source: 'iNaturalist' | 'GBIF' | 'Wikimedia';
  label: string;
  location?: string;
}

export interface BirdImageItem {
  url: string;
  source: 'Wikipedia' | 'iNaturalist' | 'GBIF' | 'Wikimedia' | 'Fallback';
}

export interface BirdInfo {
  name: string;
  scientificName: string;
  displaySubtitle: string;
  summary?: string;
  callDescription?: string;
  soundTags?: string[];
  imageUrls: BirdImageItem[];
  audioItems: BirdAudioItem[];
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=800&auto=format&fit=crop';

const memoryCache = new Map<string, BirdInfo>();
const CACHE_PREFIX = 'birdsong_media_v2:';

function readCached(key: string): BirdInfo | null {
  const mem = memoryCache.get(key);
  if (mem) return mem;
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BirdInfo;
    memoryCache.set(key, parsed);
    return parsed;
  } catch {
    return null;
  }
}

function writeCached(key: string, value: BirdInfo): void {
  memoryCache.set(key, value);
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    // sessionStorage 용량 초과 시 무시
  }
}

async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchBirdMedia(query: string): Promise<BirdInfo> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      name: '알 수 없음',
      scientificName: '',
      displaySubtitle: '조류 데이터',
      imageUrls: [{ url: FALLBACK_IMAGE, source: 'Fallback' }],
      audioItems: [],
    };
  }

  const cached = readCached(trimmed);
  if (cached) return cached;

  const entry = BIRD_BY_KOREAN.get(trimmed);
  const scientificName = entry?.scientific ?? trimmed;
  const englishName = entry?.english ?? '';
  const displaySubtitle =
    [englishName, scientificName !== trimmed ? scientificName : '']
      .filter(Boolean)
      .join(' · ') || '조류 데이터';

  const encodedQuery = encodeURIComponent(trimmed);
  const encodedSci = encodeURIComponent(scientificName);

  // 6개 엔드포인트 병렬 요청 (iNaturalist, Wikipedia, Wikimedia 사진/소리, GBIF 사진/소리)
  const [
    koWikiSummary,
    enWikiSummary,
    inatPhotoData,
    inatSoundData,
    commonsImageData,
    commonsAudioData,
    gbifPhotoData,
    gbifSoundData,
  ] = await Promise.all([
    fetchJson<{ extract?: string; thumbnail?: { source?: string } }>(
      `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodedQuery}`,
    ),
    fetchJson<{ thumbnail?: { source?: string } }>(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedSci}`,
    ),
    fetchJson<{
      results?: {
        photos?: { url?: string }[];
      }[];
    }>(
      `https://api.inaturalist.org/v1/observations?taxon_name=${encodedSci}&photos=true&per_page=25&order_by=votes`,
    ),
    fetchJson<{
      results?: {
        place_guess?: string;
        observed_on?: string;
        sounds?: { file_url?: string }[];
      }[];
    }>(
      `https://api.inaturalist.org/v1/observations?taxon_name=${encodedSci}&sounds=true&per_page=15&order_by=votes`,
    ),
    fetchJson<{
      query?: {
        pages?: Record<
          string,
          { imageinfo?: { url?: string; thumburl?: string }[] }
        >;
      };
    }>(
      `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodedSci}&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*&gsrlimit=15`,
    ),
    fetchJson<{
      query?: {
        pages?: Record<
          string,
          {
            title?: string;
            imageinfo?: { url?: string; mime?: string }[];
          }
        >;
      };
    }>(
      `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
        `"${scientificName}" filetype:audio`,
      )}&gsrnamespace=6&prop=imageinfo&iiprop=url|mime&format=json&origin=*&gsrlimit=10`,
    ),
    fetchJson<{
      results?: {
        media?: { type?: string; identifier?: string }[];
      }[];
    }>(
      `https://api.gbif.org/v1/occurrence/search?scientificName=${encodedSci}&mediaType=StillImage&limit=15`,
    ),
    fetchJson<{
      results?: {
        country?: string;
        locality?: string;
        media?: { type?: string; identifier?: string; format?: string }[];
      }[];
    }>(
      `https://api.gbif.org/v1/occurrence/search?scientificName=${encodedSci}&mediaType=Sound&limit=15`,
    ),
  ]);

  // --- 이미지 수집 (중복 URL 제거, 최대 20장) ---
  const imageItems: BirdImageItem[] = [];
  const seenImgUrls = new Set<string>();
  const addImage = (url: string | undefined, source: BirdImageItem['source']) => {
    if (!url || seenImgUrls.has(url)) return;
    seenImgUrls.add(url);
    imageItems.push({ url, source });
  };

  addImage(koWikiSummary?.thumbnail?.source, 'Wikipedia');
  addImage(enWikiSummary?.thumbnail?.source, 'Wikipedia');

  for (const obs of inatPhotoData?.results ?? []) {
    for (const p of obs.photos ?? []) {
      const url = p.url?.replace('/square.', '/large.');
      addImage(url, 'iNaturalist');
      if (imageItems.length >= 12) break;
    }
    if (imageItems.length >= 12) break;
  }

  for (const occ of gbifPhotoData?.results ?? []) {
    for (const m of occ.media ?? []) {
      if (m.type === 'StillImage' && m.identifier?.startsWith('http')) {
        addImage(m.identifier, 'GBIF');
      }
    }
  }

  const skipExt = /\.(svg|ogg|oga|mp3|wav|flac|webm|ogv|mp4|tif|tiff)$/i;
  if (commonsImageData?.query?.pages) {
    for (const page of Object.values(commonsImageData.query.pages)) {
      const info = page.imageinfo?.[0];
      const url = info?.thumburl ?? info?.url;
      if (url && !skipExt.test(url)) {
        addImage(url, 'Wikimedia');
      }
    }
  }

  const finalImages =
    imageItems.length > 0
      ? imageItems.slice(0, 20)
      : [{ url: FALLBACK_IMAGE, source: 'Fallback' as const }];

  // --- 소리 수집 (중복 URL 제거, 최대 12개) ---
  const audioItems: BirdAudioItem[] = [];
  const seenAudioUrls = new Set<string>();
  const addAudio = (item: BirdAudioItem) => {
    if (!item.url || seenAudioUrls.has(item.url)) return;
    seenAudioUrls.add(item.url);
    audioItems.push(item);
  };

  for (const obs of inatSoundData?.results ?? []) {
    for (const s of obs.sounds ?? []) {
      if (s.file_url) {
        addAudio({
          url: s.file_url,
          source: 'iNaturalist',
          label: obs.observed_on ? `현장 녹음 (${obs.observed_on})` : '현장 녹음',
          location: obs.place_guess,
        });
      }
    }
  }

  const audioExt = /\.(ogg|oga|mp3|wav|flac|m4a|opus)$/i;
  if (commonsAudioData?.query?.pages) {
    for (const page of Object.values(commonsAudioData.query.pages)) {
      const info = page.imageinfo?.[0];
      if (
        info?.url &&
        (info.mime?.startsWith('audio/') || audioExt.test(info.url))
      ) {
        const cleanTitle = (page.title ?? '')
          .replace(/^File:/, '')
          .replace(/\.[^.]+$/, '')
          .slice(0, 40);
        addAudio({
          url: info.url,
          source: 'Wikimedia',
          label: cleanTitle || 'Wikimedia 오디오',
        });
      }
    }
  }

  for (const occ of gbifSoundData?.results ?? []) {
    for (const m of occ.media ?? []) {
      if (m.type === 'Sound' && m.identifier?.startsWith('http')) {
        addAudio({
          url: m.identifier,
          source: 'GBIF',
          label: occ.country ? `자연음 녹음 (${occ.country})` : '자연음 녹음',
          location: occ.locality,
        });
      }
    }
  }

  const result: BirdInfo = {
    name: trimmed,
    scientificName,
    displaySubtitle,
    summary: koWikiSummary?.extract,
    callDescription: entry?.callDescription,
    soundTags: entry?.soundTags,
    imageUrls: finalImages,
    audioItems: audioItems.slice(0, 12),
  };

  writeCached(trimmed, result);
  return result;
}
