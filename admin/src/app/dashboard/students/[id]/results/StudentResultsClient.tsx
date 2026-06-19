'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { adminApi, ApiError, StudentRecord, StudentResultsData } from '@/lib/api';
import { printResultSlip, openStudentIdCard } from '@/components/students/studentCard';
import { StudentProfileShell } from '@/components/students/StudentProfileShell';
import crud from '@/components/crud.module.css';
import styles from '@/components/students/students.module.css';

export function StudentResultsClient() {
  const { id } = useParams<{ id: string }>();
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [data, setData] = useState<StudentResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    adminApi()
      .studentProfile(id)
      .then((p) => setStudent(p.student))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = '/login';
        }
      });
  }, [isAuthenticated, id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    setLoading(true);
    adminApi()
      .studentResults(id, {
        session_name: sessionFilter || undefined,
        term_name: termFilter || undefined,
        search: search || undefined,
      })
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = '/login';
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Failed to load results');
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, id, sessionFilter, termFilter, search]);

  const currentTerm = useMemo(() => data?.results[0] ?? null, [data]);

  async function handleDownload(resultId: string) {
    const result = data?.results.find((r) => r.id === resultId);
    if (!result || !student) return;
    const settings = await adminApi().settings().catch((err) => {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = '/login';
        return null;
      }
      return null;
    });
    printResultSlip(student, result, settings);
  }

  if (loading && !data) {
    return <div className={crud.empty}>Loading results…</div>;
  }

  if (error) {
    return <div className={crud.formError}>{error}</div>;
  }

  async function handlePrintCard() {
    if (!student) return;
    const settings = await adminApi().settings().catch((err) => {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = '/login';
        return null;
      }
      return null;
    });
    openStudentIdCard(student, settings);
  }

  return (
    <div>
      {student && (
        <StudentProfileShell
          student={student}
          activeTab="results"
          onPrint={handlePrintCard}
        />
      )}

      <div className={styles.filtersPanel} style={{ marginTop: 16 }}>
        <div className={styles.filtersRow}>
          <input
            type="search"
            className={crud.searchInput}
            style={{ flex: 1, minWidth: 160 }}
            placeholder="Search subject, term, session…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className={crud.filterSelect} value={sessionFilter} onChange={(e) => setSessionFilter(e.target.value)}>
            <option value="">All sessions</option>
            {data?.sessions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className={crud.filterSelect} value={termFilter} onChange={(e) => setTermFilter(e.target.value)}>
            <option value="">All terms</option>
            {data?.terms.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {currentTerm && (
        <div className={styles.summaryCards}>
          <div className={styles.statCard}>
            <p className={styles.statValue}>{currentTerm.average ?? '—'}</p>
            <p className={styles.statLabel}>Latest average</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statValue}>{currentTerm.grade ?? '—'}</p>
            <p className={styles.statLabel}>Grade</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statValue}>{currentTerm.position ?? '—'}</p>
            <p className={styles.statLabel}>Class position</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statValue}>{currentTerm.term_name}</p>
            <p className={styles.statLabel}>Current term</p>
          </div>
        </div>
      )}

      <div className={crud.panel}>
        {!data || data.results.length === 0 ? (
          <div className={styles.emptyWrap}>
            <div className={styles.emptyIcon} aria-hidden />
            <h3 className={styles.emptyTitle}>No results recorded</h3>
            <p className={styles.emptyBody}>
              Results will appear here once teachers publish term results for this student.
            </p>
          </div>
        ) : (
          data.results.map((result) => (
            <div key={result.id} style={{ borderBottom: '1px solid #e8edf4' }}>
              <div className={crud.panelHeader}>
                <div>
                  <h2 className={crud.panelTitle}>
                    {result.session_name} · {result.term_name}
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, color: '#6b7c93' }}>
                    {result.class_name} · Avg {result.average ?? '—'} · Position {result.position ?? '—'}
                  </p>
                </div>
                <button type="button" className={crud.secondaryBtn} onClick={() => handleDownload(result.id)}>
                  Download PDF slip
                </button>
              </div>
              <div className={crud.tableWrap}>
                <table className={crud.table}>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Score</th>
                      <th>Grade</th>
                      <th>Teacher remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.scores.map((s, i) => (
                      <tr key={i}>
                        <td>{s.subject_name}</td>
                        <td>{s.score}</td>
                        <td>{s.grade ?? '—'}</td>
                        <td>{s.remark ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.remark && (
                <p style={{ padding: '12px 24px 20px', margin: 0, fontSize: 13, color: '#6b7c93' }}>
                  <strong>Class teacher:</strong> {result.remark}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
