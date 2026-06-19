import { getApiUrl, assertBackendConfigured } from '@/lib/config';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type ApiOptions = RequestInit & { token?: string };

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  assertBackendConfigured();

  const { token, ...init } = options;
  const headers = new Headers(init.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${getApiUrl()}${path}`, { ...init, headers, cache: 'no-store' });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    const message = typeof body.detail === 'string' ? body.detail : 'Request failed';
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export interface LoginResponse {
  access_token: string;
  user_id: string;
  role: 'ADMIN';
  display_name: string;
  identifier: string;
  profile_id: string;
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export interface ClassOption {
  id: string;
  name: string;
  level: string;
  section: string | null;
}

export interface StudentRecord {
  id: string;
  user_id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  class_id: string | null;
  class_name: string | null;
  guardian_name: string | null;
  mother_name?: string | null;
  guardian_phone: string | null;
  guardian_email?: string | null;
  guardian_relationship?: string | null;
  emergency_contact?: string | null;
  gender: string | null;
  address: string | null;
  photo_url?: string | null;
  date_of_birth?: string | null;
  admission_date?: string | null;
  is_archived?: boolean;
  status: 'ACTIVE' | 'SUSPENDED';
  created_at: string;
  updated_at?: string | null;
}

export interface StudentStats {
  total: number;
  male: number;
  female: number;
  active: number;
  inactive: number;
  archived: number;
  new_this_term: number;
}

export interface StudentResultSummary {
  subject_name: string;
  score: number;
  grade: string | null;
  remark: string | null;
  term_name: string | null;
}

export interface StudentProfile {
  student: StudentRecord;
  academic_session: string | null;
  attendance_present: number;
  attendance_absent: number;
  attendance_late: number;
  attendance_percent: number;
  average_score: number | null;
  class_position: number | null;
  latest_results: StudentResultSummary[];
  recent_activities?: StudentActivityItem[];
  recent_attendance?: StudentAttendanceRecord[];
}

export interface StudentActivityItem {
  id: string;
  action: string;
  admin_name: string;
  details: string | null;
  created_at: string;
}

export interface StudentAttendanceRecord {
  id: string;
  date: string;
  status: string;
  remark: string | null;
  term_name: string | null;
  session_name: string | null;
}

export interface StudentAttendanceData {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percent: number;
  records: StudentAttendanceRecord[];
  sessions: string[];
  terms: string[];
}

export interface StudentResultScore {
  subject_name: string;
  subject_code: string;
  score: number;
  grade: string | null;
  remark: string | null;
}

export interface StudentResultRecord {
  id: string;
  term_name: string;
  session_name: string;
  class_name: string;
  average: number | null;
  grade: string | null;
  position: number | null;
  remark: string | null;
  status: string;
  published_at: string | null;
  scores: StudentResultScore[];
}

export interface StudentResultsData {
  results: StudentResultRecord[];
  sessions: string[];
  terms: string[];
}

export interface StudentDeleteCheck {
  results_count: number;
  attendance_count: number;
  fee_count: number;
  has_records: boolean;
}

export interface PromotionHistoryItem {
  id: string;
  from_class_name: string | null;
  to_class_name: string;
  promoted_by_name: string;
  created_at: string;
}

export interface PromotePreviewItem {
  student_id: string;
  student_name: string;
  from_class: string | null;
  to_class: string | null;
  can_promote: boolean;
  reason: string | null;
}

export interface PromoteResult {
  promoted: number;
  skipped: number;
  items: PromotePreviewItem[];
}

export interface StaffRecord {
  id: string;
  user_id: string;
  staff_id: string;
  first_name: string;
  last_name: string;
  department: string | null;
  position: string | null;
  phone: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
  class_ids: string[];
  class_names: string[];
  created_at: string;
}

export interface AdminStats {
  students: number;
  staff: number;
  classes: number;
}

export interface ActivityLog {
  id: string;
  admin_name: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: string | null;
  created_at: string;
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  audience: string;
  is_active: boolean;
  created_at: string;
}

export interface AdmissionRecord {
  id: string;
  application_no: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string | null;
  address: string | null;
  previous_school: string | null;
  class_applied: string;
  status: string;
  created_at: string;
}

export interface SchoolSettings {
  school_name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  academic_session: string | null;
  current_term: string | null;
}

export interface DashboardOverview {
  students: number;
  staff: number;
  classes: number;
  admissions_pending: number;
  admissions_approved: number;
  admissions_rejected: number;
  admissions_total: number;
  attendance_present_today: number;
  attendance_absent_today: number;
  attendance_late_today: number;
  academic_session: string | null;
  current_term: string | null;
  recent_activities: ActivityLog[];
  announcements: AnnouncementRecord[];
}

export function adminApi(token?: string) {
  return {
    stats: () => apiFetch<AdminStats>('/api/admin/stats', { token }),
    dashboard: () => apiFetch<DashboardOverview>('/api/admin/dashboard', { token }),
    classes: () => apiFetch<ClassOption[]>('/api/admin/classes', { token }),
    students: () => apiFetch<StudentRecord[]>('/api/admin/students', { token }),
    studentStats: () => apiFetch<StudentStats>('/api/admin/students/stats', { token }),
    studentProfile: (id: string) =>
      apiFetch<StudentProfile>(`/api/admin/students/${id}/profile`, { token }),
    promotePreview: (body: { student_ids?: string[]; class_name?: string }) =>
      apiFetch<PromotePreviewItem[]>('/api/admin/students/promote/preview', {
        method: 'POST',
        token,
        body: JSON.stringify(body),
      }),
    promoteStudents: (body: { student_ids?: string[]; class_name?: string }) =>
      apiFetch<PromoteResult>('/api/admin/students/promote', {
        method: 'POST',
        token,
        body: JSON.stringify(body),
      }),
    archiveStudent: (id: string) =>
      apiFetch<{ message: string }>(`/api/admin/students/${id}/archive`, {
        method: 'POST',
        token,
      }),
    restoreStudent: (id: string) =>
      apiFetch<{ message: string; student: StudentRecord }>(`/api/admin/students/${id}/restore`, {
        method: 'POST',
        token,
      }),
    archivedStudents: () => apiFetch<StudentRecord[]>('/api/admin/students/archived', { token }),
    studentAttendance: (id: string, params?: { month?: string; session_name?: string; term_name?: string }) => {
      const q = new URLSearchParams();
      if (params?.month) q.set('month', params.month);
      if (params?.session_name) q.set('session_name', params.session_name);
      if (params?.term_name) q.set('term_name', params.term_name);
      const qs = q.toString();
      return apiFetch<StudentAttendanceData>(
        `/api/admin/students/${id}/attendance${qs ? `?${qs}` : ''}`,
        { token }
      );
    },
    studentResults: (id: string, params?: { session_name?: string; term_name?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.session_name) q.set('session_name', params.session_name);
      if (params?.term_name) q.set('term_name', params.term_name);
      if (params?.search) q.set('search', params.search);
      const qs = q.toString();
      return apiFetch<StudentResultsData>(
        `/api/admin/students/${id}/results${qs ? `?${qs}` : ''}`,
        { token }
      );
    },
    studentDeleteCheck: (id: string) =>
      apiFetch<StudentDeleteCheck>(`/api/admin/students/${id}/delete-check`, { token }),
    studentPromotionHistory: (id: string) =>
      apiFetch<PromotionHistoryItem[]>(`/api/admin/students/${id}/promotion-history`, { token }),
    logStudentView: (id: string) =>
      apiFetch<{ message: string }>(`/api/admin/students/${id}/view-log`, { method: 'POST', token }),
    studentActivities: (id: string) =>
      apiFetch<StudentActivityItem[]>(`/api/admin/students/${id}/activities`, { token }),
    uploadImage: (file: File, folder = 'students') => {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', folder);
      return apiFetch<{ url: string; folder: string }>('/api/admin/uploads/image', {
        method: 'POST',
        token,
        body: form,
      });
    },
    createStudent: (body: object) =>
      apiFetch<StudentRecord>('/api/admin/students', {
        method: 'POST',
        token,
        body: JSON.stringify(body),
      }),
    updateStudent: (id: string, body: object) =>
      apiFetch<StudentRecord>(`/api/admin/students/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(body),
      }),
    deleteStudent: (id: string) =>
      apiFetch<{ message: string }>(`/api/admin/students/${id}`, {
        method: 'DELETE',
        token,
      }),
    staff: () => apiFetch<StaffRecord[]>('/api/admin/staff', { token }),
    createStaff: (body: object) =>
      apiFetch<StaffRecord>('/api/admin/staff', {
        method: 'POST',
        token,
        body: JSON.stringify(body),
      }),
    updateStaff: (id: string, body: object) =>
      apiFetch<StaffRecord>(`/api/admin/staff/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(body),
      }),
    deleteStaff: (id: string) =>
      apiFetch<{ message: string }>(`/api/admin/staff/${id}`, {
        method: 'DELETE',
        token,
      }),
    admissions: (status?: string) =>
      apiFetch<AdmissionRecord[]>(
        `/api/admin/admissions${status ? `?status_filter=${status}` : ''}`,
        { token }
      ),
    updateAdmission: (id: string, status: string) =>
      apiFetch<AdmissionRecord>(`/api/admin/admissions/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({ status }),
      }),
    announcements: () => apiFetch<AnnouncementRecord[]>('/api/admin/announcements', { token }),
    createAnnouncement: (body: object) =>
      apiFetch<AnnouncementRecord>('/api/admin/announcements', {
        method: 'POST',
        token,
        body: JSON.stringify(body),
      }),
    updateAnnouncement: (id: string, body: object) =>
      apiFetch<AnnouncementRecord>(`/api/admin/announcements/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(body),
      }),
    deleteAnnouncement: (id: string) =>
      apiFetch<{ message: string }>(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        token,
      }),
    activityLogs: () => apiFetch<ActivityLog[]>('/api/admin/activity-logs', { token }),
    settings: () => apiFetch<SchoolSettings>('/api/admin/settings', { token }),
    updateSettings: (body: object) =>
      apiFetch<SchoolSettings>('/api/admin/settings', {
        method: 'PUT',
        token,
        body: JSON.stringify(body),
      }),
  };
}
