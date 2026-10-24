import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import type { MusicTrack, Note, NoteDesign } from '../lib/types'
import {
  ApiError,
  createNote,
  deleteNote,
  fetchMyNotes,
  updateNote,
} from '../lib/api'
import { DEFAULT_DESIGN, fontFor, inkFor, paperFor } from '../lib/design'
import { formatTimestamp } from '../lib/format'
import { NoteCard } from './NoteCard'
import { DesignControls } from './DesignControls'
import { MusicPicker } from './MusicPicker'
import { Artwork } from './Artwork'
import { MusicPreviewButton } from './MusicPreviewButton'
import { ConfirmDialog } from './ConfirmDialog'
import { Lightbox } from './Lightbox'
import { DoodleScribble } from './Doodles'
import {
  CameraIcon,
  CloseIcon,
  ImageIcon,
  MusicIcon,
  PlusIcon,
  Spinner,
  TrashIcon,
} from './Icons'

interface NotesPageProps {
  onDirtyChange: (dirty: boolean) => void
  onPublishComplete: (note: Note) => void
  onFeedChanged: () => void
  notify: (message: string) => void
}

type PendingAction =
  | { kind: 'new' }
  | { kind: 'select'; note: Note }

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

export function NotesPage({
  onDirtyChange,
  onPublishComplete,
  onFeedChanged,
  notify,
}: NotesPageProps) {
  const [mine, setMine] = useState<Note[]>([])
  const [loadingMine, setLoadingMine] = useState(true)
  const [mineError, setMineError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [senderName, setSenderName] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [design, setDesign] = useState<NoteDesign>(DEFAULT_DESIGN)
  const [music, setMusic] = useState<MusicTrack | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)

  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [musicPickerOpen, setMusicPickerOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  const markDirty = useCallback(() => {
    setDirty(true)
    onDirtyChange(true)
  }, [onDirtyChange])

  const clearDirty = useCallback(() => {
    setDirty(false)
    onDirtyChange(false)
  }, [onDirtyChange])

  const loadMine = useCallback(async () => {
    setLoadingMine(true)
    setMineError(null)
    try {
      const notes = await fetchMyNotes()
      setMine(notes)
    } catch {
      setMineError("Couldn't load your notes.")
    } finally {
      setLoadingMine(false)
    }
  }, [])

  useEffect(() => {
    void loadMine()
  }, [loadMine])

  useEffect(() => {
    return () => {
      onDirtyChange(false)
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [onDirtyChange])

  const resetForm = useCallback(() => {
    revokeObjectUrl()
    setEditingId(null)
    setText('')
    setSenderName('')
    setRecipientName('')
    setDesign({ ...DEFAULT_DESIGN })
    setMusic(null)
    setImageFile(null)
    setImagePreview(null)
    setExistingImageUrl(null)
    setRemoveImage(false)
    setMode('edit')
    setError(null)
    clearDirty()
  }, [clearDirty, revokeObjectUrl])

  const loadNote = useCallback(
    (note: Note) => {
      revokeObjectUrl()
      setEditingId(note.id)
      setText(note.text)
      setSenderName(note.senderName ?? '')
      setRecipientName(note.recipientName ?? '')
      setDesign({ ...note.design })
      setMusic(note.music)
      setImageFile(null)
      setImagePreview(note.imageUrl)
      setExistingImageUrl(note.imageUrl)
      setRemoveImage(false)
      setMode('edit')
      setError(null)
      clearDirty()
      window.scrollTo({ top: 0, behavior: 'auto' })
    },
    [clearDirty, revokeObjectUrl],
  )

  function requestNew() {
    if (dirty) {
      setPendingAction({ kind: 'new' })
      return
    }
    resetForm()
  }

  function requestSelect(note: Note) {
    if (dirty) {
      setPendingAction({ kind: 'select', note })
      return
    }
    loadNote(note)
  }

  function confirmDiscard() {
    const action = pendingAction
    setPendingAction(null)
    if (!action) return
    if (action.kind === 'new') resetForm()
    else loadNote(action.note)
  }

  function handleImageFile(file: File | undefined) {
    if (!file) return
    if (file.type && !file.type.startsWith('image/')) {
      setError('Unsupported image.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image is too large.')
      return
    }

    setError(null)
    revokeObjectUrl()
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setImageFile(file)
    setImagePreview(url)
    setRemoveImage(false)
    markDirty()
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    handleImageFile(file)
  }

  function removeSelectedImage() {
    revokeObjectUrl()
    setImageFile(null)
    setImagePreview(null)
    setRemoveImage(Boolean(existingImageUrl))
    markDirty()
  }

  async function handleSave() {
    const hasImage = Boolean(imageFile || (existingImageUrl && !removeImage))
    if (!text.trim() && !hasImage && !music) {
      setError('Add something first.')
      return
    }

    setError(null)
    setSaving(true)

    const form = new FormData()
    form.append('text', text)
    form.append('senderName', senderName)
    form.append('recipientName', recipientName)
    form.append('paper', design.paper)
    form.append('ink', design.ink)
    form.append('font', design.font)
    form.append('doodle', design.doodle)
    form.append('music', music ? JSON.stringify(music) : '')
    if (imageFile) form.append('image', imageFile)
    if (removeImage) form.append('removeImage', 'true')

    try {
      const saved = editingId
        ? await updateNote(editingId, form)
        : await createNote(form)

      revokeObjectUrl()
      clearDirty()

      if (!editingId) {
        onPublishComplete(saved)
        return
      }

      setEditingId(saved.id)
      setText(saved.text)
      setSenderName(saved.senderName ?? '')
      setRecipientName(saved.recipientName ?? '')
      setDesign({ ...saved.design })
      setMusic(saved.music)
      setExistingImageUrl(saved.imageUrl)
      setImagePreview(saved.imageUrl)
      setImageFile(null)
      setRemoveImage(false)
      setMine((current) =>
        current.map((note) => (note.id === saved.id ? saved : note)),
      )
      notify('Saved')
      onFeedChanged()
    } catch (saveError) {
      setError(
        saveError instanceof ApiError
          ? saveError.message
          : 'Something went wrong.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editingId) return
    setDeleting(true)
    setError(null)
    try {
      await deleteNote(editingId)
      const removedId = editingId
      setMine((current) => current.filter((note) => note.id !== removedId))
      setDeleteOpen(false)
      resetForm()
      notify('Deleted')
      onFeedChanged()
    } catch (deleteError) {
      setDeleteOpen(false)
      setError(
        deleteError instanceof ApiError
          ? deleteError.message
          : 'Something went wrong.',
      )
    } finally {
      setDeleting(false)
    }
  }

  const previewNote: Note = {
    id: editingId ?? 'preview',
    text: text.trim() ? text : '',
    senderName: senderName.trim() || null,
    recipientName: recipientName.trim() || null,
    imageUrl: imagePreview,
    music,
    design,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const showMineRow = loadingMine || Boolean(mineError) || mine.length > 0

  return (
    <>
      <main className="mx-auto w-full max-w-4xl px-4 pb-32 pt-6 sm:px-6 sm:pt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-hand text-[2.7rem] font-semibold leading-none">
              {editingId ? 'Edit' : 'Write'}
            </h1>
            <DoodleScribble className="mt-1 h-2.5 w-24 text-ink/25" />
          </div>
          <button type="button" className="btn" onClick={requestNew}>
            <PlusIcon size={16} />
            New
          </button>
        </div>

        {showMineRow ? (
          <section className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[0.63rem] font-bold uppercase tracking-[0.18em] text-softink/85">
                My notes
              </span>
              <span className="h-px flex-1 bg-ink/10" />
            </div>

            {loadingMine ? (
              <div className="flex gap-2">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="skeleton h-[4.5rem] w-40 shrink-0 !rounded-[13px]"
                  />
                ))}
              </div>
            ) : mineError ? (
              <div className="flex items-center gap-2 text-xs text-softink">
                <span>{mineError}</span>
                <button
                  type="button"
                  className="font-bold underline decoration-dotted underline-offset-2"
                  onClick={() => void loadMine()}
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {mine.map((note) => {
                  const paper = paperFor(note.design.paper)
                  const ink = inkFor(note.design.ink)
                  const isActive = editingId === note.id
                  return (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => requestSelect(note)}
                      aria-pressed={isActive}
                      className={`paper-card w-40 shrink-0 p-2.5 text-left transition hover:-translate-y-0.5 ${
                        isActive
                          ? '!border-ink/80 shadow-lift ring-1 ring-ink/20'
                          : ''
                      }`}
                      style={{
                        backgroundColor: paper.bg,
                        color: ink.color,
                      }}
                    >
                      {note.text ? (
                        <p
                          className={`line-clamp-2 text-[0.92rem] leading-tight ${fontFor(note.design.font).className}`}
                        >
                          {note.text}
                        </p>
                      ) : (
                        <div className="flex h-7 items-center gap-1.5 text-softink">
                          {note.imageUrl ? <ImageIcon size={14} /> : null}
                          {note.music ? <MusicIcon size={14} /> : null}
                        </div>
                      )}
                      <span className="mt-1.5 block text-[0.6rem] font-semibold text-softink/80">
                        {formatTimestamp(note.createdAt)}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        ) : null}

        <div className="paper-sheet p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-end gap-3">
            <div className="segmented" role="group" aria-label="Editor view">
              <button
                type="button"
                aria-pressed={mode === 'edit'}
                onClick={() => setMode('edit')}
              >
                Edit
              </button>
              <button
                type="button"
                aria-pressed={mode === 'preview'}
                onClick={() => setMode('preview')}
              >
                Preview
              </button>
            </div>
          </div>

          {mode === 'edit' ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="note-text" className="sr-only">
                  Note
                </label>
                <textarea
                  id="note-text"
                  value={text}
                  maxLength={5000}
                  onChange={(event) => {
                    setText(event.target.value)
                    markDirty()
                  }}
                  placeholder="Write it down..."
                  rows={10}
                  className={`field min-h-[210px] resize-none !bg-transparent !px-1 !py-2 ${fontFor(design.font).noteClassName}`}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="field-label">From</span>
                  <input
                    className="field"
                    type="text"
                    value={senderName}
                    maxLength={80}
                    onChange={(event) => {
                      setSenderName(event.target.value)
                      markDirty()
                    }}
                  />
                </label>
                <label>
                  <span className="field-label">To</span>
                  <input
                    className="field"
                    type="text"
                    value={recipientName}
                    maxLength={80}
                    onChange={(event) => {
                      setRecipientName(event.target.value)
                      markDirty()
                    }}
                  />
                </label>
              </div>

              <DesignControls
                design={design}
                onChange={(next) => {
                  setDesign(next)
                  markDirty()
                }}
                onReset={() => {
                  setDesign({ ...DEFAULT_DESIGN })
                  markDirty()
                }}
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImageIcon size={16} />
                  Image
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <CameraIcon size={16} />
                  Camera
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setMusicPickerOpen(true)}
                >
                  <MusicIcon size={16} />
                  Music
                </button>
              </div>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
                className="hidden"
                onChange={onFileChange}
                tabIndex={-1}
                aria-hidden="true"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onFileChange}
                tabIndex={-1}
                aria-hidden="true"
              />

              {imagePreview || music ? (
                <div className="flex flex-wrap items-center gap-2">
                  {imagePreview ? (
                    <div className="flex items-center gap-2 rounded-[11px_9px_12px_10px] border-[1.5px] border-ink/20 bg-white/30 p-1.5 pr-2">
                      <button
                        type="button"
                        onClick={() => setLightbox(imagePreview)}
                        className="block overflow-hidden rounded-[8px_6px_9px_7px]"
                        aria-label="Preview image"
                      >
                        <img
                          src={imagePreview}
                          alt="Selected attachment"
                          className="h-14 w-14 object-cover"
                        />
                      </button>
                      <button
                        type="button"
                        className="icon-btn !h-7 !w-7"
                        onClick={removeSelectedImage}
                        aria-label="Remove image"
                      >
                        <CloseIcon size={14} />
                      </button>
                    </div>
                  ) : null}

                  {music ? (
                    <div className="flex max-w-full items-center gap-2 rounded-[11px_9px_12px_10px] border-[1.5px] border-ink/20 bg-white/30 p-1.5 pr-2">
                      <Artwork
                        src={music.artworkUrl}
                        alt=""
                        className="h-11 w-11"
                        iconSize={16}
                      />
                      <p className="min-w-0 max-w-[10rem] truncate font-hand text-lg leading-tight">
                        {music.title}
                      </p>
                      <MusicPreviewButton
                        previewKey={`editor-${music.trackId}`}
                        track={music}
                        className="icon-btn !h-8 !w-8"
                        size={14}
                      />
                      <button
                        type="button"
                        className="icon-btn !h-7 !w-7"
                        onClick={() => {
                          setMusic(null)
                          markDirty()
                        }}
                        aria-label="Remove music"
                      >
                        <CloseIcon size={14} />
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {error ? (
                <p
                  className="rounded-[10px_8px_11px_9px] border border-[#8f3f34]/25 bg-[#fbe9e3] px-3 py-2 text-sm text-[#7c342a]"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <div className="flex items-center justify-between gap-3 border-t border-ink/10 pt-4">
                {editingId ? (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <TrashIcon size={15} />
                    Delete
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void handleSave()}
                  disabled={saving}
                >
                  {saving ? <Spinner size={15} /> : null}
                  {editingId ? 'Save' : 'Publish'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="py-2">
                <NoteCard
                  note={previewNote}
                  preview
                  onImageOpen={setLightbox}
                />
              </div>

              {error ? (
                <p
                  className="mt-3 rounded-[10px_8px_11px_9px] border border-[#8f3f34]/25 bg-[#fbe9e3] px-3 py-2 text-sm text-[#7c342a]"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink/10 pt-4">
                {editingId ? (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <TrashIcon size={15} />
                    Delete
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void handleSave()}
                  disabled={saving}
                >
                  {saving ? <Spinner size={15} /> : null}
                  {editingId ? 'Save' : 'Publish'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <MusicPicker
        open={musicPickerOpen}
        onClose={() => setMusicPickerOpen(false)}
        onSelect={(track) => {
          setMusic(track)
          markDirty()
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title="Discard changes?"
        confirmLabel="Discard"
        danger
        onConfirm={confirmDiscard}
        onCancel={() => setPendingAction(null)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete note?"
        confirmLabel="Delete"
        danger
        busy={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteOpen(false)}
      />

      <Lightbox
        src={lightbox}
        alt="Note attachment"
        onClose={() => setLightbox(null)}
      />
    </>
  )
}
