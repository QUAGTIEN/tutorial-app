import { and, eq } from 'drizzle-orm';

import { getDb } from '@/db';
import { exams } from '@/db/schema';

export async function teacherOwnsExam(teacherId: string, examId: string) {
  return Boolean(await getDb().select({ id: exams.id }).from(exams)
    .where(and(eq(exams.id, examId), eq(exams.teacherId, teacherId))).get());
}
