'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  adminApi,
  ActivityLog,
  ApiError,
  StudentRecord,
  StudentStats,
} from '@/lib/api';
import { useAdminData } from '@/components/AdminDataProvider';
import { PromoteModal } from '@/components/students/PromoteModal';
import { ConfirmDialog } from '@/components/students/ConfirmDialog';
import { EditStudentModal } from '@/components/students/EditStudentModal';
import { openStudentIdCard } from '@/components/students/studentCard';
import {
  PAGE_SIZE,
  SortKey,
  computeStats,
  exportStudentsCsv,
  filterStudents,
  fullName,
  initials,
  sortStudents,
} from '@/components/students/utils';
import crud from '@/components/crud.module.css';
import styles from '@/components/students/students.module.css';

function StudentPhoto({ student, className }: { student: StudentRecord; className?: string }) {
  if (student.photo_url) {
    return (
      <div className={className ?? styles.photoCell}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={student.photo_url} alt="" />
      </div>
    );
  }
  return <div className={className ?? styles.photoCell}>{initials(student)}</div>;
}

function ActionsMenu({
  student,
  onEdit,
  onPromote,
  onArchive,
  onDelete,
  onPrint,
}: {
  student: StudentRecord;
  onEdit: () => void;
  onPromote: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onPrint: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  return (
    <div className={styles.actionsMenu} ref={ref}>
      <button type="button" className={styles.menuBtn} onClick={() => setOpen((v) => !v)} aria-label="Actions">
        ⋮
      </button>
      {open && (
        <div className={styles.menuDropdown}>
          <Link href={`/dashboard/students/${student.id}`} className={styles.menuItem} onClick={() => setOpen(false)}>
            View profile
          </Link>
          <button type="button" className={styles.menuItem} onClick={() => { setOpen(false); onEdit(); }}>
            Edit student
          </button>
          <Link href={`/dashboard/students/${student.id}/results`} className={styles.menuItem} onClick={() => setOpen(false)}>
            View results
          </Link>
          <Link href={`/dashboard/students/${student.id}/attendance`} className={styles.menuItem} onClick={() => setOpen(false)}>
            View attendance
          </Link>
          <button type="button" className={styles.menuItem} onClick={() => { setOpen(false); onPromote(); }}>
            Promote student
          </button>
          <button type="button" className={styles.menuItem} onClick={() => { setOpen(false); onPrint(); }}>
            Print student card
          </button>
          {!student.is_archived && (
            <button type="button" className={styles.menuItem} onClick={() => { setOpen(false); onArchive(); }}>
              Archive student
            </button>
          )}
          <button
            type="button"
            className={`${styles.menuItem} ${styles.menuItemDanger}`}
            onClick={() => { setOpen(false); onDelete(); }}
          >
            Delete student
          </button>
        </div>
      )}
    </div>
  );
}

export function StudentsClient() {
  const { status, data: session } = useSession();
  const isAuthenticated = status === 'authenticated';
  const token = session?.accessToken ?? (session as any)?.access_token ?? undefined;

  const {
    students,
    classes,
    studentsLoading,
    studentsLoaded,
    error: loadError,
    loadStudents,
    loadClasses,
    setStudents,
  } = useAdminData();

  const [stats, setStats] = useState<StudentStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [success, setSuccess] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [promoteIds, setPromoteIds] = useState<string[]>([]);
  const [editStudent, setEditStudent] = useState<StudentRecord | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<{
    type: 'archive' | 'delete';
    student: StudentRecord;
    message: string;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const flash = useCallback((msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3500);
  }, []);

  useEffect(() => {
    loadClasses();
    loadStudents();
  }, [loadClasses, loadStudents]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setStatsLoading(true);
    adminApi(token)
      .studentStats()
      .then(setStats)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = '/login';
          return;
        }
        setStats(null);
      })
      .finally(() => setStatsLoading(false));

    adminApi(token)
      .activityLogs()
      .then((logs) => setActivities(logs.filter((l) => l.entity_type === 'student').slice(0, 8)))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = '/login';
          return;
        }
        setActivities([]);
      });
  }, [isAuthenticated, students.length]);

  const localStats = useMemo(() => computeStats(students), [students]);
  const displayStats = stats ?? {
    total: localStats.total,
    male: localStats.male,
    female: localStats.female,
    active: localStats.active,
    inactive: localStats.inactive,
    archived: localStats.archived,
    new_this_term: localStats.newThisTerm,
  };

  const admissionYears = useMemo(() => {
    const years = new Set<string>();
    students.forEach((s) => {
      years.add(new Date(s.created_at).getFullYear().toString());
      if (s.admission_date) years.add(new Date(s.admission_date).getFullYear().toString());
    });
    return [...years].sort((a, b) => Number(b) - Number(a));
  }, [students]);

  const filtered = useMemo(() => {
    const list = filterStudents(students, {
      search,
      classId: classFilter,
      gender: genderFilter,
      status: statusFilter,
      year: yearFilter,
      showArchived: statusFilter === 'ARCHIVED',
    });
    return sortStudents(list, sort);
  }, [students, search, classFilter, genderFilter, statusFilter, yearFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, classFilter, genderFilter, statusFilter, yearFilter, sort]);

  const allPageSelected = pageItems.length > 0 && pageItems.every((s) => selected.has(s.id));

  function toggleAllPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageItems.forEach((s) => next.delete(s.id));
      else pageItems.forEach((s) => next.add(s.id));
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openEdit(student: StudentRecord) {
    setEditStudent(student);
  }

  async function handlePrintCard(student: StudentRecord) {
    if (!isAuthenticated) return;
    const settings = await adminApi(token).settings().catch((err) => {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = '/login';
        return null;
      }
      return null;
    });
    openStudentIdCard(student, settings);
  }

  function requestArchive(student: StudentRecord) {
    setPendingConfirm({
      type: 'archive',
      student,
      message: `Archive ${fullName(student)}?\n\nThey will be hidden from active lists but all records (results, attendance, fees) will be kept. You can restore them from Archived Students.`,
    });
  }

  async function requestDelete(student: StudentRecord) {
    if (!isAuthenticated) return;
    try {
      const check = await adminApi(token).studentDeleteCheck(student.id);
      let message = `Delete ${fullName(student)}?\n\nThis is a soft delete — the record is hidden but not permanently removed from the database.`;
      if (check.has_records) {
        message += `\n\n⚠ This student has existing records:\n• ${check.results_count} result(s)\n• ${check.attendance_count} attendance record(s)\n• ${check.fee_count} fee record(s)\n\nConsider archiving instead if you want to preserve easy access.`;
      }
      setPendingConfirm({ type: 'delete', student, message });
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not verify student records');
    }
  }

  async function handleConfirm() {
    if (!isAuthenticated || !pendingConfirm) return;
    setConfirmLoading(true);
    const { type, student } = pendingConfirm;
    try {
      if (type === 'archive') {
        await adminApi(token).archiveStudent(student.id);
        setStudents((prev) => prev.filter((s) => s.id !== student.id));
        flash('Student archived.');
      } else {
        await adminApi(token).deleteStudent(student.id);
        setStudents((prev) => prev.filter((s) => s.id !== student.id));
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(student.id);
          return next;
        });
        flash('Student deleted.');
      }
      setPendingConfirm(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : `${type} failed`);
    } finally {
      setConfirmLoading(false);
    }
  }

  async function bulkArchive() {
    if (!isAuthenticated || selected.size === 0) return;
    if (!confirm(`Archive ${selected.size} selected student(s)?`)) return;
    const api = adminApi(token);
    for (const id of selected) {
      try {
        await api.archiveStudent(id);
      } catch {
        /* continue */
      }
    }
    await loadStudents(true);
    setSelected(new Set());
    flash('Selected students archived.');
  }

  const showLoading = studentsLoading && !studentsLoaded;
  const emptyKind =
    students.length === 0 ? 'none' : filtered.length === 0 ? 'search' : null;

  const statCards = [
    { label: 'Total Students', value: displayStats.total, icon: '👥', cls: styles.statIconBlue },
    { label: 'Male Students', value: displayStats.male, icon: '♂', cls: styles.statIconNavy },
    { label: 'Female Students', value: displayStats.female, icon: '♀', cls: styles.statIconOrange },
    {
      label: 'New This Term',
      value: displayStats.new_this_term,
      icon: '✦',
      cls: styles.statIconGreen,
      trend: displayStats.new_this_term > 0 ? `+${displayStats.new_this_term}` : undefined,
    },
    { label: 'Active', value: displayStats.active, icon: '●', cls: styles.statIconGreen },
    { label: 'Inactive', value: displayStats.inactive, icon: '○', cls: styles.statIconMuted },
  ];

  return (
    <div>
      <div className={styles.headerRow}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Students Management</h1>
          <p className={styles.pageDesc}>
            Manage student records, admissions, academic information, and parent details.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={crud.reloadBtn}
            onClick={() => {
              loadClasses(true);
              loadStudents(true);
              if (isAuthenticated)
                adminApi(token)
                  .studentStats()
                  .then(setStats)
                  .catch((err) => {
                    if (err instanceof ApiError && err.status === 401) {
                      window.location.href = '/login';
                    }
                  });
            }}
            disabled={studentsLoading}
          >
            {studentsLoading ? 'Reloading…' : 'Reload'}
          </button>
          <button
            type="button"
            className={crud.secondaryBtn}
            onClick={() => setImportMsg('CSV import will be available in a future update. Use Add Student for now.')}
          >
            Import Students
          </button>
          <Link href="/dashboard/students/archived" className={crud.secondaryBtn}>
            Archived
          </Link>
          <button
            type="button"
            className={crud.secondaryBtn}
            onClick={() => exportStudentsCsv(selected.size ? students.filter((s) => selected.has(s.id)) : filtered)}
          >
            Export Students
          </button>
          <Link href="/dashboard/students/new" className={crud.primaryBtn}>
            Add Student
          </Link>
        </div>
      </div>

      {success && <div className={crud.successBanner}>{success}</div>}
      {importMsg && (
        <div className={crud.successBanner} style={{ background: '#fef3e2', color: '#92400e' }}>
          {importMsg}
          <button type="button" style={{ marginLeft: 12, border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => setImportMsg('')}>×</button>
        </div>
      )}
      {loadError && <div className={crud.formError}>{loadError}</div>}

      <div className={styles.statsGrid}>
        {statCards.map((card) => (
          <div key={card.label} className={styles.statCard}>
            <div className={`${styles.statIcon} ${card.cls}`}>{card.icon}</div>
            <div className={styles.statBody}>
              {statsLoading && !stats ? (
                <div className={styles.skeleton} style={{ width: 48, height: 28 }} />
              ) : (
                <p className={styles.statValue}>{card.value}</p>
              )}
              <p className={styles.statLabel}>{card.label}</p>
              {card.trend && <span className={styles.trendUp}>{card.trend} this term</span>}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.filtersPanel}>
        <div className={styles.filtersRow}>
          <input
            type="search"
            className={crud.searchInput}
            style={{ flex: '1 1 200px', minWidth: 180 }}
            placeholder="Search name, admission no., or parent…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search students"
          />
          <select className={crud.filterSelect} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className={crud.filterSelect} value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <option value="">All genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <select className={crud.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select className={crud.filterSelect} value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            <option value="">Admission year</option>
            {admissionYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select className={crud.filterSelect} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="alpha">Alphabetical</option>
            <option value="updated">Recently updated</option>
          </select>
        </div>
      </div>

      <div className={`${crud.panel} ${styles.studentsPanel}`}>
        {selected.size > 0 && (
          <div className={styles.bulkBar}>
            <span>{selected.size} selected</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={crud.secondaryBtn}
                onClick={() => {
                  setPromoteIds([...selected]);
                  setPromoteOpen(true);
                }}
              >
                Bulk promote
              </button>
              <button type="button" className={crud.secondaryBtn} onClick={bulkArchive}>
                Archive selected
              </button>
              <button type="button" className={crud.secondaryBtn} onClick={() => setSelected(new Set())}>
                Clear
              </button>
            </div>
          </div>
        )}

        {showLoading ? (
          <div className={crud.empty}>Loading students…</div>
        ) : emptyKind ? (
          <div className={styles.emptyWrap}>
            <div className={styles.emptyIcon} aria-hidden />
            <h3 className={styles.emptyTitle}>
              {emptyKind === 'none' ? 'No students yet' : 'No students found'}
            </h3>
            <p className={styles.emptyBody}>
              {emptyKind === 'none'
                ? 'Add your first student to start managing admissions and records.'
                : 'Try adjusting your search or filters to find what you need.'}
            </p>
            {emptyKind === 'none' && (
              <Link href="/dashboard/students/new" className={crud.primaryBtn}>
                Add first student
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className={`${crud.tableWrap} ${styles.tableDesktop}`}>
              <table className={crud.table}>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input type="checkbox" checked={allPageSelected} onChange={toggleAllPage} aria-label="Select all on page" />
                    </th>
                    <th>Photo</th>
                    <th>Full Name</th>
                    <th>Admission No.</th>
                    <th>Class</th>
                    <th>Parent Name</th>
                    <th>Parent Phone</th>
                    <th>Status</th>
                    <th>Date Admitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.has(student.id)}
                          onChange={() => toggleOne(student.id)}
                          aria-label={`Select ${fullName(student)}`}
                        />
                      </td>
                      <td><StudentPhoto student={student} /></td>
                      <td>
                        <div className={styles.nameCell}>
                          <strong>
                            <Link href={`/dashboard/students/${student.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                              {fullName(student)}
                            </Link>
                          </strong>
                          <span>{student.gender ?? '—'}</span>
                        </div>
                      </td>
                      <td>{student.admission_number}</td>
                      <td>{student.class_name ?? '—'}</td>
                      <td>{student.guardian_name ?? '—'}</td>
                      <td>{student.guardian_phone ?? '—'}</td>
                      <td>
                        <span
                          className={`${crud.badge} ${
                            student.is_archived
                              ? crud.badgeSuspended
                              : student.status === 'ACTIVE'
                                ? crud.badgeActive
                                : crud.badgeSuspended
                          }`}
                        >
                          {student.is_archived ? 'Archived' : student.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {student.admission_date
                          ? new Date(student.admission_date).toLocaleDateString()
                          : new Date(student.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <ActionsMenu
                          student={student}
                          onEdit={() => openEdit(student)}
                          onPromote={() => {
                            setPromoteIds([student.id]);
                            setPromoteOpen(true);
                          }}
                          onArchive={() => requestArchive(student)}
                          onDelete={() => requestDelete(student)}
                          onPrint={() => handlePrintCard(student)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileList}>
              {pageItems.map((student) => (
                <div key={student.id} className={styles.mobileCard}>
                  <div className={styles.mobileCardTop}>
                    <input
                      type="checkbox"
                      checked={selected.has(student.id)}
                      onChange={() => toggleOne(student.id)}
                      aria-label={`Select ${fullName(student)}`}
                    />
                    <StudentPhoto student={student} />
                    <div className={styles.mobileCardInfo}>
                      <strong className={styles.mobileCardName}>
                        <Link href={`/dashboard/students/${student.id}`}>{fullName(student)}</Link>
                      </strong>
                      <span className={styles.mobileCardSub}>{student.admission_number}</span>
                    </div>
                    <div className={styles.mobileCardActions}>
                      <ActionsMenu
                        student={student}
                        onEdit={() => openEdit(student)}
                        onPromote={() => {
                          setPromoteIds([student.id]);
                          setPromoteOpen(true);
                        }}
                        onArchive={() => requestArchive(student)}
                        onDelete={() => requestDelete(student)}
                        onPrint={() => handlePrintCard(student)}
                      />
                    </div>
                  </div>
                  <div className={styles.mobileMeta}>
                    <div>
                      <span>Status</span>
                      <strong>
                        <span
                          className={`${crud.badge} ${
                            student.is_archived
                              ? crud.badgeSuspended
                              : student.status === 'ACTIVE'
                                ? crud.badgeActive
                                : crud.badgeSuspended
                          }`}
                        >
                          {student.is_archived ? 'Archived' : student.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </span>
                      </strong>
                    </div>
                    <div><span>Class</span><strong>{student.class_name ?? '—'}</strong></div>
                    <div><span>Parent</span><strong>{student.guardian_name ?? '—'}</strong></div>
                    <div><span>Phone</span><strong>{student.guardian_phone ?? '—'}</strong></div>
                    <div>
                      <span>Admitted</span>
                      <strong>
                        {student.admission_date
                          ? new Date(student.admission_date).toLocaleDateString()
                          : new Date(student.created_at).toLocaleDateString()}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className={styles.pageBtns}>
                <button type="button" className={crud.secondaryBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <button type="button" className={crud.secondaryBtn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {activities.length > 0 && (
        <div className={crud.panel} style={{ marginTop: 20 }}>
          <div className={crud.panelHeader}>
            <h2 className={crud.panelTitle}>Recent student activity</h2>
            <Link href="/dashboard/activity" className={crud.secondaryBtn}>View all</Link>
          </div>
          <div style={{ padding: '8px 24px 20px' }}>
            <ul className={styles.activityList}>
              {activities.map((a) => (
                <li key={a.id} className={styles.activityItem}>
                  <span className={styles.activityDot} />
                  <div>
                    <strong>{a.action}</strong> — {a.details ?? a.entity_type}
                    <div className={styles.activityMeta}>
                      {a.admin_name} · {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {promoteOpen && (
        <PromoteModal
          studentIds={promoteIds}
          onClose={() => setPromoteOpen(false)}
          onDone={() => {
            setPromoteOpen(false);
            loadStudents(true);
            flash('Promotion complete.');
          }}
        />
      )}

      {editStudent && (
        <EditStudentModal
          key={editStudent.id}
          student={editStudent}
          classes={classes}
          open
          onClose={() => setEditStudent(null)}
          onSaved={(updated) => {
            setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            flash('Student updated.');
          }}
        />
      )}

      <ConfirmDialog
        open={!!pendingConfirm}
        title={pendingConfirm?.type === 'delete' ? 'Delete student' : 'Archive student'}
        message={pendingConfirm?.message ?? ''}
        confirmLabel={pendingConfirm?.type === 'delete' ? 'Delete student' : 'Archive student'}
        danger={pendingConfirm?.type === 'delete'}
        loading={confirmLoading}
        onConfirm={handleConfirm}
        onCancel={() => setPendingConfirm(null)}
      />
    </div>
  );
}
