import type { SVGProps } from 'react'
import type { DoodleStyle } from '../lib/types'

type DoodleProps = SVGProps<SVGSVGElement>

export function DoodleStar({ className = '', ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M16 3.8 18.7 12l8 .7-6 5.1 1.8 7.8-6.5-4.3-6.9 4.1 2.1-7.6-5.8-5.3 8-.5L16 3.8Z" />
      <path d="M5.4 5.8c.5-.2.9-.2 1.3 0M27 23.4c.4-.1.8 0 1.1.3" />
    </svg>
  )
}

export function DoodleSparkle({ className = '', ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3.5c.3 4.2 2.3 6.2 6.5 6.5-4.2.3-6.2 2.3-6.5 6.5-.3-4.2-2.3-6.2-6.5-6.5 4.2-.3 6.2-2.3 6.5-6.5Z" />
    </svg>
  )
}

export function DoodleHeart({ className = '', ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M16 27c-1.7-1.8-11.2-7.9-11.2-15.1 0-4.1 5.1-6 7.4-2.8L16 13l3.8-3.9c2.3-3.2 7.4-1.3 7.4 2.8C27.2 19.1 17.7 25.2 16 27Z" />
      <path d="M8.3 10.2c.8-1.7 2.3-2.2 3.8-1.3" />
    </svg>
  )
}

export function DoodleFlower({ className = '', ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M16 15.8c-1.9-4.2-.6-8 2.8-8.7 2.7-.5 4.6 2.6 3.2 5.2-1.1 2-3.2 3.1-6 3.5Z" />
      <path d="M16.2 16c3.8-2.6 7.6-2.2 9.1 1 1.2 2.5-1.4 5.2-4.3 4.4-2.2-.6-3.6-2.4-4.8-5.4Z" />
      <path d="M16 16.2c1.8 4.2.4 7.9-3 8.5-2.7.5-4.5-2.7-3-5.2 1.2-2 3.2-3 6-3.3Z" />
      <path d="M15.8 16c-3.8 2.5-7.6 2-9-1.2-1.1-2.5 1.5-5.1 4.4-4.3 2.2.6 3.5 2.5 4.6 5.5Z" />
      <circle cx="16" cy="16" r="2.1" />
      <path d="M16.5 18.1c.8 3.7 2.4 5.4 4.9 6.4" />
    </svg>
  )
}

export function DoodleClip({ className = '', ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 36"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M16.7 10.4v15.2c0 3.2-2.2 5.4-5 5.4s-5-2.2-5-5.4V9.1c0-2 1.5-3.6 3.4-3.6s3.4 1.6 3.4 3.6v15.5c0 .8-.6 1.4-1.4 1.4s-1.4-.6-1.4-1.4V11" />
    </svg>
  )
}

export function DoodleScribble({ className = '', ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 120 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M2 10.5c9-4.7 15.2 3.4 24.5-1.1 7.3-3.6 10.7 3.4 18.5.9 9.8-3.1 13.7 3.2 23.2.1 8.1-2.7 14.2 3.6 22.7.7 7.3-2.5 11.8 2.7 26.8-1.7" />
    </svg>
  )
}

export function DoodleArrow({ className = '', ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 64 44"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M5 30c12-15 30-23 51-20" />
      <path d="m47 5.5 9.5 4.2-6.6 8.2" />
    </svg>
  )
}

export function DoodleAvatar({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="51" fill="#f6edc8" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M60 9c4.7 4.9 5.2 10.1 1.5 15.5M92 19.5c1.1 6.5-1.4 10.9-7.4 13.1M104 51c-4.4 4.7-9.2 5.6-14.4 2.6M91.5 90.5c-6.2 2-10.9.6-14.1-4.3M60 105c-5.1-3.9-6.5-8.6-4.2-14.2M27 92c-1.5-6.4.8-11 6.7-13.7M15.5 62c4.1-4.9 8.8-6.2 14.2-3.9M24.5 28.5c6.2-1.9 10.9-.4 14 4.6"
        stroke="#2c2a26"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="48" cy="57" r="2.2" fill="#2c2a26" />
      <circle cx="72" cy="57" r="2.2" fill="#2c2a26" />
      <path
        d="M50 73c3.2 3.9 6.5 5.8 10 5.8s6.8-1.9 10-5.8"
        stroke="#2c2a26"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M45 48c2.2-2.3 4.8-2.9 7.6-1.8M68 46.5c2.7-1.2 5.2-.7 7.5 1.4" stroke="#2c2a26" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M60 82c-1.7 4.4-1.2 8.1 1.5 11.1" stroke="#2c2a26" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function AnonMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.5 10s2.7-4.2 7.5-4.2 7.5 4.2 7.5 4.2-2.7 4.2-7.5 4.2S2.5 10 2.5 10Z" />
      <circle cx="10" cy="10" r="2" />
      <path d="m4 16 12-12" />
    </svg>
  )
}

export function NoteDecoration({ type }: { type: DoodleStyle }) {
  if (type === 'star') {
    return (
      <>
        <DoodleStar className="pointer-events-none absolute right-4 top-4 h-7 w-7 opacity-45" />
        <DoodleSparkle className="pointer-events-none absolute right-11 top-10 h-3 w-3 opacity-30" />
      </>
    )
  }

  if (type === 'heart') {
    return (
      <DoodleHeart className="pointer-events-none absolute right-4 top-4 h-7 w-7 opacity-40" />
    )
  }

  if (type === 'flower') {
    return (
      <>
        <DoodleFlower className="pointer-events-none absolute right-4 top-4 h-8 w-8 opacity-35" />
        <DoodleFlower className="pointer-events-none absolute bottom-5 left-4 h-4 w-4 rotate-12 opacity-20" />
      </>
    )
  }

  if (type === 'clip') {
    return (
      <DoodleClip className="pointer-events-none absolute -top-4 left-10 h-10 w-6 rotate-6 text-ink/55" />
    )
  }

  return null
}
