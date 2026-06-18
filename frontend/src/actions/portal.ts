'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, academicApi, authApi, staffApi, studentApi } from '@/lib/api';
import { requireAuth, requireRole } from '@/lib/dal';

export async function changePassword(formData: FormData) {
  const session = await requireAuth();
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required.' };
  }
  if (newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters.' };
  }
  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match.' };
  }

  try {
    await authApi(session.accessToken).changePassword(currentPassword, newPassword);
    return { success: 'Password changed successfully.' };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Could not change password.' };
  }
}

export async function submitAssignment(formData: FormData) {
  const session = await requireRole('STUDENT');
  const assignmentId = formData.get('assignmentId') as string;
  const content = formData.get('content') as string;

  if (!assignmentId) return { error: 'Assignment ID is required.' };

  try {
    await studentApi(session.accessToken).submitAssignment(assignmentId, content || null);
    revalidatePath('/student/assignments');
    return { success: 'Assignment submitted successfully.' };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Could not submit assignment.' };
  }
}

export async function markAttendance(formData: FormData) {
  const session = await requireRole('STAFF');
  const classId = formData.get('classId') as string;
  const date = formData.get('date') as string;
  const sessionId = formData.get('sessionId') as string;
  const termId = formData.get('termId') as string;

  if (!classId || !date || !sessionId || !termId) {
    return { error: 'Missing required fields.' };
  }

  const records: { student_id: string; status: string }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('status_')) {
      records.push({ student_id: key.replace('status_', ''), status: value as string });
    }
  }

  try {
    await staffApi(session.accessToken).markAttendance({
      class_id: classId,
      session_id: sessionId,
      term_id: termId,
      date: new Date(date).toISOString(),
      records,
    });
    revalidatePath('/staff/attendance');
    return { success: 'Attendance marked successfully.' };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Could not save attendance.' };
  }
}

export async function createAssignment(formData: FormData) {
  const session = await requireRole('STAFF');
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const classId = formData.get('classId') as string;
  const subjectId = formData.get('subjectId') as string;
  const sessionId = formData.get('sessionId') as string;
  const termId = formData.get('termId') as string;
  const dueDate = formData.get('dueDate') as string;
  const fileUrl = formData.get('fileUrl') as string;

  if (!title || !classId || !subjectId || !sessionId || !termId || !dueDate) {
    return { error: 'Please fill in all required fields.' };
  }

  try {
    await staffApi(session.accessToken).createAssignment({
      title,
      description: description || null,
      class_id: classId,
      subject_id: subjectId,
      session_id: sessionId,
      term_id: termId,
      due_date: new Date(dueDate).toISOString(),
      file_url: fileUrl || null,
    });
    revalidatePath('/staff/assignments');
    return { success: 'Assignment created successfully.' };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Could not create assignment.' };
  }
}

export async function saveResult(formData: FormData) {
  const session = await requireRole('STAFF');
  const studentId = formData.get('studentId') as string;
  let classId = formData.get('classId') as string;
  const sessionId = formData.get('sessionId') as string;
  const termId = formData.get('termId') as string;
  const publish = formData.get('publish') === 'true';

  if (!studentId || !sessionId || !termId) {
    return { error: 'Missing required fields.' };
  }

  const scores: { subject_id: string; score: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('score_') && value) {
      scores.push({
        subject_id: key.replace('score_', ''),
        score: parseFloat(value as string),
      });
    }
  }

  if (scores.length === 0) return { error: 'Enter at least one subject score.' };

  if (!classId) {
    const students = await staffApi(session.accessToken).students();
    classId = students.find((s) => s.id === studentId)?.class_id ?? '';
  }
  if (!classId) return { error: 'Student has no class assigned.' };

  try {
    await staffApi(session.accessToken).saveResult({
      student_id: studentId,
      class_id: classId,
      session_id: sessionId,
      term_id: termId,
      scores,
      publish,
    });
    revalidatePath('/staff/results');
    return { success: publish ? 'Result published.' : 'Result saved as draft.' };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Could not save result.' };
  }
}

export async function postAnnouncement(formData: FormData) {
  const session = await requireRole('STAFF');
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const audience = (formData.get('audience') as string) || 'ALL';

  if (!title || !content) return { error: 'Title and content are required.' };

  try {
    await staffApi(session.accessToken).postAnnouncement({ title, content, audience });
    revalidatePath('/staff/announcements');
    return { success: 'Announcement posted.' };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Could not post announcement.' };
  }
}
