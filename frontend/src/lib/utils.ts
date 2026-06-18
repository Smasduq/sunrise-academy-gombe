export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function calculateAttendancePercentage(
  records: { status: string }[]
): number {
  if (records.length === 0) return 0;
  const present = records.filter(
    (r) => r.status === 'PRESENT' || r.status === 'LATE'
  ).length;
  return Math.round((present / records.length) * 100);
}

export const ROLE_DASHBOARD: Record<string, string> = {
  STUDENT: '/student/dashboard',
  STAFF: '/staff/dashboard',
};

export function canAccessRoute(role: string, pathname: string): boolean {
  if (role === 'STAFF') {
    return pathname.startsWith('/staff/');
  }
  if (role === 'STUDENT') {
    return pathname.startsWith('/student');
  }
  return false;
}
