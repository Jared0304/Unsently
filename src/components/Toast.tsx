import { CheckIcon } from './Icons'

export function Toast({ message }: { message: string | null }) {
  if (!message) return null

  return (
    <div
      className="pointer-events-none fixed bottom-24 left-1/2 z-40 -translate-x-1/2 animate-toast-in md:bottom-6 md:left-auto md:right-6 md:translate-x-0"
      role="status"
      aria-live="polite"
    >
      <div className="paper-card flex items-center gap-2 px-3.5 py-2 text-sm shadow-lift">
        <CheckIcon size={16} />
        <span>{message}</span>
      </div>
    </div>
  )
}
