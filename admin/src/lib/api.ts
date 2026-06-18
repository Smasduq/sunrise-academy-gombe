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

export function adminApi(token: string) {
  return {
    stats: () => apiFetch<AdminStats>('/api/admin/stats', { token }),
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
  };
}
