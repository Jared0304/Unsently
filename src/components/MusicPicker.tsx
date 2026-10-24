import { useEffect, useRef, useState } from 'react'
import type { MusicTrack } from '../lib/types'
import { searchMusic } from '../lib/api'
import { useAudioPreview } from '../hooks/useAudioPreview'
import { Modal } from './Modal'
import { Artwork } from './Artwork'
import { MusicPreviewButton } from './MusicPreviewButton'
import { CloseIcon, PlusIcon, SearchIcon } from './Icons'

interface MusicPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (track: MusicTrack) => void
}

export function MusicPicker({ open, onClose, onSelect }: MusicPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MusicTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const { stop } = useAudioPreview()

  useEffect(() => {
    if (!open) return
    setQuery('')
    setResults([])
    setSearched(false)
    setError(null)
    setLoading(false)
  }, [open])

  useEffect(() => {
    if (!open) return

    const term = query.trim()
    if (term.length < 2) {
      setResults([])
      setSearched(false)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setSearched(false)

    const timer = window.setTimeout(async () => {
      try {
        const items = await searchMusic(term, controller.signal)
        if (!cancelled) {
          setResults(items)
          setSearched(true)
        }
      } catch {
        if (!cancelled) {
          setResults([])
          setSearched(true)
          setError('Music search is unavailable.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 350)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query, open])

  function close() {
    stop()
    onClose()
  }

  function choose(track: MusicTrack) {
    stop()
    onSelect(track)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      ariaLabel="Choose music"
      panelClassName="max-w-lg"
      initialFocusRef={searchRef}
    >
      <div className="paper-card p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-hand text-2xl leading-none">Music</h2>
          <button
            type="button"
            onClick={close}
            className="icon-btn !h-8 !w-8"
            aria-label="Close"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="relative mt-3">
          <SearchIcon
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-softink/65"
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search music"
            autoComplete="off"
            className="field !pl-9"
            aria-label="Search music"
          />
        </div>

        <div className="mt-3 max-h-[55vh] overflow-y-auto pr-0.5">
          {loading ? (
            <div className="space-y-2" aria-label="Searching" role="status">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[11px_9px_12px_10px] p-2"
                >
                  <div className="skeleton h-11 w-11 !rounded-[9px]" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3.5 w-2/3" />
                    <div className="skeleton h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="px-2 py-4 text-sm text-[#8f3f34]" role="alert">
              {error}
            </p>
          ) : searched && results.length === 0 ? (
            <p className="px-2 py-4 text-sm text-softink">No music found.</p>
          ) : (
            <ul className="space-y-1">
              {results.map((track) => (
                <li
                  key={track.trackId}
                  className="flex items-center gap-3 rounded-[11px_9px_12px_10px] p-2 transition hover:bg-white/55"
                >
                  <Artwork
                    src={track.artworkUrl}
                    alt=""
                    className="h-11 w-11"
                    iconSize={16}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-hand text-[1.1rem] leading-tight">
                      {track.title}
                    </p>
                    <p className="truncate text-[0.7rem] font-semibold text-softink">
                      {track.artist}
                    </p>
                  </div>
                  <MusicPreviewButton
                    previewKey={`search-${track.trackId}`}
                    track={track}
                    className="icon-btn !h-8 !w-8"
                    size={14}
                  />
                  <button
                    type="button"
                    onClick={() => choose(track)}
                    className="icon-btn !h-8 !w-8 !border-ink/35"
                    aria-label={`Attach ${track.title}`}
                  >
                    <PlusIcon size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}
