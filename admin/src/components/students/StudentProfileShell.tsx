'use client';

import Link from 'next/link';
import type { StudentRecord } from '@/lib/api';
import { fullName, initials } from '@/components/students/utils';
import crud from '@/components/crud.module.css';
import styles from '@/components/students/students.module.css';

export type ProfileTab = 'overview' | 'results' | 'attendance';

interface StudentProfileShellProps {
  student: StudentRecord;
  activeTab: ProfileTab;
  onEdit?: () => void;
  onPrint?: () => void;
}

const TABS: { key: ProfileTab; label: string; href: (id: string) => string }[] = [
  { key: 'overview', label: 'Overview', href: (id) => `/dashboard/students/${id}` },
  { key: 'results', label: 'Results', href: (id) => `/dashboard/students/${id}/results` },
  { key: 'attendance', label: 'Attendance', href: (id) => `/dashboard/students/${id}/attendance` },
];

function statusLabel(student: StudentRecord) {
  if (student.is_archived) return 'Archived';
  if (student.status === 'SUSPENDED') return 'Suspended';
  return student.status === 'ACTIVE' ? 'Active' : 'Inactive';
}

function statusBadgeClass(student: StudentRecord) {
  if (student.is_archived || student.status === 'SUSPENDED') return crud.badgeSuspended;
  return student.status === 'ACTIVE' ? crud.badgeActive : crud.badgeSuspended;
}

export function StudentProfileShell({
  student,
  activeTab,
  onEdit,
  onPrint,
}: StudentProfileShellProps) {
  const admitted = student.admission_date
    ? new Date(student.admission_date).toLocaleDateString()
    : new Date(student.created_at).toLocaleDateString();

  return (
    <div>
      <Link
        href="/dashboard/students"
        style={{ fontSize: 13, color: '#0b6fd4', textDecoration: 'none' }}
      >
        ← Students
      </Link>

      <div className={styles.profileHeader} style={{ marginTop: 12 }}>
        <div className={styles.profileHeaderMain}>
          <div className={styles.profileHeaderPhoto}>
            {student.photo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={student.photo_url} alt="" />
            ) : (
              initials(student)
            )}
          </div>

          <div className={styles.profileHeaderInfo}>
            <h1 className={styles.profileHeaderName}>{fullName(student)}</h1>
            <p className={styles.profileHeaderMeta}>
              {student.admission_number}
              {student.class_name ? ` · ${student.class_name}` : ''}
              {student.gender ? ` · ${student.gender}` : ''}
              {student.date_of_birth
                ? ` · DOB ${new Date(student.date_of_birth).toLocaleDateString()}`
                : ''}
              {` · Admitted ${admitted}`}
            </p>
            <div className={styles.profileHeaderBadges}>
              <span className={`${crud.badge} ${statusBadgeClass(student)}`}>
                {statusLabel(student)}
              </span>
            </div>
          </div>

          <div className={styles.profileHeaderActions}>
            {onEdit && (
              <button type="button" className={crud.secondaryBtn} onClick={onEdit}>
                Edit Student
              </button>
            )}
            <Link href={`/dashboard/students/${student.id}/results`} className={crud.secondaryBtn}>
              View Results
            </Link>
            <Link href={`/dashboard/students/${student.id}/attendance`} className={crud.secondaryBtn}>
              View Attendance
            </Link>
            {onPrint && (
              <button type="button" className={crud.primaryBtn} onClick={onPrint}>
                Print Student Card
              </button>
            )}
          </div>
        </div>
      </div>

      <nav className={styles.profileTabs} aria-label="Student profile sections">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href(student.id)}
            className={`${styles.profileTab} ${activeTab === tab.key ? styles.profileTabActive : ''}`}
            aria-current={activeTab === tab.key ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
