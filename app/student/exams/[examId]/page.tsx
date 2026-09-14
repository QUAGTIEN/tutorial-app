import { and, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';

import { StudentExamForm } from '@/components/exam/student-exam-form';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent } from '@/components/ui/card';
import { getDb } from '@/db';
import { choices, exams, questions, submissions } from '@/db/schema';
import { requireRole } from '@/lib/auth';
import { totalPoints } from '@/lib/exams';

export default async function StudentExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const user = await requireRole('STUDENT'); const { examId } = await params; const db = getDb();
  const exam = await db.select().from(exams).where(and(eq(exams.id, examId), eq(exams.isPublished, true))).get();
  if (!exam) notFound();
  const previous = await db.select({ id: submissions.id }).from(submissions).where(and(eq(submissions.examId, examId), eq(submissions.studentId, user.id))).get();
  if (previous) redirect('/student/results');
  const questionRows = await db.select().from(questions).where(eq(questions.examId, examId)).orderBy(questions.position).all();
  const safeQuestions = await Promise.all(questionRows.map(async (question) => ({ id: question.id, content: question.content, points: question.points, position: question.position, choices: (await db.select({ id: choices.id, content: choices.content, position: choices.position }).from(choices).where(eq(choices.questionId, question.id)).orderBy(choices.position).all()) })));
  return <AppShell user={user}><div className="mx-auto max-w-3xl"><Card className="mb-5 bg-blue-700 text-white ring-0"><CardContent className="py-6"><p className="text-sm font-medium text-blue-100">Đề kiểm tra</p><h1 className="mt-1 text-2xl font-bold">{exam.title}</h1>{exam.description && <p className="mt-2 text-sm text-blue-100">{exam.description}</p>}<p className="mt-4 text-sm text-blue-100">{questionRows.length} câu · {totalPoints(questionRows)} điểm</p></CardContent></Card><StudentExamForm examId={examId} questions={safeQuestions} /></div></AppShell>;
}
