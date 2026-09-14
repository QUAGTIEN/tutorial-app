import { and, desc, eq } from 'drizzle-orm';
import { ClipboardCheck } from 'lucide-react';
import Link from 'next/link';

import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDb } from '@/db';
import { exams, submissions } from '@/db/schema';
import { requireRole } from '@/lib/auth';

export default async function StudentPage() {
  const user = await requireRole('STUDENT'); const db = getDb();
  const availableExams = await db.select().from(exams).where(eq(exams.isPublished, true)).orderBy(desc(exams.updatedAt)).all();
  const completed = await db.select({ examId: submissions.examId, score: submissions.score }).from(submissions).where(eq(submissions.studentId, user.id)).all();
  const submittedByExam = new Map(completed.map((row) => [row.examId, row.score]));
  return <AppShell user={user}><div className="mb-7"><p className="text-sm font-medium text-blue-700">Khu vực học sinh</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Đề kiểm tra đang mở</h1><p className="mt-2 text-slate-600">Chọn một đề để bắt đầu làm bài. Mỗi đề chỉ nộp được một lần.</p></div>
    {availableExams.length === 0 ? <Card><CardContent className="grid place-items-center gap-3 py-16 text-center"><ClipboardCheck className="size-9 text-blue-500" /><div><h2 className="font-semibold">Chưa có đề để làm</h2><p className="mt-1 text-sm text-slate-600">Hãy quay lại sau khi giáo viên công bố đề.</p></div></CardContent></Card> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{availableExams.map((exam) => { const score = submittedByExam.get(exam.id); const completedExam = score !== undefined; return <Card key={exam.id} className="flex h-full"><CardHeader><Badge variant={completedExam ? 'secondary' : 'default'}>{completedExam ? 'Đã nộp' : 'Sẵn sàng làm'}</Badge><CardTitle className="mt-3">{exam.title}</CardTitle></CardHeader><CardContent className="flex flex-1 flex-col"><p className="flex-1 text-sm text-slate-600">{exam.description || 'Không có mô tả.'}</p>{completedExam ? <p className="mt-5 text-sm font-semibold text-blue-700">Điểm của bạn: {score}</p> : <Link href={`/student/exams/${exam.id}`} className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700">Làm bài</Link>}</CardContent></Card>})}</div>}
  </AppShell>;
}
