export type PortalIcon =
  | 'home'
  | 'academic-cap'
  | 'clipboard'
  | 'calendar'
  | 'megaphone'
  | 'banknotes'
  | 'key'
  | 'users'
  | 'book';

export interface NavItem {
  href: string;
  label: string;
  icon: PortalIcon;
}

export const STUDENT_NAV: NavItem[] = [
  { href: '/student/dashboard', label: 'Dashboard', icon: 'home' },
  { href: '/student/results', label: 'Results', icon: 'academic-cap' },
  { href: '/student/attendance', label: 'Attendance', icon: 'calendar' },
  { href: '/student/assignments', label: 'Assignments', icon: 'clipboard' },
  { href: '/student/announcements', label: 'Announcements', icon: 'megaphone' },
  { href: '/student/fees', label: 'School Fees', icon: 'banknotes' },
  { href: '/student/change-password', label: 'Change Password', icon: 'key' },
];

export const TEACHER_NAV: NavItem[] = [
  { href: '/staff/dashboard', label: 'Dashboard', icon: 'home' },
  { href: '/staff/classes', label: 'My Classes', icon: 'book' },
  { href: '/staff/students', label: 'Students', icon: 'users' },
  { href: '/staff/results', label: 'Results', icon: 'academic-cap' },
  { href: '/staff/attendance', label: 'Attendance', icon: 'calendar' },
  { href: '/staff/assignments', label: 'Assignments', icon: 'clipboard' },
  { href: '/staff/announcements', label: 'Announcements', icon: 'megaphone' },
];

export const NAV_MAP = {
  STUDENT: STUDENT_NAV,
  STAFF: TEACHER_NAV,
} as const;

export const ROLE_LABELS = {
  STUDENT: 'Student / Parent',
  STAFF: 'Teacher',
} as const;
