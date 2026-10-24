export interface MusicResult {
  trackId: string
  title: string
  artist: string
  artworkUrl: string
  previewUrl: string
}

interface CacheEntry {
  expiresAt: number
  results: MusicResult[]
}

const cache = new Map<string, CacheEntry>()
const CACHE_MS = 5 * 60 * 1000

function isItunesPreview(value: string): boolean {
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'itunes.apple.com' ||
        url.hostname.endsWith('.itunes.apple.com') ||
        url.hostname.endsWith('.apple.com'))
    )
  } catch {
    return false
  }
}

function isItunesArtwork(value: string): boolean {
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      (url.hostname.endsWith('.mzstatic.com') ||
        url.hostname.endsWith('.apple.com'))
    )
  } catch {
    return false
  }
}

function cleanText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function searchMusic(query: string): Promise<MusicResult[]> {
  const term = query.trim().slice(0, 120)
  if (term.length < 2) return []

  const cached = cache.get(term.toLowerCase())
  if (cached && cached.expiresAt > Date.now()) return cached.results

  const url = new URL('https://itunes.apple.com/search')
  url.searchParams.set('term', term)
  url.searchParams.set('media', 'music')
  url.searchParams.set('entity', 'song')
  url.searchParams.set('limit', '8')
  url.searchParams.set('country', 'US')

  let response: globalThis.Response
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(7000),
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Unsently/1.0',
      },
    })
  } catch {
    throw new Error('MUSIC_SEARCH_FAILED')
  }

  if (!response.ok) throw new Error('MUSIC_SEARCH_FAILED')

  const body = (await response.json()) as { results?: unknown[] }
  const results: MusicResult[] = []
  const seen = new Set<string>()

  for (const item of body.results ?? []) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    if (row.kind !== 'song') continue

    const title = cleanText(row.trackName, 180)
    const artist = cleanText(row.artistName, 180)
    const trackId =
      typeof row.trackId === 'number' || typeof row.trackId === 'string'
        ? String(row.trackId)
        : ''
    const artworkUrl = cleanText(row.artworkUrl100, 500)
    const previewUrl = cleanText(row.previewUrl, 1000)

    if (
      !trackId ||
      !title ||
      !artist ||
      !isItunesArtwork(artworkUrl) ||
      !isItunesPreview(previewUrl) ||
      seen.has(trackId)
    ) {
      continue
    }

    seen.add(trackId)
    results.push({ trackId, title, artist, artworkUrl, previewUrl })
  }

  cache.set(term.toLowerCase(), {
    expiresAt: Date.now() + CACHE_MS,
    results,
  })

  return results
}

export function sanitizeMusic(value: unknown): MusicResult {
  if (!value || typeof value !== 'object') {
    throw new Error('INVALID_MUSIC')
  }

  const row = value as Record<string, unknown>
  const trackId = cleanText(row.trackId, 80)
  const title = cleanText(row.title, 180)
  const artist = cleanText(row.artist, 180)
  const artworkUrl = cleanText(row.artworkUrl, 1000)
  const previewUrl = cleanText(row.previewUrl, 1000)

  if (
    !trackId ||
    !title ||
    !artist ||
    !isItunesArtwork(artworkUrl) ||
    !isItunesPreview(previewUrl)
  ) {
    throw new Error('INVALID_MUSIC')
  }

  return { trackId, title, artist, artworkUrl, previewUrl }
}
