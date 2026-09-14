import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để nộp bài.' }, { status: 401 });
    }
    const token = await adminAuth().verifyIdToken(authorization.slice(7));
    if (token.uid === process.env.NEXT_PUBLIC_TEACHER_UID) {
      return NextResponse.json({ error: 'Tài khoản giáo viên không thể nộp bài.' }, { status: 403 });
    }
    const body = await request.json() as { examId?: string; answers?: Record<string, unknown> };
    if (!body.examId || !body.answers || typeof body.answers !== 'object') {
      return NextResponse.json({ error: 'Dữ liệu bài làm không hợp lệ.' }, { status: 400 });
    }
    const database = adminDb();
    const examRef = database.collection('exams').doc(body.examId);
    const submissionRef = database.collection('submissions').doc(`${token.uid}_${body.examId}`);
    const [examSnapshot, keySnapshot, questionsSnapshot, previousSubmission] = await Promise.all([
      examRef.get(),
      database.collection('examKeys').doc(body.examId).get(),
      examRef.collection('questions').orderBy('order').get(),
      submissionRef.get(),
    ]);
    if (!examSnapshot.exists || !examSnapshot.data()?.isPublished) {
      return NextResponse.json({ error: 'Đề kiểm tra không còn mở.' }, { status: 404 });
    }
    if (previousSubmission.exists) {
      return NextResponse.json({ error: 'Bạn đã nộp bài này rồi.' }, { status: 409 });
    }
    const answerKey = (keySnapshot.data()?.answers ?? {}) as Record<string, number>;
    const questions = questionsSnapshot.docs;
    const answers: Record<string, number> = {};
    let score = 0;
    for (const question of questions) {
      const value = body.answers[question.id];
      if (typeof value !== 'number' || !Number.isInteger(value)) return NextResponse.json({ error: 'Câu trả lời không hợp lệ.' }, { status: 400 });
      const choice = value;
      const choices = question.data().choices as string[];
      if (choice < 0 || choice >= choices.length) return NextResponse.json({ error: 'Lựa chọn không hợp lệ.' }, { status: 400 });
      answers[question.id] = choice;
      if (answerKey[question.id] === choice) score += 1;
    }
    await submissionRef.create({
      examId: body.examId,
      examTitle: examSnapshot.data()?.title ?? 'Đề kiểm tra',
      studentId: token.uid,
      answers,
      score,
      total: questions.length,
      submittedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ score, total: questions.length });
  } catch (cause) {
    console.error('Grade submission failed', cause);
    return NextResponse.json({ error: 'Không thể chấm bài. Hãy thử lại.' }, { status: 500 });
  }
}
