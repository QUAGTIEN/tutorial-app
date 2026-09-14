import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb } from '@/db';
import { choices, exams, questions, studentAnswers, submissions } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { gradeAnswer, } from '@/lib/grading';

export async function POST(request: Request, { params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'STUDENT') return NextResponse.json({ error: 'Chỉ học sinh được nộp bài.' }, { status: 403 });
  const exam = await getDb().select().from(exams).where(and(eq(exams.id, examId), eq(exams.isPublished, true))).get();
  if (!exam) return NextResponse.json({ error: 'Đề chưa được công bố.' }, { status: 404 });
  const existing = await getDb().select({ id: submissions.id }).from(submissions).where(and(eq(submissions.examId, examId), eq(submissions.studentId, user.id))).get();
  if (existing) return NextResponse.json({ error: 'Bạn đã nộp bài này.' }, { status: 409 });
  const body = await request.json().catch(() => null) as { answers?: Record<string, string> } | null;
  if (!body?.answers) return NextResponse.json({ error: 'Dữ liệu bài làm không hợp lệ.' }, { status: 400 });
  const db = getDb();
  const questionRows = await db.select().from(questions).where(eq(questions.examId, examId)).all();
  const allChoices = [] as (typeof choices.$inferSelect)[];
  for (const question of questionRows) allChoices.push(...await db.select().from(choices).where(eq(choices.questionId, question.id)).all());
  const submissionId = crypto.randomUUID();
  let score = 0;
  const answerRows = questionRows.map((question) => {
    const selectedChoiceId = body.answers?.[question.id];
    const correctChoice = allChoices.find((choice) => choice.questionId === question.id && choice.isCorrect);
    const isValidChoice = allChoices.some((choice) => choice.questionId === question.id && choice.id === selectedChoiceId);
    const result = gradeAnswer(isValidChoice ? selectedChoiceId : undefined, correctChoice?.id ?? '', question.points);
    score += result.earnedPoints;
    return { id: crypto.randomUUID(), submissionId, questionId: question.id, choiceId: isValidChoice ? selectedChoiceId : null, isCorrect: result.isCorrect };
  });
  await db.insert(submissions).values({ id: submissionId, examId, studentId: user.id, score, submittedAt: Date.now() });
  await db.insert(studentAnswers).values(answerRows);
  return NextResponse.json({ submissionId, score, total: questionRows.reduce((sum, question) => sum + question.points, 0) });
}
