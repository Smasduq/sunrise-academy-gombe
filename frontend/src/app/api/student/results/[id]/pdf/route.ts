import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { studentApi } from '@/lib/api';
import { SCHOOL_NAME } from '@/lib/constants';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'STUDENT' || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await studentApi(session.accessToken).result(id);
    const profile = await studentApi(session.accessToken).dashboard();

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Result Slip - ${profile.profile.admission_number}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #1f2937; }
    h1 { color: #0f766e; font-size: 22px; }
    h2 { font-size: 16px; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
    th { background: #f0f9f8; }
    .header { text-align: center; margin-bottom: 32px; }
    .summary { margin-top: 24px; font-weight: bold; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${SCHOOL_NAME}</h1>
    <p>Academic Result Slip</p>
  </div>
  <p><strong>Student:</strong> ${profile.profile.first_name} ${profile.profile.last_name}</p>
  <p><strong>Admission No:</strong> ${profile.profile.admission_number}</p>
  <p><strong>Class:</strong> ${result.class_name}</p>
  <p><strong>Session:</strong> ${result.session_name} · <strong>Term:</strong> ${result.term_name}</p>
  <h2>Subject Scores</h2>
  <table>
    <thead><tr><th>Subject</th><th>Score</th><th>Grade</th></tr></thead>
    <tbody>
      ${result.scores.map((s) => `<tr><td>${s.subject_name}</td><td>${s.score}</td><td>${s.grade ?? '—'}</td></tr>`).join('')}
    </tbody>
  </table>
  <p class="summary">Average: ${result.average?.toFixed(1)}% · Overall Grade: ${result.grade}</p>
  <script>window.onload = () => window.print()</script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="result-${profile.profile.admission_number}.html"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
