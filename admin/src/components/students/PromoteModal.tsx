'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { adminApi, ApiError, PromotePreviewItem } from '@/lib/api';
import crud from '@/components/crud.module.css';
import styles from './students.module.css';

interface PromoteModalProps {
  studentIds: string[];
  className?: string;
  onClose: () => void;
  onDone: () => void;
}

export function PromoteModal({ studentIds, className, onClose, onDone }: PromoteModalProps) {
  const [items, setItems] = useState<PromotePreviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ promoted: number; skipped: number } | null>(null);
  const { status, data: session } = useSession();

  useEffect(() => {
    const body = studentIds.length
      ? { student_ids: studentIds }
      : className
        ? { class_name: className }
        : { student_ids: [] };
    const token = session?.accessToken ?? (session as any)?.access_token ?? undefined;
    adminApi(token)
      .promotePreview(body)
      .then(setItems)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = '/login';
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Preview failed');
      })
      .finally(() => setLoading(false));
  }, [studentIds, className]);

  const canPromote = items.some((i) => i.can_promote);

  async function handlePromote() {
    if (!canPromote) return;
    setPromoting(true);
    setError('');
    const body = studentIds.length
      ? { student_ids: studentIds }
      : className
        ? { class_name: className }
        : { student_ids: studentIds };

    try {
      const token = session?.accessToken ?? (session as any)?.access_token ?? undefined;
      const res = await adminApi(token).promoteStudents(body);
      setResult({ promoted: res.promoted, skipped: res.skipped });
      setItems(res.items);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = '/login';
        return;
      }
      setError(err instanceof ApiError ? err.message : 'Promotion failed');
    } finally {
      setPromoting(false);
    }
  }

  return (
    <div className={crud.modalOverlay} onClick={onClose}>
      <div className={crud.modal} style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <h3 className={crud.modalTitle}>Promote Students</h3>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: '#6b7c93' }}>
          Nursery 1 → Nursery 2 → Primary 1 → Primary 2 → Primary 3
        </p>

        {error && <div className={crud.formError}>{error}</div>}

        {loading ? (
          <div className={crud.empty}>Loading preview…</div>
        ) : items.length === 0 ? (
          <div className={crud.empty}>No students selected for promotion.</div>
        ) : (
          <div className={styles.promoteList}>
            {items.map((item) => (
              <div key={item.student_id} className={styles.promoteRow}>
                <div>
                  <strong>{item.student_name}</strong>
                  <span className={styles.promotePath}>
                    {item.from_class ?? '—'} → {item.to_class ?? '—'}
                  </span>
                </div>
                {item.can_promote ? (
                  <span className={`${crud.badge} ${crud.badgeActive}`}>Ready</span>
                ) : (
                  <span className={`${crud.badge} ${crud.badgeSuspended}`} title={item.reason ?? ''}>
                    Skip
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {result && (
          <div className={crud.successBanner} style={{ marginTop: 16 }}>
            Promoted {result.promoted} student{result.promoted !== 1 ? 's' : ''}.
            {result.skipped > 0 && ` ${result.skipped} skipped.`}
          </div>
        )}

        <div className={crud.modalActions}>
          <button type="button" className={crud.secondaryBtn} onClick={onClose}>
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button
              type="button"
              className={crud.primaryBtn}
              disabled={loading || promoting || !canPromote}
              onClick={handlePromote}
            >
              {promoting ? 'Promoting…' : 'Confirm promotion'}
            </button>
          )}
          {result && (
            <button type="button" className={crud.primaryBtn} onClick={onDone}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
