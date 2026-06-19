'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  adminApi,
  ApiError,
  SchoolSettings,
  StudentAttendanceData,
  StudentProfile,
  StudentResultsData,
} from '@/lib/api';
import { useAdminData } from '@/components/AdminDataProvider';
import { EditStudentModal } from '@/components/students/EditStudentModal';
import { PromoteModal } from '@/components/students/PromoteModal';
import { openStudentIdCard } from '@/components/students/studentCard';
import { StudentOverview } from '@/components/students/StudentOverview';
import { StudentProfileShell } from '@/components/students/StudentProfileShell';
import crud from '@/components/crud.module.css';

export function StudentProfileClient() {
  const { id } = useParams<{ id: string }>();
  const { status, data: session } = useSession();
  const isAuthenticated = status === 'authenticated';
  const token = session?.accessToken ?? (session as any)?.access_token ?? undefined;
  const { classes, loadClasses } = useAdminData();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [results, setResults] = useState<StudentResultsData | null>(null);
  const [attendance, setAttendance] = useState<StudentAttendanceData | null>(null);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingExtras, setLoadingExtras] = useState(true);
  const [error, setError] = useState('');
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    setLoading(true);
    setError('');

    adminApi(token)
      .studentProfile(id)
      .then((data) => {
        setProfile(data);
        adminApi(token).logStudentView(id).catch(() => null);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = '/login';
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Failed to load profile');
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    setLoadingExtras(true);
    Promise.all([
      adminApi(token).studentResults(id),
      adminApi(token).studentAttendance(id),
      adminApi(token).settings(),
    ])
      .then(([r, a, s]) => {
        setResults(r);
        setAttendance(a);
        setSettings(s);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = '/login';
          return;
        }
        setResults(null);
        setAttendance(null);
        setSettings(null);
      })
      .finally(() => setLoadingExtras(false));
  }, [isAuthenticated, id]);

  async function handlePrintCard() {
    if (!profile) return;
    const schoolSettings = settings ?? (await adminApi(token).settings().catch((err) => {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = '/login';
        return null;
      }
      return null;
    }));
    openStudentIdCard(profile.student, schoolSettings);
  }

  function refreshProfile() {
    if (!isAuthenticated || !id) return;
    adminApi(token)
      .studentProfile(id)
      .then(setProfile)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = '/login';
        }
      });
    Promise.all([
      adminApi(token).studentResults(id),
      adminApi(token).studentAttendance(id),
    ])
      .then(([r, a]) => {
        setResults(r);
        setAttendance(a);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = '/login';
        }
      });
  }

  if (loading) {
    return <div className={crud.empty}>Loading student profile…</div>;
  }

  if (error || !profile) {
    return (
      <div>
        <div className={crud.formError}>{error || 'Student not found'}</div>
        <Link href="/dashboard/students" className={crud.secondaryBtn} style={{ marginTop: 16, display: 'inline-block' }}>
          ← Back to students
        </Link>
      </div>
    );
  }

  const { student } = profile;

  return (
    <div>
      <StudentProfileShell
        student={student}
        activeTab="overview"
        onEdit={() => setEditOpen(true)}
        onPrint={handlePrintCard}
      />

      <StudentOverview
        profile={profile}
        results={results}
        attendance={attendance}
        settings={settings}
        loadingExtras={loadingExtras}
      />

      {promoteOpen && (
        <PromoteModal
          studentIds={[student.id]}
          onClose={() => setPromoteOpen(false)}
          onDone={() => {
            setPromoteOpen(false);
            refreshProfile();
          }}
        />
      )}

      {editOpen && (
        <EditStudentModal
          student={student}
          classes={classes}
          open
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            setProfile((p) => (p ? { ...p, student: updated } : p));
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}
