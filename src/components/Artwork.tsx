import { useState } from 'react'
import { MusicIcon } from './Icons'

interface ArtworkProps {
  src: string | null
  alt: string
  className?: string
  iconSize?: number
}

export function Artwork({
  src,
  alt,
  className = 'h-12 w-12',
  iconSize = 18,
}: ArtworkProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[9px_7px_10px_8px] border border-ink/25 bg-paper text-softink ${className}`}
        aria-hidden="true"
      >
        <MusicIcon size={iconSize} />
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-[9px_7px_10px_8px] border border-ink/25 object-cover ${className}`}
    />
  )
}
