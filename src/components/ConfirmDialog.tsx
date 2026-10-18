import { useId } from 'react'
import { useDialogFocus } from './useDialogFocus'

type ConfirmDialogProps = {
  title: string
  body: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ title, body, confirmLabel, cancelLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const dialogRef = useDialogFocus(onClose)
  const titleId = useId()

  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div
        className="dialog dialog-confirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id={titleId}>{title}</h2>
        <p>{body}</p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
