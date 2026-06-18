import type {
  SchoolSettings,
  StudentAttendanceData,
  StudentProfile,
  StudentResultRecord,
  StudentResultsData,
} from '@/lib/api';

export type InsightTone = 'positive' | 'warning' | 'neutral' | 'info';

export interface Insight {
  tone: InsightTone;
  text: string;
}

export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  const mod10 = n % 10;
  if (mod10 === 1) return `${n}st`;
  if (mod10 === 2) return `${n}nd`;
  if (mod10 === 3) return `${n}rd`;
  return `${n}th`;
}

export function calcAge(dob: string | null | undefined): string {
  if (!dob) return '—';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '—';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return `${age} years`;
}

export function getLatestResult(results: StudentResultsData | null): StudentResultRecord | null {
  return results?.results[0] ?? null;
}

export function getPreviousResult(results: StudentResultsData | null): StudentResultRecord | null {
  return results?.results[1] ?? null;
}

export function getBestSubject(result: StudentResultRecord | null) {
  if (!result?.scores.length) return null;
  return [...result.scores].sort((a, b) => b.score - a.score)[0];
}

export function getLowestSubject(result: StudentResultRecord | null) {
  if (!result?.scores.length) return null;
  return [...result.scores].sort((a, b) => a.score - b.score)[0];
}

export function countTotalSubjects(results: StudentResultsData | null): number {
  const latest = getLatestResult(results);
  return latest?.scores.length ?? 0;
}

export function buildPerformanceTrend(results: StudentResultsData | null) {
  return (results?.results ?? [])
    .slice(0, 6)
    .reverse()
    .map((r) => ({
      label: r.term_name?.slice(0, 6) ?? 'Term',
      value: r.average ?? 0,
    }));
}

export function buildMonthlyAttendance(attendance: StudentAttendanceData | null) {
  const buckets = new Map<string, { present: number; total: number }>();

  for (const record of attendance?.records ?? []) {
    const month = record.date.slice(0, 7);
    const entry = buckets.get(month) ?? { present: 0, total: 0 };
    entry.total += 1;
    if (record.status === 'PRESENT' || record.status === 'LATE') entry.present += 1;
    buckets.set(month, entry);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => {
      const [year, mon] = month.split('-');
      const label = new Date(Number(year), Number(mon) - 1, 1).toLocaleString('en', { month: 'short' });
      const value = data.total ? Math.round((data.present / data.total) * 100) : 0;
      return { label, value, month };
    });
}

export function generateInsights(
  profile: StudentProfile,
  results: StudentResultsData | null,
  attendance: StudentAttendanceData | null,
  settings: SchoolSettings | null
): Insight[] {
  const insights: Insight[] = [];
  const latest = getLatestResult(results);
  const previous = getPreviousResult(results);

  if (profile.attendance_percent >= 90 && (attendance?.total ?? 0) > 0) {
    insights.push({ tone: 'positive', text: 'Excellent attendance this term.' });
  } else if (profile.attendance_percent < 75 && (attendance?.total ?? 0) > 0) {
    insights.push({ tone: 'warning', text: 'Attendance is below 75% — a follow-up may be needed.' });
  }

  if (latest?.average != null && previous?.average != null) {
    if (latest.average > previous.average) {
      insights.push({ tone: 'positive', text: 'Performance is improving over the previous term.' });
    } else if (latest.average < previous.average) {
      insights.push({ tone: 'warning', text: 'Recent results show a decline compared to the previous term.' });
    }
  }

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthRecords = (attendance?.records ?? []).filter((r) => r.date.startsWith(thisMonth));
  if ((attendance?.total ?? 0) > 0 && monthRecords.length === 0) {
    insights.push({ tone: 'neutral', text: 'No attendance records recorded this month.' });
  }

  if (!results?.results.length) {
    insights.push({ tone: 'info', text: 'No academic records available yet — results will appear here once uploaded.' });
  }

  if (!(attendance?.total ?? 0)) {
    insights.push({ tone: 'info', text: 'No attendance records yet — mark attendance to track presence.' });
  }

  const lowest = getLowestSubject(latest);
  const prevLowest = getLowestSubject(previous);
  if (lowest && prevLowest && lowest.subject_name === prevLowest.subject_name && latest && previous) {
    if (lowest.score < prevLowest.score) {
      insights.push({
        tone: 'warning',
        text: `Recent decline in ${lowest.subject_name} scores.`,
      });
    }
  }

  if (profile.student.is_archived) {
    insights.push({ tone: 'neutral', text: 'This student is archived and hidden from active lists.' });
  }

  if (settings?.current_term) {
    insights.push({
      tone: 'info',
      text: `Currently in ${settings.current_term} of ${settings.academic_session ?? 'the academic session'}.`,
    });
  }

  return insights.slice(0, 5);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
