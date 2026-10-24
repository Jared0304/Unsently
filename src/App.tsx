import { useCallback, useEffect, useRef, useState } from 'react'
import type { Note, Tab } from './lib/types'
import { fetchAdminSession, fetchNotes } from './lib/api'
import { NavBar } from './components/NavBar'
import { HomePage } from './components/HomePage'
import { NotesPage } from './components/NotesPage'
import { AboutPage } from './components/AboutPage'
import { AdminDialog } from './components/AdminDialog'
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
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEnabled, setAdminEnabled] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
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

  useEffect(() => {
    let cancelled = false
    fetchAdminSession()
      .then((session) => {
        if (cancelled) return
        setIsAdmin(session.isAdmin)
        setAdminEnabled(session.enabled)
      })
      .catch(() => {
        // The public site still works if the admin check fails.
      })
    return () => {
      cancelled = true
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

  const handleNoteDeleted = useCallback((id: string) => {
    setFeed((current) => current.filter((note) => note.id !== id))
  }, [])

  return (
    <div className="min-h-screen">
      <NavBar
        active={tab}
        onChange={handleNavigate}
        isAdmin={isAdmin}
        adminEnabled={adminEnabled}
        onAdminClick={() => setAdminOpen(true)}
      />

      {tab === 'home' ? (
        <HomePage
          notes={feed}
          loading={loading}
          error={feedError}
          isAdmin={isAdmin}
          onRetry={() => void loadFeed()}
          onWrite={() => handleNavigate('notes')}
          onNoteDeleted={handleNoteDeleted}
          notify={notify}
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
        <AboutPage
          key={isAdmin ? 'admin' : 'guest'}
          onDirtyChange={setDirty}
          notify={notify}
        />
      ) : null}

      <AdminDialog
        open={adminOpen}
        isAdmin={isAdmin}
        enabled={adminEnabled}
        onClose={() => setAdminOpen(false)}
        onLoggedIn={() => setIsAdmin(true)}
        onLoggedOut={() => setIsAdmin(false)}
        notify={notify}
      />

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
