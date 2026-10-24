import { useState } from 'react'
import type { Note } from '../lib/types'
import { ApiError, deleteNote } from '../lib/api'
import { NoteCard } from './NoteCard'
import { FeedSkeleton } from './FeedSkeleton'
import { ConfirmDialog } from './ConfirmDialog'
import { Lightbox } from './Lightbox'
import { DoodleArrow, DoodleHeart, DoodleScribble, DoodleStar } from './Doodles'

function describeNote(note: Note): string {
  const from = note.senderName ? `From ${note.senderName}` : 'Anonymous'
  const to = note.recipientName ? ` to ${note.recipientName}` : ''
  const text = note.text.trim()
  const preview = text
    ? `“${text.length > 90 ? `${text.slice(0, 90)}…` : text}”`
    : 'Image or music only'
  return `${from}${to} · ${preview}`
}

interface HomePageProps {
  notes: Note[]
  loading: boolean
  error: string | null
  isAdmin: boolean
  onRetry: () => void
  onWrite: () => void
  onNoteDeleted: (id: string) => void
  notify: (message: string) => void
}

export function HomePage({
  notes,
  loading,
  error,
  isAdmin,
  onRetry,
  onWrite,
  onNoteDeleted,
  notify,
}: HomePageProps) {
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteNote(deleteTarget.id)
      onNoteDeleted(deleteTarget.id)
      setDeleteTarget(null)
      notify('Deleted')
    } catch (deleteError) {
      notify(
        deleteError instanceof ApiError
          ? deleteError.message
          : 'Could not delete note.',
      )
    } finally {
      setDeleting(false)
    }
  }

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
                onDelete={isAdmin ? () => setDeleteTarget(note) : undefined}
              />
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this note?"
        description={deleteTarget ? describeNote(deleteTarget) : undefined}
        confirmLabel="Delete"
        danger
        busy={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null)
        }}
      />

      <Lightbox
        src={lightbox}
        alt="Note attachment"
        onClose={() => setLightbox(null)}
      />
    </>
  )
}
