import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb } from '@/db';
import { choices, exams, questions } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { normalizeExamDraft } from '@/lib/exams';

async function teacher() {
  const user = await getCurrentUser();
  return user?.role === 'TEACHER' ? user : null;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
  const rows = user.role === 'TEACHER'
    ? await getDb().select().from(exams).where(eq(exams.teacherId, user.id)).orderBy(desc(exams.updatedAt)).all()
    : await getDb().select().from(exams).where(eq(exams.isPublished, true)).orderBy(desc(exams.updatedAt)).all();
  return NextResponse.json({ exams: rows });
}

export async function POST(request: Request) {
  const user = await teacher();
  if (!user) return NextResponse.json({ error: 'Chỉ giáo viên được tạo đề.' }, { status: 403 });
  try {
    const draft = normalizeExamDraft(await request.json());
    const examId = crypto.randomUUID();
    const now = Date.now();
    const db = getDb();
    await db.insert(exams).values({ id: examId, title: draft.title, description: draft.description, teacherId: user.id, createdAt: now, updatedAt: now });
    for (const [questionPosition, question] of draft.questions.entries()) {
      const questionId = crypto.randomUUID();
      await db.insert(questions).values({ id: questionId, examId, content: question.content, points: question.points, position: questionPosition + 1 });
      await db.insert(choices).values(question.choices.map((choice, choicePosition) => ({ id: crypto.randomUUID(), questionId, content: choice.content, isCorrect: choice.isCorrect, position: choicePosition + 1 })));
    }
    return NextResponse.json({ id: examId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Không thể tạo đề.' }, { status: 400 });
  }
}
