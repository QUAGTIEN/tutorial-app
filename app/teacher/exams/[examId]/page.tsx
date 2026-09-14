import { eq } from 'drizzle-orm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ExamEditor } from '@/components/exam/exam-editor';
import { TeacherExamActions } from '@/components/exam/teacher-exam-actions';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { getDb } from '@/db';
import { choices, exams, questions } from '@/db/schema';
import { requireRole } from '@/lib/auth';

export default async function EditExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const user = await requireRole('TEACHER'); const { examId } = await params; const db = getDb();
  const exam = await db.select().from(exams).where(eq(exams.id, examId)).get();
  if (!exam || exam.teacherId !== user.id) notFound();
  const questionRows = await db.select().from(questions).where(eq(questions.examId, examId)).orderBy(questions.position).all();
  const initialDraft = { title: exam.title, description: exam.description, questions: await Promise.all(questionRows.map(async (question) => ({ content: question.content, points: question.points, choices: (await db.select().from(choices).where(eq(choices.questionId, question.id)).orderBy(choices.position).all()).map((choice) => ({ content: choice.content, isCorrect: choice.isCorrect })) }))) };
  return <AppShell user={user}><Link href="/teacher" className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-950"><ChevronLeft className="size-4" />Danh sách đề</Link><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2"><h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa đề</h1><Badge variant={exam.isPublished ? 'default' : 'secondary'}>{exam.isPublished ? 'Đã công bố' : 'Bản nháp'}</Badge></div><p className="mt-2 text-slate-600">Lưu thay đổi trước khi công bố đề.</p></div><TeacherExamActions examId={examId} isPublished={exam.isPublished} /></div><ExamEditor examId={examId} initialDraft={initialDraft} /></AppShell>;
}
