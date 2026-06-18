import type { SchoolSettings, StudentRecord } from '@/lib/api';
import { fullName } from './utils';

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function openStudentIdCard(
  student: StudentRecord,
  settings?: SchoolSettings | null,
  mode: 'print' | 'preview' = 'print'
) {
  const schoolName = settings?.school_name ?? 'Sunrise Academy Gombe';
  const schoolAddress = settings?.address ?? 'Gombe, Nigeria';
  const schoolPhone = settings?.phone ?? '';
  const logoUrl = settings?.logo_url ?? '';
  const name = escapeHtml(fullName(student));
  const admission = escapeHtml(student.admission_number);
  const cls = escapeHtml(student.class_name ?? '—');
  const guardian = escapeHtml(student.guardian_name ?? '—');
  const phone = escapeHtml(student.guardian_phone ?? '—');
  const photo = student.photo_url
    ? `<img src="${escapeHtml(student.photo_url)}" alt="" class="photo" />`
    : `<div class="photo initials">${escapeHtml(student.first_name.charAt(0) + student.last_name.charAt(0))}</div>`;
  const logo = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="" class="logo" />`
    : `<div class="logo-text">SA</div>`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Student ID — ${name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4fa; padding: 32px; color: #0b3d6d; }
  .toolbar { text-align: center; margin-bottom: 24px; }
  .toolbar button { background: #0b6fd4; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; margin: 0 6px; cursor: pointer; font-size: 14px; }
  .toolbar button.secondary { background: #fff; color: #0b3d6d; border: 1px solid #cbd5e0; }
  .card-wrap { display: flex; justify-content: center; }
  .id-card {
    width: 340px; height: 214px; background: #fff; border-radius: 14px;
    border: 2px solid #0b3d6d; overflow: hidden; box-shadow: 0 8px 32px rgba(11,61,109,0.15);
    display: flex; flex-direction: column;
  }
  .header { background: linear-gradient(135deg, #0b3d6d, #0b6fd4); color: #fff; padding: 10px 14px; display: flex; align-items: center; gap: 10px; }
  .logo, .logo-text { width: 36px; height: 36px; border-radius: 8px; object-fit: contain; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
  .school h1 { font-size: 13px; font-weight: 700; letter-spacing: 0.02em; }
  .school p { font-size: 9px; opacity: 0.85; margin-top: 2px; }
  .body { flex: 1; display: flex; padding: 12px 14px; gap: 12px; align-items: center; }
  .photo { width: 72px; height: 88px; border-radius: 8px; object-fit: cover; border: 2px solid #e2e8f0; flex-shrink: 0; }
  .photo.initials { background: #e8f1fb; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: #0b3d6d; }
  .info h2 { font-size: 15px; font-weight: 700; margin-bottom: 6px; line-height: 1.2; }
  .info .row { font-size: 10px; color: #4a5568; margin-bottom: 3px; }
  .info .row strong { color: #0b3d6d; }
  .footer { background: #f4f3ea; padding: 6px 14px; font-size: 8px; color: #6b7c93; text-align: center; border-top: 1px solid #e2e8f0; }
  .badge { display: inline-block; background: #0b3d6d; color: #fff; font-size: 8px; font-weight: 700; padding: 2px 8px; border-radius: 10px; margin-top: 4px; letter-spacing: 0.06em; }
  @media print {
    body { background: #fff; padding: 0; }
    .toolbar { display: none; }
    .id-card { box-shadow: none; page-break-inside: avoid; }
  }
</style></head><body>
<div class="toolbar">
  <button onclick="window.print()">Print card</button>
  <button class="secondary" onclick="window.print()">Save as PDF</button>
  <button class="secondary" onclick="window.close()">Close</button>
</div>
<div class="card-wrap">
  <div class="id-card">
    <div class="header">
      ${logo}
      <div class="school">
        <h1>${escapeHtml(schoolName)}</h1>
        <p>${escapeHtml(schoolAddress)}${schoolPhone ? ' · ' + escapeHtml(schoolPhone) : ''}</p>
      </div>
    </div>
    <div class="body">
      ${photo}
      <div class="info">
        <h2>${name}</h2>
        <div class="row"><strong>Admission:</strong> ${admission}</div>
        <div class="row"><strong>Class:</strong> ${cls}</div>
        <div class="row"><strong>Guardian:</strong> ${guardian}</div>
        <div class="row"><strong>Contact:</strong> ${phone}</div>
        <span class="badge">STUDENT ID</span>
      </div>
    </div>
    <div class="footer">Official student identification card · ${new Date().getFullYear()}</div>
  </div>
</div>
${mode === 'print' ? '<script>setTimeout(function(){ window.print(); }, 400);</script>' : ''}
</body></html>`;

  const w = window.open('', '_blank', 'width=480,height=640');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

export function printResultSlip(
  student: StudentRecord,
  result: {
    term_name: string;
    session_name: string;
    class_name: string;
    average: number | null;
    grade: string | null;
    position: number | null;
    remark: string | null;
    scores: { subject_name: string; score: number; grade: string | null; remark: string | null }[];
  },
  settings?: SchoolSettings | null
) {
  const schoolName = settings?.school_name ?? 'Sunrise Academy Gombe';
  const name = escapeHtml(fullName(student));
  const rows = result.scores
    .map(
      (s) =>
        `<tr><td>${escapeHtml(s.subject_name)}</td><td>${s.score}</td><td>${escapeHtml(s.grade ?? '—')}</td><td>${escapeHtml(s.remark ?? '—')}</td></tr>`
    )
    .join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Result Slip — ${name}</title>
<style>
body{font-family:Arial,sans-serif;padding:32px;color:#0b3d6d;max-width:700px;margin:0 auto}
h1{font-size:20px;margin:0 0 4px}h2{font-size:14px;color:#6b7c93;font-weight:500;margin:0 0 24px}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;margin-bottom:20px}
table{width:100%;border-collapse:collapse;font-size:13px;margin-top:16px}
th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left}
th{background:#f5f7fb;font-weight:600}
.summary{margin-top:20px;padding:16px;background:#f5f7fb;border-radius:8px;font-size:14px}
@media print{.no-print{display:none}}
</style></head><body>
<h1>${escapeHtml(schoolName)}</h1>
<h2>Student Result Slip</h2>
<div class="meta">
<p><strong>Student:</strong> ${name}</p>
<p><strong>Admission:</strong> ${escapeHtml(student.admission_number)}</p>
<p><strong>Class:</strong> ${escapeHtml(result.class_name)}</p>
<p><strong>Session:</strong> ${escapeHtml(result.session_name)}</p>
<p><strong>Term:</strong> ${escapeHtml(result.term_name)}</p>
<p><strong>Position:</strong> ${result.position ?? '—'}</p>
</div>
<table><thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Remarks</th></tr></thead><tbody>${rows}</tbody></table>
<div class="summary">
<p><strong>Average:</strong> ${result.average ?? '—'} &nbsp; <strong>Grade:</strong> ${escapeHtml(result.grade ?? '—')}</p>
<p><strong>Class teacher remark:</strong> ${escapeHtml(result.remark ?? '—')}</p>
</div>
<div class="no-print" style="margin-top:24px"><button onclick="window.print()" style="background:#0b6fd4;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer">Print / Save PDF</button></div>
<script>setTimeout(function(){window.print()},300)</script></body></html>`;

  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
