import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { staffApi } from '@/lib/api';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'STAFF' || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  if (!classId) return NextResponse.json([]);

  try {
    const students = await staffApi(session.accessToken).students(classId);
    return NextResponse.json(
      students.map((s) => ({
        id: s.id,
        firstName: s.first_name,
        lastName: s.last_name,
        admissionNumber: s.admission_number,
      }))
    );
  } catch {
    return NextResponse.json({ error: 'Failed to load students' }, { status: 500 });
  }
}
