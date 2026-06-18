'use client';

import { useState } from 'react';
import Link from 'next/link';
import type {
  SchoolSettings,
  StudentAttendanceData,
  StudentProfile,
  StudentResultsData,
} from '@/lib/api';
import {
  buildMonthlyAttendance,
  buildPerformanceTrend,
  calcAge,
  copyToClipboard,
  countTotalSubjects,
  generateInsights,
  getBestSubject,
  getLatestResult,
  getLowestSubject,
  ordinal,
} from '@/components/students/overviewUtils';
import crud from '@/components/crud.module.css';
import styles from '@/components/students/students.module.css';

interface StudentOverviewProps {
  profile: StudentProfile;
  results: StudentResultsData | null;
  attendance: StudentAttendanceData | null;
  settings: SchoolSettings | null;
  loadingExtras?: boolean;
}

function EmptyBlock({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className={styles.overviewEmpty}>
      <div className={styles.overviewEmptyIcon} aria-hidden>{icon}</div>
      <p className={styles.overviewEmptyTitle}>{title}</p>
      <p className={styles.overviewEmptyBody}>{body}</p>
    </div>
  );
}

function BarChart({
  data,
  suffix = '',
  variant = 'blue',
}: {
  data: { label: string; value: number }[];
  suffix?: string;
  variant?: 'blue' | 'green';
}) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={styles.chartBars} role="img" aria-label="Bar chart">
      {data.map((d) => (
        <div key={d.label} className={styles.chartBarCol}>
          <span className={styles.chartBarValue}>
            {d.value}
            {suffix}
          </span>
          <div className={styles.chartBarTrack}>
            <div
              className={`${styles.chartBarFill} ${variant === 'green' ? styles.chartBarFillGreen : ''}`}
              style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
            />
          </div>
          <span className={styles.chartBarLabel}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function attendanceStatusClass(status: string) {
  if (status === 'PRESENT') return styles.statusPresent;
  if (status === 'ABSENT') return styles.statusAbsent;
  if (status === 'LATE') return styles.statusLate;
  return styles.statusExcused;
}

function OverviewSkeleton() {
  return (
    <div className={styles.overviewLayout}>
      <div className={styles.overviewSkeletonGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.overviewStatCard}>
            <div className={`${styles.skeleton}`} style={{ width: 40, height: 40, borderRadius: 10 }} />
            <div style={{ flex: 1 }}>
              <div className={styles.skeleton} style={{ width: 56, height: 24, marginBottom: 6 }} />
              <div className={styles.skeleton} style={{ width: 90, height: 14 }} />
            </div>
          </div>
        ))}
      </div>
      <div className={styles.overviewGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.overviewPanel}>
            <div className={styles.overviewPanelHeader}>
              <div className={styles.skeleton} style={{ width: 140, height: 18 }} />
            </div>
            <div className={styles.overviewPanelBody}>
              <div className={styles.skeleton} style={{ width: '100%', height: 120 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudentOverview({
  profile,
  results,
  attendance,
  settings,
  loadingExtras,
}: StudentOverviewProps) {
  const [copyMsg, setCopyMsg] = useState('');

  if (loadingExtras) {
    return <OverviewSkeleton />;
  }

  const { student: s } = profile;
  const latestResult = getLatestResult(results);
  const bestSubject = getBestSubject(latestResult);
  const lowestSubject = getLowestSubject(latestResult);
  const performanceTrend = buildPerformanceTrend(results);
  const monthlyAttendance = buildMonthlyAttendance(attendance);
  const insights = generateInsights(profile, results, attendance, settings);
  const totalResults = results?.results.length ?? 0;
  const totalSubjects = countTotalSubjects(results);
  const recentResults = (profile.latest_results ?? []).slice(0, 5);
  const recentAttendance = (profile.recent_attendance ?? []).slice(0, 5);
  const recentActivities = profile.recent_activities ?? [];

  const subjectScores = (latestResult?.scores ?? []).map((sc) => ({
    label: sc.subject_code || sc.subject_name.slice(0, 4),
    value: sc.score,
  }));

  async function handleCopyPhone() {
    if (!s.guardian_phone) return;
    const ok = await copyToClipboard(s.guardian_phone);
    setCopyMsg(ok ? 'Phone copied!' : 'Could not copy');
    setTimeout(() => setCopyMsg(''), 2500);
  }

  const statCards = [
    {
      icon: '📅',
      cls: styles.statIconGreen,
      value: `${profile.attendance_percent}%`,
      label: 'Attendance',
      hint: 'Overall rate',
    },
    {
      icon: '📊',
      cls: styles.statIconBlue,
      value: profile.average_score != null ? `${profile.average_score}%` : '—',
      label: 'Average Score',
      hint: latestResult?.term_name ?? 'Latest term',
    },
    {
      icon: '🏆',
      cls: styles.statIconOrange,
      value: profile.class_position != null ? ordinal(profile.class_position) : '—',
      label: 'Class Position',
      hint: 'Latest result',
    },
    {
      icon: '📚',
      cls: styles.statIconNavy,
      value: totalSubjects || '—',
      label: 'Total Subjects',
      hint: 'Current term',
    },
    {
      icon: '📝',
      cls: styles.statIconBlue,
      value: totalResults,
      label: 'Results Recorded',
      hint: 'All terms',
    },
    {
      icon: '✓',
      cls: styles.statIconGreen,
      value: profile.attendance_present,
      label: 'Days Present',
      hint: 'This session',
    },
  ];

  const insightClassMap = {
    positive: styles.insightPositive,
    warning: styles.insightWarning,
    neutral: styles.insightNeutral,
    info: styles.insightInfo,
  };

  return (
    <div className={styles.overviewLayout}>
      <div className={styles.overviewStats}>
        {statCards.map((card) => (
          <div key={card.label} className={styles.overviewStatCard}>
            <div className={`${styles.overviewStatIcon} ${card.cls}`}>{card.icon}</div>
            <div className={styles.overviewStatBody}>
              <p className={styles.overviewStatValue}>{card.value}</p>
              <p className={styles.overviewStatLabel}>{card.label}</p>
              <p className={styles.overviewStatHint}>{card.hint}</p>
            </div>
          </div>
        ))}
      </div>

      {insights.length > 0 && (
        <div className={`${styles.overviewPanel} ${styles.overviewGridFull}`}>
          <div className={styles.overviewPanelHeader}>
            <h2 className={styles.overviewPanelTitle}>Quick insights</h2>
          </div>
          <div className={styles.overviewPanelBody}>
            <div className={styles.insightList}>
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={`${styles.insightCard} ${insightClassMap[insight.tone]}`}
                >
                  {insight.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={styles.overviewGrid}>
        <div className={styles.overviewPanel}>
          <div className={styles.overviewPanelHeader}>
            <h2 className={styles.overviewPanelTitle}>Academic performance</h2>
            <Link href={`/dashboard/students/${s.id}/results`} className={crud.secondaryBtn}>
              View all
            </Link>
          </div>
          <div className={styles.overviewPanelBody}>
            {!latestResult ? (
              <EmptyBlock
                icon="📊"
                title="No academic records available yet"
                body="Results will appear here once they are uploaded for this student."
              />
            ) : (
              <>
                <div className={styles.overviewMetricGrid}>
                  <div className={styles.overviewMetric}>
                    <span>Session</span>
                    <strong>{settings?.academic_session ?? profile.academic_session ?? '—'}</strong>
                  </div>
                  <div className={styles.overviewMetric}>
                    <span>Term</span>
                    <strong>{settings?.current_term ?? latestResult.term_name ?? '—'}</strong>
                  </div>
                  <div className={styles.overviewMetric}>
                    <span>Overall average</span>
                    <strong>{latestResult.average != null ? `${latestResult.average}%` : '—'}</strong>
                  </div>
                  <div className={styles.overviewMetric}>
                    <span>Best subject</span>
                    <strong>
                      {bestSubject ? `${bestSubject.subject_name} (${bestSubject.score}%)` : '—'}
                    </strong>
                  </div>
                  <div className={styles.overviewMetric}>
                    <span>Lowest subject</span>
                    <strong>
                      {lowestSubject ? `${lowestSubject.subject_name} (${lowestSubject.score}%)` : '—'}
                    </strong>
                  </div>
                  <div className={styles.overviewMetric}>
                    <span>Latest exam</span>
                    <strong>
                      {latestResult.average != null ? `${latestResult.average}%` : '—'}
                      {latestResult.grade ? ` · ${latestResult.grade}` : ''}
                    </strong>
                  </div>
                </div>

                {subjectScores.length > 0 && (
                  <>
                    <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b7c93', fontWeight: 600 }}>
                      Subject scores — {latestResult.term_name}
                    </p>
                    <BarChart data={subjectScores} suffix="%" />
                  </>
                )}

                {performanceTrend.length > 1 && (
                  <>
                    <p style={{ margin: '20px 0 8px', fontSize: 12, color: '#6b7c93', fontWeight: 600 }}>
                      Performance trend
                    </p>
                    <BarChart data={performanceTrend} suffix="%" variant="green" />
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className={styles.overviewPanel}>
          <div className={styles.overviewPanelHeader}>
            <h2 className={styles.overviewPanelTitle}>Attendance summary</h2>
            <Link href={`/dashboard/students/${s.id}/attendance`} className={crud.secondaryBtn}>
              View full
            </Link>
          </div>
          <div className={styles.overviewPanelBody}>
            {(attendance?.total ?? 0) === 0 ? (
              <EmptyBlock
                icon="📅"
                title="No attendance records"
                body="Attendance data will appear once records are marked for this student."
              />
            ) : (
              <>
                <div className={styles.overviewMetricGrid}>
                  <div className={styles.overviewMetric}>
                    <span>Present days</span>
                    <strong>{profile.attendance_present}</strong>
                  </div>
                  <div className={styles.overviewMetric}>
                    <span>Absent days</span>
                    <strong>{profile.attendance_absent}</strong>
                  </div>
                  <div className={styles.overviewMetric}>
                    <span>Late days</span>
                    <strong>{profile.attendance_late}</strong>
                  </div>
                  <div className={styles.overviewMetric}>
                    <span>Attendance rate</span>
                    <strong>{profile.attendance_percent}%</strong>
                  </div>
                </div>
                <div className={styles.attendanceBar} aria-hidden>
                  <div
                    className={styles.attendanceFill}
                    style={{ width: `${Math.min(profile.attendance_percent, 100)}%` }}
                  />
                </div>
                {monthlyAttendance.length > 0 && (
                  <>
                    <p style={{ margin: '20px 0 8px', fontSize: 12, color: '#6b7c93', fontWeight: 600 }}>
                      Monthly attendance trend
                    </p>
                    <BarChart data={monthlyAttendance} suffix="%" variant="green" />
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className={styles.overviewPanel}>
          <div className={styles.overviewPanelHeader}>
            <h2 className={styles.overviewPanelTitle}>Parent information</h2>
          </div>
          <div className={styles.overviewPanelBody}>
            <div className={styles.infoGrid}>
              {[
                ['Parent / Guardian', s.guardian_name],
                ['Relationship', s.guardian_relationship],
                ['Phone', s.guardian_phone],
                ['Email', s.guardian_email],
                ['Mother', s.mother_name],
                ['Emergency contact', s.emergency_contact],
                ['Address', s.address],
              ].map(([label, value]) => (
                <div key={label} className={styles.infoItem}>
                  <span>{label}</span>
                  <p>{value ?? '—'}</p>
                </div>
              ))}
            </div>
            <div className={styles.parentActions}>
              {s.guardian_phone && (
                <a href={`tel:${s.guardian_phone}`} className={crud.secondaryBtn}>
                  Call parent
                </a>
              )}
              {s.guardian_phone && (
                <button type="button" className={crud.secondaryBtn} onClick={handleCopyPhone}>
                  Copy phone
                </button>
              )}
              {s.guardian_phone && (
                <a href={`sms:${s.guardian_phone}`} className={crud.secondaryBtn}>
                  Send message
                </a>
              )}
              {s.guardian_email && (
                <a href={`mailto:${s.guardian_email}`} className={crud.secondaryBtn}>
                  Email parent
                </a>
              )}
              {copyMsg && <span className={styles.copyToast}>{copyMsg}</span>}
            </div>
          </div>
        </div>

        <div className={styles.overviewPanel}>
          <div className={styles.overviewPanelHeader}>
            <h2 className={styles.overviewPanelTitle}>Student information</h2>
          </div>
          <div className={styles.overviewPanelBody}>
            <div className={styles.infoGrid}>
              {[
                ['Full name', `${s.first_name}${s.middle_name ? ` ${s.middle_name}` : ''} ${s.last_name}`.trim()],
                ['Admission number', s.admission_number],
                ['Gender', s.gender],
                ['Date of birth', s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString() : null],
                ['Age', calcAge(s.date_of_birth)],
                ['Class', s.class_name],
                ['Session', settings?.academic_session ?? profile.academic_session],
                [
                  'Admission date',
                  s.admission_date
                    ? new Date(s.admission_date).toLocaleDateString()
                    : new Date(s.created_at).toLocaleDateString(),
                ],
              ].map(([label, value]) => (
                <div key={label} className={styles.infoItem}>
                  <span>{label}</span>
                  <p>{value ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.overviewPanel}>
          <div className={styles.overviewPanelHeader}>
            <h2 className={styles.overviewPanelTitle}>Recent results</h2>
            <Link href={`/dashboard/students/${s.id}/results`} className={crud.secondaryBtn}>
              View all results
            </Link>
          </div>
          {recentResults.length === 0 ? (
            <EmptyBlock
              icon="📝"
              title="No results available"
              body="The latest subject scores will be listed here."
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.overviewTable}>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Grade</th>
                    <th>Term</th>
                  </tr>
                </thead>
                <tbody>
                  {recentResults.map((r, i) => (
                    <tr key={i}>
                      <td>{r.subject_name}</td>
                      <td>{r.score}%</td>
                      <td>{r.grade ?? '—'}</td>
                      <td>{r.term_name ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={styles.overviewPanel}>
          <div className={styles.overviewPanelHeader}>
            <h2 className={styles.overviewPanelTitle}>Recent attendance</h2>
            <Link href={`/dashboard/students/${s.id}/attendance`} className={crud.secondaryBtn}>
              View full attendance
            </Link>
          </div>
          {recentAttendance.length === 0 ? (
            <EmptyBlock
              icon="📅"
              title="No attendance records"
              body="Recent attendance entries will appear here."
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.overviewTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.map((r) => (
                    <tr key={r.id}>
                      <td>{new Date(r.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`${styles.statusPill} ${attendanceStatusClass(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>{r.remark ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={`${styles.overviewPanel} ${styles.overviewGridWide}`}>
          <div className={styles.overviewPanelHeader}>
            <h2 className={styles.overviewPanelTitle}>Recent activity</h2>
            <Link href="/dashboard/activity" className={crud.secondaryBtn}>
              View all logs
            </Link>
          </div>
          {recentActivities.length === 0 ? (
            <EmptyBlock
              icon="📋"
              title="No activities recorded"
              body="Profile updates, promotions, and other actions will appear in this timeline."
            />
          ) : (
            <div className={styles.overviewPanelBody}>
              <ul className={styles.activityList}>
                {recentActivities.map((a) => {
                  const when = new Date(a.created_at);
                  return (
                    <li key={a.id} className={styles.activityItem}>
                      <span className={styles.activityDot} />
                      <div>
                        <strong>{a.action}</strong>
                        {a.details ? ` — ${a.details}` : ''}
                        <div className={styles.activityMeta}>
                          {a.admin_name} · {when.toLocaleDateString()} ·{' '}
                          {when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
