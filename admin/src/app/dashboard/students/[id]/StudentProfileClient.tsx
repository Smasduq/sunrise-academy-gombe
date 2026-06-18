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
  const { data: session } = useSession();
  const token = session?.accessToken ?? '';
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
    if (!token || !id) return;

    setLoading(true);
    setError('');

    adminApi(token)
      .studentProfile(id)
      .then((data) => {
        setProfile(data);
        adminApi(token).logStudentView(id).catch(() => null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [token, id]);

  useEffect(() => {
    if (!token || !id) return;

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
      .catch(() => {
        setResults(null);
        setAttendance(null);
        setSettings(null);
      })
      .finally(() => setLoadingExtras(false));
  }, [token, id]);

  async function handlePrintCard() {
    if (!profile || !token) return;
    const schoolSettings = settings ?? (await adminApi(token).settings().catch(() => null));
    openStudentIdCard(profile.student, schoolSettings);
  }

  function refreshProfile() {
    if (!token || !id) return;
    adminApi(token)
      .studentProfile(id)
      .then(setProfile)
      .catch(() => null);
    Promise.all([
      adminApi(token).studentResults(id),
      adminApi(token).studentAttendance(id),
    ])
      .then(([r, a]) => {
        setResults(r);
        setAttendance(a);
      })
      .catch(() => null);
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
          token={token}
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
          token={token}
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
