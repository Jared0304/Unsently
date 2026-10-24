import { useState } from 'react'
import type { Note } from '../lib/types'
import { NoteCard } from './NoteCard'
import { FeedSkeleton } from './FeedSkeleton'
import { Lightbox } from './Lightbox'
import { DoodleArrow, DoodleHeart, DoodleScribble, DoodleStar } from './Doodles'

interface HomePageProps {
  notes: Note[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onWrite: () => void
}

export function HomePage({
  notes,
  loading,
  error,
  onRetry,
  onWrite,
}: HomePageProps) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <>
      <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-5 sm:px-6 sm:pt-9">
        <div className="mb-5 flex items-center gap-2 px-1 text-ink/30" aria-hidden="true">
          <DoodleScribble className="h-3 w-16" />
          <DoodleStar className="h-3.5 w-3.5 animate-sparkle" />
        </div>

        {loading && notes.length === 0 ? (
          <FeedSkeleton />
        ) : error && notes.length === 0 ? (
          <div className="paper-card p-8 text-center">
            <p className="font-hand text-2xl">Couldn't load notes.</p>
            <button type="button" className="btn mt-4" onClick={onRetry}>
              Try again
            </button>
          </div>
        ) : notes.length === 0 ? (
          <div className="paper-card flex flex-col items-center p-8 text-center sm:p-10">
            <DoodleHeart className="h-10 w-10 text-ink/45" />
            <p className="mt-3 font-hand text-2xl">No notes yet.</p>
            <div className="relative mt-4">
              <DoodleArrow className="absolute -left-14 -top-4 hidden h-10 w-12 -rotate-12 text-ink/30 sm:block" />
              <button type="button" className="btn btn-primary" onClick={onWrite}>
                Write
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {notes.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                index={index}
                onImageOpen={setLightbox}
              />
            ))}
          </div>
        )}
      </main>

      <Lightbox
        src={lightbox}
        alt="Note attachment"
        onClose={() => setLightbox(null)}
      />
    </>
  )
}
