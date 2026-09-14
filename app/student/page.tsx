'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { ClipboardCheck } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { RequireRole } from '@/components/auth/require-role';
import { firestore } from '@/lib/firebase';
import type { Exam } from '@/lib/quiz-types';

function StudentDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  useEffect(() => onSnapshot(query(collection(firestore, 'exams'), where('isPublished', '==', true)), (snapshot) => setExams(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Exam).sort((a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0)))), []);
  return <><AppHeader role="STUDENT" /><main className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><p className="text-sm font-medium text-primary">Khu vực học sinh</p><h1 className="text-3xl font-bold">Đề đang mở</h1><p className="mt-2 text-muted-foreground">Chọn một đề để bắt đầu làm bài.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{exams.map((exam) => <article key={exam.id} className="flex flex-col rounded-xl border bg-card p-5 shadow-sm"><h2 className="text-xl font-semibold">{exam.title}</h2><p className="mt-2 flex-1 text-sm text-muted-foreground">{exam.description || 'Không có mô tả.'}</p><p className="mt-4 text-sm">{exam.questionCount} câu hỏi</p><Link href={`/student/exams/${exam.id}`} className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-center font-medium text-primary-foreground">Bắt đầu làm bài</Link></article>)}{!exams.length && <div className="col-span-full rounded-xl border border-dashed p-12 text-center"><ClipboardCheck className="mx-auto mb-3 text-muted-foreground" /><h2 className="font-semibold">Chưa có đề đang mở</h2><p className="mt-1 text-sm text-muted-foreground">Giáo viên sẽ công bố đề tại đây.</p></div>}</div></main></>;
}
export default function StudentPage() { return <RequireRole role="STUDENT"><StudentDashboard /></RequireRole>; }
