'use client';

import crud from '@/components/crud.module.css';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className={crud.modalOverlay} onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className={crud.modal} style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <h3 id="confirm-title" className={crud.modalTitle}>{title}</h3>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6b7c93', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {message}
        </p>
        <div className={crud.modalActions}>
          <button type="button" className={crud.secondaryBtn} onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? crud.dangerBtn : crud.primaryBtn}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
