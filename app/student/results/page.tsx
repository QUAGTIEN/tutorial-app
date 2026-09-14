'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { AppHeader } from '@/components/layout/app-header';
import { RequireRole } from '@/components/auth/require-role';
import { useAuth } from '@/components/auth/auth-provider';
import { firestore } from '@/lib/firebase';
import type { Submission } from '@/lib/quiz-types';

function StudentResults() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Submission[]>([]);
  useEffect(() => { if (!user) return; return onSnapshot(query(collection(firestore, 'submissions'), where('studentId', '==', user.uid)), (snapshot) => setRows(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Submission).sort((a, b) => (b.submittedAt?.toMillis() ?? 0) - (a.submittedAt?.toMillis() ?? 0)))); }, [user]);
  return <><AppHeader role="STUDENT" /><main className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><p className="text-sm font-medium text-primary">Khu vực học sinh</p><h1 className="text-3xl font-bold">Kết quả của tôi</h1><div className="mt-7 grid gap-4">{rows.map((row) => <article key={row.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5"><div><h2 className="font-semibold">{row.examTitle}</h2><p className="mt-1 text-sm text-muted-foreground">{row.submittedAt?.toDate().toLocaleString('vi-VN') ?? 'Đang lưu...'}</p></div><p className="text-2xl font-bold text-primary">{row.score}/{row.total}</p></article>)}{!rows.length && <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">Bạn chưa nộp bài nào.</p>}</div></main></>;
}
export default function StudentResultsPage() { return <RequireRole role="STUDENT"><StudentResults /></RequireRole>; }
