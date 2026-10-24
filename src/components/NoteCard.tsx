import type { CSSProperties } from 'react'
import type { Note } from '../lib/types'
import { fontFor, inkFor, paperFor } from '../lib/design'
import { formatFullDate, formatTimestamp } from '../lib/format'
import { useAudioPreview } from '../hooks/useAudioPreview'
import { AnonMark, NoteDecoration } from './Doodles'
import { Artwork } from './Artwork'
import { PauseIcon, PlayIcon, Spinner, TrashIcon } from './Icons'

interface NoteCardProps {
  note: Note
  preview?: boolean
  onImageOpen?: (url: string) => void
  onDelete?: () => void
  index?: number
}

export function NoteCard({
  note,
  preview = false,
  onImageOpen,
  onDelete,
  index,
}: NoteCardProps) {
  const paper = paperFor(note.design.paper)
  const ink = inkFor(note.design.ink)
  const font = fontFor(note.design.font)
  const style: CSSProperties = {
    backgroundColor: paper.bg,
    color: ink.color,
  }

  if (index !== undefined) {
    style.animationDelay = `${Math.min(index, 8) * 45}ms`
  }

  const image = note.imageUrl ? (
    <img
      src={note.imageUrl}
      alt="Note attachment"
      loading="lazy"
      className="block h-full w-full object-contain"
    />
  ) : null

  const footer = !preview ? (
    <div className="mt-4 flex items-center justify-between gap-3">
      <div>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="icon-btn !h-7 !w-7 !border-[#8f3f34]/35 !text-[#8f3f34]"
            aria-label="Delete note"
            title="Delete note"
          >
            <TrashIcon size={13} />
          </button>
        ) : null}
      </div>
      <time
        dateTime={note.createdAt}
        title={formatFullDate(note.createdAt)}
        className="text-[0.66rem] font-semibold tracking-wide text-softink/80"
      >
        {formatTimestamp(note.createdAt)}
      </time>
    </div>
  ) : null

  return (
    <article
      className={`paper-card relative p-5 sm:p-6 ${
        index !== undefined ? 'animate-fade-up' : ''
      }`}
      style={style}
    >
      <NoteDecoration type={note.design.doodle} />

      <header className="pr-9">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-hand text-[1.12rem] leading-none">
          {note.senderName ? (
            <span>
              <span className="text-softink/75">From:</span>{' '}
              <span>{note.senderName}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <AnonMark className="h-3.5 w-3.5 opacity-70" />
              <span>Anonymous</span>
            </span>
          )}

          {note.recipientName ? (
            <>
              <span aria-hidden="true" className="text-softink/50">
                ·
              </span>
              <span>
                <span className="text-softink/75">To:</span>{' '}
                <span>{note.recipientName}</span>
              </span>
            </>
          ) : null}
        </div>
      </header>

      {note.text ? (
        <p
          className={`mt-4 whitespace-pre-wrap break-words ${font.noteClassName}`}
        >
          {note.text}
        </p>
      ) : null}

      {note.imageUrl || note.music ? (
        <div className="mt-4 grid max-w-[15rem] grid-cols-2 gap-2">
          {note.imageUrl ? (
            onImageOpen ? (
              <button
                type="button"
                onClick={() => onImageOpen(note.imageUrl!)}
                className="group flex h-16 w-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[13px_9px_15px_10px] border-[1.5px] border-ink/35 bg-white/35 text-softink shadow-paper transition hover:-rotate-1 hover:bg-white/55"
                aria-label="Reveal image"
                aria-haspopup="dialog"
                title="Reveal image"
              >
                <AnonMark className="h-5 w-5 opacity-60 transition group-hover:scale-110" />
                <span className="font-hand text-base leading-none text-ink/75">
                  Image
                </span>
                <span className="text-[0.46rem] font-bold uppercase tracking-[0.12em] text-softink/70">
                  Reveal
                </span>
              </button>
            ) : (
              <div className="h-16 w-full overflow-hidden rounded-[13px_9px_15px_10px] border-[1.5px] border-ink/35 bg-white/35 p-1 shadow-paper">
                {image}
              </div>
            )
          ) : null}

          {note.music ? (
            <MusicTile noteId={note.id} track={note.music} />
          ) : null}
        </div>
      ) : null}

      {footer}
    </article>
  )
}

function MusicTile({
  noteId,
  track,
}: {
  noteId: string
  track: NonNullable<Note['music']>
}) {
  const { currentKey, isPlaying, isLoading, errorKey, toggle } =
    useAudioPreview()
  const previewKey = `note-${noteId}-${track.trackId}`
  const isActive = currentKey === previewKey
  const playing = isActive && isPlaying
  const loading = isActive && isLoading
  const hasError = errorKey === previewKey

  return (
    <button
      type="button"
      onClick={() => toggle(previewKey, track)}
      className="group relative h-16 w-full overflow-hidden rounded-[13px_9px_15px_10px] border-[1.5px] border-ink/35 bg-white/30 text-left shadow-paper transition hover:-rotate-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-offset-4"
      aria-label={`${playing ? 'Pause' : 'Play'} preview of ${track.title}`}
      title={track.title}
    >
      <Artwork
        src={track.artworkUrl}
        alt=""
        className="h-full w-full !rounded-none !border-0 object-cover transition duration-300 group-hover:scale-[1.04]"
        iconSize={18}
      />
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent"
        aria-hidden="true"
      />
      <span className="pointer-events-none absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] border-ink/50 bg-cream/95 text-ink shadow-paper">
        {loading ? (
          <Spinner size={11} />
        ) : playing ? (
          <PauseIcon size={11} />
        ) : (
          <PlayIcon size={11} />
        )}
      </span>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 block p-1.5">
        <span className="line-clamp-2 block font-hand text-[0.68rem] leading-[1.05] text-cream">
          {track.title}
        </span>
        {hasError ? (
          <span
            className="mt-0.5 block truncate text-[0.46rem] font-semibold text-[#fbe9e3]"
            title="Preview unavailable."
            role="status"
          >
            Preview unavailable.
          </span>
        ) : null}
      </span>
    </button>
  )
}
