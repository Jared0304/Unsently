import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import type { About } from '../lib/types'
import { ApiError, fetchAbout, saveAbout } from '../lib/api'
import { ConfirmDialog } from './ConfirmDialog'
import { Lightbox } from './Lightbox'
import { DoodleAvatar, DoodleScribble } from './Doodles'
import {
  CloseIcon,
  EditIcon,
  ImageIcon,
  Spinner,
} from './Icons'

interface AboutPageProps {
  onDirtyChange: (dirty: boolean) => void
  notify: (message: string) => void
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

export function AboutPage({ onDirtyChange, notify }: AboutPageProps) {
  const [about, setAbout] = useState<About | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  const clearDirty = useCallback(() => {
    setDirty(false)
    onDirtyChange(false)
  }, [onDirtyChange])

  const markDirty = useCallback(() => {
    setDirty(true)
    onDirtyChange(true)
  }, [onDirtyChange])

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const loaded = await fetchAbout()
      setAbout(loaded)
      setExistingImageUrl(loaded.imageUrl)
      setImagePreview(loaded.imageUrl)
      setRemoveImage(false)
    } catch {
      setLoadError("Couldn't load About.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    return () => {
      onDirtyChange(false)
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [onDirtyChange])

  function startEditing() {
    if (!about) return
    revokeObjectUrl()
    setText(about.text)
    setImageFile(null)
    setExistingImageUrl(about.imageUrl)
    setImagePreview(about.imageUrl)
    setRemoveImage(false)
    setEditing(true)
    setError(null)
    clearDirty()
  }

  function closeEditor() {
    revokeObjectUrl()
    setEditing(false)
    setImageFile(null)
    setImagePreview(about?.imageUrl ?? null)
    setExistingImageUrl(about?.imageUrl ?? null)
    setRemoveImage(false)
    setError(null)
    clearDirty()
  }

  function requestCancel() {
    if (dirty) {
      setDiscardOpen(true)
      return
    }
    closeEditor()
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
    if (!text.trim() && !hasImage) {
      setError('Add something first.')
      return
    }

    setError(null)
    setSaving(true)

    const form = new FormData()
    form.append('text', text)
    if (imageFile) form.append('image', imageFile)
    if (removeImage) form.append('removeImage', 'true')

    try {
      const updated = await saveAbout(form)
      revokeObjectUrl()
      setAbout(updated)
      setExistingImageUrl(updated.imageUrl)
      setImagePreview(updated.imageUrl)
      setImageFile(null)
      setRemoveImage(false)
      setEditing(false)
      clearDirty()
      notify('Saved')
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

  return (
    <>
      <main className="mx-auto w-full max-w-xl px-4 pb-32 pt-6 sm:px-6 sm:pt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-hand text-[2.7rem] font-semibold leading-none">
              About
            </h1>
            <DoodleScribble className="mt-1 h-2.5 w-20 text-ink/25" />
          </div>
          {about?.canEdit && !editing ? (
            <button type="button" className="btn" onClick={startEditing}>
              <EditIcon size={15} />
              Edit
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="paper-sheet p-6 sm:p-8" aria-busy="true">
            <span className="sr-only">Loading About</span>
            <div className="skeleton mx-auto h-32 w-32 !rounded-full" />
            <div className="mx-auto mt-6 space-y-2.5">
              <div className="skeleton mx-auto h-4 w-4/5" />
              <div className="skeleton mx-auto h-4 w-3/5" />
            </div>
          </div>
        ) : loadError ? (
          <div className="paper-card p-8 text-center">
            <p className="font-hand text-2xl">{loadError}</p>
            <button type="button" className="btn mt-4" onClick={() => void load()}>
              Try again
            </button>
          </div>
        ) : about ? (
          <div className="paper-sheet p-6 text-center sm:p-8">
            <div className="relative mx-auto h-32 w-32">
              <div className="absolute inset-0 -rotate-2 rounded-full border-[1.5px] border-ink/45 bg-white/50" />
              {imagePreview ? (
                <button
                  type="button"
                  onClick={() => setLightbox(imagePreview)}
                  className="relative h-full w-full overflow-hidden rounded-full border-[1.5px] border-ink/45 bg-white/40 p-1 transition hover:rotate-1"
                  aria-label="Open profile image"
                >
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                </button>
              ) : (
                <DoodleAvatar className="relative h-full w-full text-ink" />
              )}
            </div>

            {editing ? (
              <div className="mt-5 text-left">
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImageIcon size={15} />
                    Image
                  </button>
                  {imagePreview ? (
                    <button
                      type="button"
                      className="btn"
                      onClick={removeSelectedImage}
                    >
                      <CloseIcon size={14} />
                      Remove
                    </button>
                  ) : null}
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

                <textarea
                  value={text}
                  maxLength={2000}
                  onChange={(event) => {
                    setText(event.target.value)
                    markDirty()
                  }}
                  placeholder="Write something..."
                  rows={6}
                  aria-label="About text"
                  className="field mt-4 min-h-[150px] resize-none !bg-transparent"
                />

                {error ? (
                  <p
                    className="mt-3 rounded-[10px_8px_11px_9px] border border-[#8f3f34]/25 bg-[#fbe9e3] px-3 py-2 text-sm text-[#7c342a]"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}

                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" className="btn" onClick={requestCancel}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => void handleSave()}
                    disabled={saving}
                  >
                    {saving ? <Spinner size={15} /> : null}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="mx-auto mt-5 max-w-md whitespace-pre-wrap text-[0.95rem] leading-7 text-ink/90">
                {about.text}
              </p>
            )}
          </div>
        ) : null}
      </main>

      <Lightbox
        src={lightbox}
        alt="Profile"
        onClose={() => setLightbox(null)}
      />

      <ConfirmDialog
        open={discardOpen}
        title="Discard changes?"
        confirmLabel="Discard"
        danger
        onConfirm={() => {
          setDiscardOpen(false)
          closeEditor()
        }}
        onCancel={() => setDiscardOpen(false)}
      />
    </>
  )
}
