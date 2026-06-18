import { API_URL } from '@/lib/config';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type ApiOptions = RequestInit & { token?: string };

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
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
  class_id: string | null;
  class_name: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  gender: string | null;
  address: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
  created_at: string;
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

export function adminApi(token: string) {
  return {
    stats: () => apiFetch<AdminStats>('/api/admin/stats', { token }),
    dashboard: () => apiFetch<DashboardOverview>('/api/admin/dashboard', { token }),
    classes: () => apiFetch<ClassOption[]>('/api/admin/classes', { token }),
    students: () => apiFetch<StudentRecord[]>('/api/admin/students', { token }),
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
