import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../../components/app/Avatar'
import { DownloadIcon } from '../../components/icons'
import { cardHover, liftGhost } from '../../components/interactive'
import { deleteAccount, exportAccountData } from '../../lib/accountApi'
import { useAuth } from '../../lib/useAuth'

function AccountPage() {
  const { email, signOut } = useAuth()
  const navigate = useNavigate()

  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(false)

  const [confirming, setConfirming] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(false)

  async function handleExport() {
    setExporting(true)
    setExportError(false)
    try {
      await exportAccountData()
    } catch {
      setExportError(true)
    } finally {
      setExporting(false)
    }
  }

  async function handleSignOut() {
    // Navigate off this RequireAuth-protected route before the session
    // actually clears — see DashboardShell's handleSignOut for why.
    navigate('/')
    await signOut()
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(false)
    try {
      await deleteAccount()
      await signOut()
      navigate('/')
    } catch {
      setDeleteError(true)
      setDeleting(false)
    }
  }

  const canConfirmDelete = confirmText.trim().toLowerCase() === (email ?? '').trim().toLowerCase()

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Account</h1>
        <p className="mt-1 text-sm text-ink-muted">Manage your data and your account.</p>
      </div>

      <div className={`flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-6 ${cardHover}`}>
        <Avatar email={email ?? 'A'} />
        <div>
          <p className="text-sm font-medium text-ink">{email}</p>
          <p className="text-xs text-ink-faint">Free plan</p>
        </div>
      </div>

      <div className={`rounded-2xl border border-white/8 bg-white/3 p-6 ${cardHover}`}>
        <h2 className="text-sm font-medium text-ink">Export your data</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Download every scan, insight, and notification signup tied to this account as a single JSON file.
        </p>
        {exportError && <p className="mt-2 text-xs text-red-400">Couldn&apos;t generate the export. Try again.</p>}
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className={`mt-4 flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-ink disabled:cursor-not-allowed disabled:opacity-60 ${liftGhost}`}
        >
          <DownloadIcon className="h-3.5 w-3.5" />
          {exporting ? 'Preparing…' : 'Download my data'}
        </button>
      </div>

      <div className={`rounded-2xl border border-white/8 bg-white/3 p-6 ${cardHover}`}>
        <h2 className="text-sm font-medium text-ink">Sign out</h2>
        <p className="mt-1 text-sm text-ink-muted">Sign out of your account on this device.</p>
        <button
          type="button"
          onClick={handleSignOut}
          className={`mt-4 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-ink ${liftGhost}`}
        >
          Sign out
        </button>
      </div>

      <div className="rounded-2xl border border-red-500/20 bg-red-500/3 p-6">
        <h2 className="text-sm font-medium text-ink">Delete account</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Permanently deletes your account and every scan, insight, and notification signup tied to it. This
          can&apos;t be undone.
        </p>

        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-4 rounded-full border border-red-500/30 px-4 py-2 text-xs font-medium text-red-400 transition-colors duration-150 hover:bg-red-500/10"
          >
            Delete my account
          </button>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <label className="text-xs text-ink-muted">
              Type <span className="font-medium text-ink">{email}</span> to confirm.
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink outline-none focus:border-red-500/40"
              placeholder={email ?? ''}
            />
            {deleteError && <p className="text-xs text-red-400">Something went wrong. Try again.</p>}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canConfirmDelete || deleting}
                className="rounded-full bg-red-500 px-4 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleting ? 'Deleting…' : 'Permanently delete'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false)
                  setConfirmText('')
                }}
                disabled={deleting}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-ink-muted disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountPage
