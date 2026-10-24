import type { About, MusicTrack, Note } from './types'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      credentials: 'same-origin',
      ...init,
    })
  } catch {
    throw new ApiError('Network error.', 0)
  }

  const data = (await response.json().catch(() => null)) as
    | { error?: string }
    | null

  if (!response.ok) {
    throw new ApiError(data?.error || 'Something went wrong.', response.status)
  }

  return data as T
}

export async function fetchNotes(): Promise<Note[]> {
  const data = await request<{ notes: Note[] }>('/api/notes')
  return data.notes
}

export async function fetchMyNotes(): Promise<Note[]> {
  const data = await request<{ notes: Note[] }>('/api/notes/mine')
  return data.notes
}

export async function createNote(form: FormData): Promise<Note> {
  const data = await request<{ note: Note }>('/api/notes', {
    method: 'POST',
    body: form,
  })
  return data.note
}

export async function updateNote(
  id: string,
  form: FormData,
): Promise<Note> {
  const data = await request<{ note: Note }>(`/api/notes/${id}`, {
    method: 'PATCH',
    body: form,
  })
  return data.note
}

export async function deleteNote(id: string): Promise<void> {
  await request<{ ok: true }>(`/api/notes/${id}`, {
    method: 'DELETE',
  })
}

export async function searchMusic(
  query: string,
  signal: AbortSignal,
): Promise<MusicTrack[]> {
  const data = await request<{ results: MusicTrack[] }>(
    `/api/music/search?q=${encodeURIComponent(query)}`,
    { signal },
  )
  return data.results
}

export async function fetchAbout(): Promise<About> {
  const data = await request<{ about: About }>('/api/about')
  return data.about
}

export async function saveAbout(form: FormData): Promise<About> {
  const data = await request<{ about: About }>('/api/about', {
    method: 'PUT',
    body: form,
  })
  return data.about
}
