import type { MusicTrack } from '../lib/types'
import { useAudioPreview } from '../hooks/useAudioPreview'
import { PauseIcon, PlayIcon, Spinner } from './Icons'

interface PreviewButtonProps {
  previewKey: string
  track: MusicTrack
  className?: string
  size?: number
}

export function MusicPreviewButton({
  previewKey,
  track,
  className = 'icon-btn',
  size = 16,
}: PreviewButtonProps) {
  const { currentKey, isPlaying, isLoading, toggle } = useAudioPreview()
  const isActive = currentKey === previewKey
  const playing = isActive && isPlaying
  const loading = isActive && isLoading

  return (
    <button
      type="button"
      onClick={() => toggle(previewKey, track)}
      className={className}
      aria-label={playing ? 'Pause preview' : 'Play preview'}
    >
      {loading ? (
        <Spinner size={size} />
      ) : playing ? (
        <PauseIcon size={size} />
      ) : (
        <PlayIcon size={size} />
      )}
    </button>
  )
}
