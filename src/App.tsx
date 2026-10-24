import { useCallback, useEffect, useRef, useState } from 'react'
import type { Note, Tab } from './lib/types'
import { fetchNotes } from './lib/api'
import { NavBar } from './components/NavBar'
import { HomePage } from './components/HomePage'
import { NotesPage } from './components/NotesPage'
import { AboutPage } from './components/AboutPage'
import { Toast } from './components/Toast'
import { ConfirmDialog } from './components/ConfirmDialog'

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [feed, setFeed] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [feedError, setFeedError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [pendingTab, setPendingTab] = useState<Tab | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  const notify = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => {
      setToast(null)
      toastTimer.current = null
    }, 3200)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const loadFeed = useCallback(async () => {
    setLoading(true)
    setFeedError(null)
    try {
      setFeed(await fetchNotes())
    } catch {
      setFeedError("Couldn't load notes.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'home') void loadFeed()
  }, [tab, loadFeed])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [tab])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const handleNavigate = useCallback(
    (next: Tab) => {
      if (next === tab) return
      if (dirty) {
        setPendingTab(next)
        return
      }
      setTab(next)
    },
    [tab, dirty],
  )

  const confirmTabChange = useCallback(() => {
    const next = pendingTab
    setPendingTab(null)
    setDirty(false)
    if (next) setTab(next)
  }, [pendingTab])

  const handlePublishComplete = useCallback(
    (note: Note) => {
      setDirty(false)
      setFeed((current) => [note, ...current.filter((item) => item.id !== note.id)])
      setTab('home')
      notify('Published')
    },
    [notify],
  )

  const handleFeedChanged = useCallback(() => {
    void loadFeed()
  }, [loadFeed])

  return (
    <div className="min-h-screen">
      <NavBar active={tab} onChange={handleNavigate} />

      {tab === 'home' ? (
        <HomePage
          notes={feed}
          loading={loading}
          error={feedError}
          onRetry={() => void loadFeed()}
          onWrite={() => handleNavigate('notes')}
        />
      ) : null}

      {tab === 'notes' ? (
        <NotesPage
          onDirtyChange={setDirty}
          onPublishComplete={handlePublishComplete}
          onFeedChanged={handleFeedChanged}
          notify={notify}
        />
      ) : null}

      {tab === 'about' ? (
        <AboutPage onDirtyChange={setDirty} notify={notify} />
      ) : null}

      <Toast message={toast} />

      <ConfirmDialog
        open={pendingTab !== null}
        title="Discard changes?"
        confirmLabel="Discard"
        danger
        onConfirm={confirmTabChange}
        onCancel={() => setPendingTab(null)}
      />
    </div>
  )
}
