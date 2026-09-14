import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb } from '@/db';
import { exams } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { teacherOwnsExam } from '@/lib/permissions';

export async function POST(_: Request, { params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'TEACHER' || !await teacherOwnsExam(user.id, examId)) return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 });
  const exam = await getDb().select({ isPublished: exams.isPublished }).from(exams).where(eq(exams.id, examId)).get();
  if (!exam) return NextResponse.json({ error: 'Không tìm thấy đề.' }, { status: 404 });
  await getDb().update(exams).set({ isPublished: !exam.isPublished, updatedAt: Date.now() }).where(eq(exams.id, examId));
  return NextResponse.json({ isPublished: !exam.isPublished });
}
