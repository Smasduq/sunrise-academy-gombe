'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { adminApi, ApiError, StudentAttendanceData, StudentRecord } from '@/lib/api';
import { StudentProfileShell } from '@/components/students/StudentProfileShell';
import { openStudentIdCard } from '@/components/students/studentCard';
import crud from '@/components/crud.module.css';
import styles from '@/components/students/students.module.css';

function exportAttendanceCsv(student: StudentRecord, data: StudentAttendanceData) {
  const headers = ['Date', 'Status', 'Term', 'Session', 'Remark'];
  const rows = data.records.map((r) => [
    r.date,
    r.status,
    r.term_name ?? '',
    r.session_name ?? '',
    r.remark ?? '',
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `attendance-${student.admission_number}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function AttendanceCalendar({ records, month }: { records: StudentAttendanceData['records']; month: string }) {
  const [year, mon] = month.split('-').map(Number);
  const firstDay = new Date(year, mon - 1, 1);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const startWeekday = firstDay.getDay();

  const byDate = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((r) => map.set(r.date, r.status));
    return map;
  }, [records]);

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push(<div key={`e-${i}`} className={styles.calCellEmpty} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(mon).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const status = byDate.get(dateStr);
    const cls =
      status === 'PRESENT'
        ? styles.calPresent
        : status === 'ABSENT'
          ? styles.calAbsent
          : status === 'LATE'
            ? styles.calLate
            : status === 'EXCUSED'
              ? styles.calExcused
              : '';
    cells.push(
      <div key={d} className={`${styles.calCell} ${cls}`} title={status ?? 'No record'}>
        <span>{d}</span>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.calWeekdays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className={styles.calGrid}>{cells}</div>
      <div className={styles.calLegend}>
        <span><i className={styles.calPresent} /> Present</span>
        <span><i className={styles.calAbsent} /> Absent</span>
        <span><i className={styles.calLate} /> Late</span>
        <span><i className={styles.calExcused} /> Excused</span>
      </div>
    </div>
  );
}

export function StudentAttendanceClient() {
  const { id } = useParams<{ id: string }>();
  const { status, data: session } = useSession();
  const isAuthenticated = status === 'authenticated';
  const token = session?.accessToken ?? (session as any)?.access_token ?? undefined;

  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [data, setData] = useState<StudentAttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [sessionFilter, setSessionFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    adminApi(token)
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
    adminApi(token)
      .studentAttendance(id, {
        month,
        session_name: sessionFilter || undefined,
        term_name: termFilter || undefined,
      })
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = '/login';
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Failed to load attendance');
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, id, month, sessionFilter, termFilter]);

  if (loading && !data) {
    return <div className={crud.empty}>Loading attendance…</div>;
  }

  if (error) {
    return <div className={crud.formError}>{error}</div>;
  }

  async function handlePrintCard() {
    if (!student) return;
    const settings = await adminApi(token).settings().catch((err) => {
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
          activeTab="attendance"
          onPrint={handlePrintCard}
        />
      )}

      {data && (
        <div className={styles.summaryCards} style={{ marginTop: 16 }}>
          <div className={styles.statCard}>
            <p className={styles.statValue}>{data.percent}%</p>
            <p className={styles.statLabel}>Attendance rate</p>
            <div className={styles.attendanceBar}>
              <div className={styles.attendanceFill} style={{ width: `${Math.min(100, data.percent)}%` }} />
            </div>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statValue}>{data.present}</p>
            <p className={styles.statLabel}>Present days</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statValue}>{data.absent}</p>
            <p className={styles.statLabel}>Absent days</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statValue}>{data.late}</p>
            <p className={styles.statLabel}>Late days</p>
          </div>
        </div>
      )}

      <div className={styles.filtersPanel}>
        <div className={styles.filtersRow}>
          <input
            type="month"
            className={crud.filterSelect}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Filter by month"
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
          {student && data && (
            <button type="button" className={crud.secondaryBtn} onClick={() => exportAttendanceCsv(student, data)}>
              Export report
            </button>
          )}
        </div>
      </div>

      <div className={crud.panel} style={{ marginBottom: 20, padding: '20px 24px' }}>
        <h2 className={crud.panelTitle} style={{ marginBottom: 16 }}>Monthly calendar</h2>
        {data && <AttendanceCalendar records={data.records} month={month} />}
      </div>

      <div className={crud.panel}>
        <div className={crud.panelHeader}>
          <h2 className={crud.panelTitle}>Attendance history</h2>
        </div>
        {!data || data.records.length === 0 ? (
          <div className={styles.emptyWrap}>
            <div className={styles.emptyIcon} aria-hidden />
            <h3 className={styles.emptyTitle}>No attendance records</h3>
            <p className={styles.emptyBody}>Records appear when teachers mark daily attendance.</p>
          </div>
        ) : (
          <div className={crud.tableWrap}>
            <table className={crud.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Term</th>
                  <th>Session</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`${crud.badge} ${
                          r.status === 'PRESENT' ? crud.badgeActive : crud.badgeSuspended
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>{r.term_name ?? '—'}</td>
                    <td>{r.session_name ?? '—'}</td>
                    <td>{r.remark ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
