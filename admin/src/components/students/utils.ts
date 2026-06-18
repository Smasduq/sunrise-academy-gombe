import type { StudentRecord } from '@/lib/api';

export type SortKey = 'newest' | 'oldest' | 'alpha' | 'updated';

export const PAGE_SIZE = 10;

export function fullName(s: StudentRecord) {
  return [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(' ');
}

export function computeStats(students: StudentRecord[]) {
  const termStart = Date.now() - 120 * 24 * 60 * 60 * 1000;
  return {
    total: students.length,
    male: students.filter((s) => (s.gender || '').toLowerCase() === 'male').length,
    female: students.filter((s) => (s.gender || '').toLowerCase() === 'female').length,
    active: students.filter((s) => s.status === 'ACTIVE' && !s.is_archived).length,
    inactive: students.filter((s) => s.status === 'SUSPENDED' && !s.is_archived).length,
    archived: students.filter((s) => s.is_archived).length,
    newThisTerm: students.filter((s) => new Date(s.created_at).getTime() >= termStart).length,
  };
}

export function filterStudents(
  students: StudentRecord[],
  opts: {
    search: string;
    classId: string;
    gender: string;
    status: string;
    year: string;
    showArchived: boolean;
  }
) {
  const q = opts.search.trim().toLowerCase();
  return students.filter((s) => {
    if (!opts.showArchived && s.is_archived) return false;
    if (opts.classId && s.class_id !== opts.classId) return false;
    if (opts.gender && (s.gender || '').toLowerCase() !== opts.gender.toLowerCase()) return false;
    if (opts.status === 'ACTIVE' && (s.status !== 'ACTIVE' || s.is_archived)) return false;
    if (opts.status === 'INACTIVE' && (s.status !== 'SUSPENDED' || s.is_archived)) return false;
    if (opts.status === 'ARCHIVED' && !s.is_archived) return false;
    if (opts.year) {
      const y = new Date(s.created_at).getFullYear().toString();
      if (y !== opts.year) return false;
    }
    if (!q) return true;
    return (
      fullName(s).toLowerCase().includes(q) ||
      s.first_name.toLowerCase().includes(q) ||
      (s.middle_name?.toLowerCase().includes(q) ?? false) ||
      s.last_name.toLowerCase().includes(q) ||
      s.admission_number.toLowerCase().includes(q) ||
      (s.guardian_name?.toLowerCase().includes(q) ?? false)
    );
  });
}

export function sortStudents(students: StudentRecord[], sort: SortKey) {
  const list = [...students];
  if (sort === 'alpha') {
    return list.sort((a, b) => fullName(a).localeCompare(fullName(b)));
  }
  if (sort === 'oldest') {
    return list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
  if (sort === 'updated') {
    return list.sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
    );
  }
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function exportStudentsCsv(students: StudentRecord[]) {
  const headers = [
    'Admission Number',
    'First Name',
    'Middle Name',
    'Last Name',
    'Class',
    'Gender',
    'Guardian',
    'Phone',
    'Status',
    'Admitted',
  ];
  const rows = students.map((s) => [
    s.admission_number,
    s.first_name,
    s.middle_name ?? '',
    s.last_name,
    s.class_name ?? '',
    s.gender ?? '',
    s.guardian_name ?? '',
    s.guardian_phone ?? '',
    s.is_archived ? 'Archived' : s.status,
    new Date(s.created_at).toLocaleDateString(),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sunrise-students-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function initials(s: StudentRecord) {
  return `${s.first_name.charAt(0)}${s.last_name.charAt(0)}`.toUpperCase();
}
