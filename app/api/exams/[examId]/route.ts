import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb } from '@/db';
import { choices, exams, questions } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { normalizeExamDraft } from '@/lib/exams';
import { teacherOwnsExam } from '@/lib/permissions';

type Context = { params: Promise<{ examId: string }> };

export async function GET(_: Request, { params }: Context) {
  const { examId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
  const exam = await getDb().select().from(exams).where(eq(exams.id, examId)).get();
  if (!exam || (user.role === 'TEACHER' && exam.teacherId !== user.id) || (user.role === 'STUDENT' && !exam.isPublished)) return NextResponse.json({ error: 'Không tìm thấy đề.' }, { status: 404 });
  const questionRows = await getDb().select().from(questions).where(eq(questions.examId, examId)).orderBy(questions.position).all();
  const choiceRows = questionRows.length ? await getDb().select().from(choices).where(eq(choices.questionId, questionRows[0].id)).all() : [];
  const allChoices = [] as typeof choiceRows;
  for (const question of questionRows) {
    const rows = question.id === questionRows[0]?.id ? choiceRows : await getDb().select().from(choices).where(eq(choices.questionId, question.id)).orderBy(choices.position).all();
    allChoices.push(...rows);
  }
  const safeQuestions = questionRows.map((question) => ({
    ...question,
    choices: allChoices.filter((choice) => choice.questionId === question.id).map((choice) => user.role === 'STUDENT'
      ? { id: choice.id, content: choice.content, position: choice.position }
      : choice),
  }));
  return NextResponse.json({ exam, questions: safeQuestions });
}

export async function PATCH(request: Request, { params }: Context) {
  const { examId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'TEACHER' || !await teacherOwnsExam(user.id, examId)) return NextResponse.json({ error: 'Không có quyền chỉnh sửa đề này.' }, { status: 403 });
  try {
    const draft = normalizeExamDraft(await request.json());
    const db = getDb();
    await db.update(exams).set({ title: draft.title, description: draft.description, updatedAt: Date.now() }).where(eq(exams.id, examId));
    await db.delete(questions).where(eq(questions.examId, examId));
    for (const [questionPosition, question] of draft.questions.entries()) {
      const questionId = crypto.randomUUID();
      await db.insert(questions).values({ id: questionId, examId, content: question.content, points: question.points, position: questionPosition + 1 });
      await db.insert(choices).values(question.choices.map((choice, choicePosition) => ({ id: crypto.randomUUID(), questionId, content: choice.content, isCorrect: choice.isCorrect, position: choicePosition + 1 })));
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Không thể lưu đề.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: Context) {
  const { examId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'TEACHER' || !await teacherOwnsExam(user.id, examId)) return NextResponse.json({ error: 'Không có quyền xóa đề này.' }, { status: 403 });
  await getDb().delete(exams).where(and(eq(exams.id, examId), eq(exams.teacherId, user.id)));
  return NextResponse.json({ ok: true });
}
