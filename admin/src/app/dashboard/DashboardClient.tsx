'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { adminApi, ApiError, DashboardOverview } from '@/lib/api';
import crud from '@/components/crud.module.css';
import dash from '@/components/dashboard.module.css';

export function DashboardClient() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? '';
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    adminApi(token)
      .dashboard()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className={crud.empty}>Loading dashboard…</div>;
  }

  if (error || !data) {
    return <div className={crud.formError}>{error || 'Dashboard unavailable'}</div>;
  }

  return (
    <>
      <div className={dash.sessionBanner}>
        <div>
          <h2>{data.academic_session ?? '2025/2026'} · {data.current_term ?? 'Current Term'}</h2>
          <p>Sunrise Academy Gombe — Nursery & Primary</p>
        </div>
        <Link href="/dashboard/settings" className={crud.secondaryBtn} style={{ color: '#0b3d6d' }}>
          School settings
        </Link>
      </div>

      <div className={dash.stats}>
        <div className={`${dash.statCard} ${dash.statCardAccent}`}>
          <p className={dash.statValue}>{data.students}</p>
          <p className={dash.statLabel}>Total Students</p>
        </div>
        <div className={dash.statCard}>
          <p className={dash.statValue}>{data.staff}</p>
          <p className={dash.statLabel}>Total Staff</p>
        </div>
        <div className={dash.statCard}>
          <p className={dash.statValue}>{data.classes}</p>
          <p className={dash.statLabel}>Classes</p>
          <p className={dash.statHint}>Nursery 1–2, Primary 1–3</p>
        </div>
        <div className={`${dash.statCard} ${dash.statCardWarn}`}>
          <p className={dash.statValue}>{data.admissions_pending}</p>
          <p className={dash.statLabel}>Pending Admissions</p>
          <p className={dash.statHint}>{data.admissions_total} total applications</p>
        </div>
      </div>

      <div className={dash.grid2}>
        <div className={crud.panel}>
          <div className={crud.panelHeader}>
            <h2 className={crud.panelTitle}>Today&apos;s attendance</h2>
            <Link href="/dashboard/attendance" className={crud.secondaryBtn}>
              View all
            </Link>
          </div>
          <div className={dash.attendanceRow}>
            <div className={dash.attendancePill}>
              <strong>{data.attendance_present_today}</strong>
              <span>Present</span>
            </div>
            <div className={dash.attendancePill}>
              <strong>{data.attendance_absent_today}</strong>
              <span>Absent</span>
            </div>
            <div className={dash.attendancePill}>
              <strong>{data.attendance_late_today}</strong>
              <span>Late</span>
            </div>
          </div>
        </div>

        <div className={crud.panel}>
          <div className={crud.panelHeader}>
            <h2 className={crud.panelTitle}>Admissions pipeline</h2>
            <Link href="/dashboard/admissions" className={crud.secondaryBtn}>
              Manage
            </Link>
          </div>
          <div className={dash.attendanceRow}>
            <div className={dash.attendancePill}>
              <strong>{data.admissions_pending}</strong>
              <span>Pending</span>
            </div>
            <div className={dash.attendancePill}>
              <strong>{data.admissions_approved}</strong>
              <span>Approved</span>
            </div>
            <div className={dash.attendancePill}>
              <strong>{data.admissions_rejected}</strong>
              <span>Rejected</span>
            </div>
          </div>
        </div>
      </div>

      <div className={crud.panel} style={{ marginBottom: 16 }}>
        <div className={crud.panelHeader}>
          <h2 className={crud.panelTitle}>Quick actions</h2>
        </div>
        <div className={dash.quickActions}>
          <Link href="/dashboard/students" className={dash.quickAction}>
            Add student
            <span>Register a new pupil</span>
          </Link>
          <Link href="/dashboard/staff" className={dash.quickAction}>
            Add staff
            <span>Register a teacher</span>
          </Link>
          <Link href="/dashboard/admissions" className={dash.quickAction}>
            Review applications
            <span>{data.admissions_pending} pending</span>
          </Link>
          <Link href="/dashboard/announcements" className={dash.quickAction}>
            Post announcement
            <span>Notify parents & staff</span>
          </Link>
        </div>
      </div>

      <div className={dash.grid2}>
        <div className={crud.panel}>
          <div className={crud.panelHeader}>
            <h2 className={crud.panelTitle}>Recent activity</h2>
            <Link href="/dashboard/activity" className={crud.secondaryBtn}>
              Full log
            </Link>
          </div>
          {data.recent_activities.length === 0 ? (
            <div className={crud.empty}>No activity recorded yet.</div>
          ) : (
            <ul className={dash.activityList}>
              {data.recent_activities.map((log) => (
                <li key={log.id} className={dash.activityItem}>
                  <strong>{log.admin_name}</strong> {log.action.toLowerCase()}d {log.entity_type}
                  {log.details ? ` — ${log.details}` : ''}
                  <div className={dash.activityMeta}>
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={crud.panel}>
          <div className={crud.panelHeader}>
            <h2 className={crud.panelTitle}>Announcements</h2>
            <Link href="/dashboard/announcements" className={crud.secondaryBtn}>
              Manage
            </Link>
          </div>
          {data.announcements.length === 0 ? (
            <div className={crud.empty}>No active announcements.</div>
          ) : (
            <ul className={dash.announcementList}>
              {data.announcements.map((a) => (
                <li key={a.id} className={dash.announcementItem}>
                  <p className={dash.announcementTitle}>{a.title}</p>
                  <p className={dash.announcementBody}>{a.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
