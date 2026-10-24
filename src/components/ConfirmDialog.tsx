import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  confirmLabel,
  cancelLabel = 'Cancel',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      ariaLabel={title}
      panelClassName="max-w-sm"
    >
      <div className="paper-card p-5">
        <p className="font-hand text-2xl leading-tight">{title}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
