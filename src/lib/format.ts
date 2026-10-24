export function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60_000) return 'Just now'
  if (diff < 3_600_000) return `${Math.max(1, Math.floor(diff / 60_000))}m`
  if (diff < 86_400_000) return `${Math.max(1, Math.floor(diff / 3_600_000))}h`

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatFullDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
