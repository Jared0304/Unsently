import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, loginAdmin, logoutAdmin } from '../lib/api'
import { Modal } from './Modal'
import { LockIcon, Spinner } from './Icons'

interface AdminDialogProps {
  open: boolean
  isAdmin: boolean
  enabled: boolean
  onClose: () => void
  onLoggedIn: () => void
  onLoggedOut: () => void
  notify: (message: string) => void
}

export function AdminDialog({
  open,
  isAdmin,
  enabled,
  onClose,
  onLoggedIn,
  onLoggedOut,
  notify,
}: AdminDialogProps) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setPassword('')
    setError(null)
    setBusy(false)
  }, [open])

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    if (!password.trim()) {
      setError('Enter the admin password.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      await loginAdmin(password)
      onLoggedIn()
      onClose()
      notify('Admin mode on')
    } catch (loginError) {
      setError(
        loginError instanceof ApiError
          ? loginError.message
          : 'Could not sign in.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleLogout() {
    setBusy(true)
    setError(null)
    try {
      await logoutAdmin()
      onLoggedOut()
      onClose()
      notify('Admin mode off')
    } catch (logoutError) {
      setError(
        logoutError instanceof ApiError
          ? logoutError.message
          : 'Could not sign out.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Admin" panelClassName="max-w-sm">
      <div className="paper-card p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-ink/45 bg-butter">
            <LockIcon size={17} />
          </span>
          <div>
            <h2 className="font-hand text-2xl leading-none">Admin</h2>
            <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-softink">
              {isAdmin ? 'Signed in' : 'Private controls'}
            </p>
          </div>
        </div>

        {!enabled ? (
          <p className="mt-5 text-sm leading-6 text-softink">
            Admin is not configured on the server. Set the{' '}
            <code className="rounded bg-ink/5 px-1 py-0.5">ADMIN_PASSWORD</code>{' '}
            environment variable and restart the app.
          </p>
        ) : isAdmin ? (
          <>
            <p className="mt-5 text-sm leading-6 text-ink/85">
              Admin mode is on. Delete controls now appear on every note, and
              you can edit the About page.
            </p>
            {error ? (
              <p className="mt-3 rounded-[10px_8px_11px_9px] border border-[#8f3f34]/25 bg-[#fbe9e3] px-3 py-2 text-sm text-[#7c342a]" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn" onClick={onClose} disabled={busy}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => void handleLogout()}
                disabled={busy}
              >
                {busy ? <Spinner size={14} /> : null}
                Sign out
              </button>
            </div>
          </>
        ) : (
          <form className="mt-5" onSubmit={(event) => void handleLogin(event)}>
            <label htmlFor="admin-password" className="field-label">
              Admin password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              className="field"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={busy}
            />

            {error ? (
              <p className="mt-3 rounded-[10px_8px_11px_9px] border border-[#8f3f34]/25 bg-[#fbe9e3] px-3 py-2 text-sm text-[#7c342a]" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? <Spinner size={14} /> : null}
                Sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
