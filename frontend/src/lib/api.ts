import { API_URL, assertBackendConfigured } from '@/lib/config';

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
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers, cache: 'no-store' });

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

export async function apiLogin(
  role: 'student' | 'staff',
  body: Record<string, string>
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>(`/api/auth/${role}/login`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/health`, { cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

export interface LoginResponse {
  access_token: string;
  user_id: string;
  role: 'STUDENT' | 'STAFF';
  display_name: string;
  identifier: string;
  profile_id: string;
}

export interface StudentProfile {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  class_name: string | null;
  class_level?: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
}

export interface StaffProfile {
  id: string;
  staff_id: string;
  first_name: string;
  last_name: string;
  department: string | null;
  position: string | null;
  phone: string | null;
  classes: { id: string; name: string; level: string; section: string | null }[];
  stats: {
    class_count: number;
    student_count: number;
    assignment_count: number;
    announcement_count: number;
  };
}

export interface StudentDashboard {
  profile: StudentProfile;
  stats: {
    results_count: number;
    assignments_count: number;
    announcements_count: number;
    total_due: number;
    total_paid: number;
    outstanding: number;
  };
}

export interface ResultItem {
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
  scores: { subject_name: string; subject_code: string; score: number; grade: string | null }[];
}

export interface AttendanceItem {
  id: string;
  date: string;
  status: string;
  remark: string | null;
}

export interface AssignmentItem {
  id: string;
  title: string;
  description: string | null;
  subject_name: string;
  staff_name: string | null;
  due_date: string;
  file_url: string | null;
  submission_status: string | null;
  submission_feedback: string | null;
  submission_score: number | null;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  audience: string;
  posted_by: string | null;
  created_at: string;
}

export interface FeeItem {
  id: string;
  description: string | null;
  amount_due: number;
  amount_paid: number;
  status: string;
  term_name: string;
  session_name: string;
  payment_date: string | null;
}

export interface StudentSummary {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  class_id: string | null;
  class_name: string | null;
  guardian_name: string | null;
}

export interface ClassItem {
  id: string;
  name: string;
  level: string;
  section: string | null;
  student_count: number;
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
}

export interface StaffAssignmentItem {
  id: string;
  title: string;
  class_name: string;
  subject_name: string;
  due_date: string;
}

export interface StaffResultItem {
  id: string;
  student_name: string;
  term_name: string;
  average: number | null;
  grade: string | null;
  status: string;
}

export interface AcademicCurrent {
  session: { id: string; name: string } | null;
  term: { id: string; name: string } | null;
}

export function studentApi(token: string) {
  return {
    dashboard: () => apiFetch<StudentDashboard>('/api/student/dashboard', { token }),
    results: () => apiFetch<ResultItem[]>('/api/student/results', { token }),
    result: (id: string) => apiFetch<ResultItem>(`/api/student/results/${id}`, { token }),
    attendance: () => apiFetch<AttendanceItem[]>('/api/student/attendance', { token }),
    assignments: () => apiFetch<AssignmentItem[]>('/api/student/assignments', { token }),
    announcements: () => apiFetch<AnnouncementItem[]>('/api/student/announcements', { token }),
    fees: () => apiFetch<FeeItem[]>('/api/student/fees', { token }),
    submitAssignment: (id: string, content: string | null) =>
      apiFetch<{ message: string }>(`/api/student/assignments/${id}/submit`, {
        method: 'POST',
        token,
        body: JSON.stringify({ content }),
      }),
  };
}

export function staffApi(token: string) {
  return {
    me: () => apiFetch<StaffProfile>('/api/staff/me', { token }),
    classes: () => apiFetch<ClassItem[]>('/api/staff/classes', { token }),
    students: (classId?: string) =>
      apiFetch<StudentSummary[]>(
        `/api/staff/students${classId ? `?class_id=${classId}` : ''}`,
        { token }
      ),
    assignments: () => apiFetch<StaffAssignmentItem[]>('/api/staff/assignments', { token }),
    results: () => apiFetch<StaffResultItem[]>('/api/staff/results', { token }),
    announcements: () => apiFetch<AnnouncementItem[]>('/api/staff/announcements', { token }),
    markAttendance: (payload: object) =>
      apiFetch<{ message: string }>('/api/staff/attendance', {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      }),
    createAssignment: (payload: object) =>
      apiFetch<{ message: string }>('/api/staff/assignments', {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      }),
    saveResult: (payload: object) =>
      apiFetch<{ message: string }>('/api/staff/results', {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      }),
    postAnnouncement: (payload: object) =>
      apiFetch<{ message: string }>('/api/staff/announcements', {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      }),
  };
}

export function authApi(token: string) {
  return {
    changePassword: (currentPassword: string, newPassword: string) =>
      apiFetch<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        token,
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      }),
  };
}

export function academicApi(token: string) {
  return {
    current: () => apiFetch<AcademicCurrent>('/api/academic/current', { token }),
    subjects: () => apiFetch<SubjectItem[]>('/api/academic/subjects', { token }),
  };
}

export interface PublicStaffMember {
  id: string;
  first_name: string;
  last_name: string;
  department: string | null;
  position: string | null;
  class_names: string[];
}

export async function fetchPublicTeachers(): Promise<PublicStaffMember[]> {
  return apiFetch<PublicStaffMember[]>('/api/public/staff/teachers');
}
