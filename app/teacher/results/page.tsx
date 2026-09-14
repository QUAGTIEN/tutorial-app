'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { AppHeader } from '@/components/layout/app-header';
import { RequireRole } from '@/components/auth/require-role';
import { firestore } from '@/lib/firebase';
import type { Submission } from '@/lib/quiz-types';

function Results() {
  const [rows, setRows] = useState<Submission[]>([]);
  useEffect(() => onSnapshot(collection(firestore, 'submissions'), (snapshot) => setRows(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Submission).sort((a, b) => (b.submittedAt?.toMillis() ?? 0) - (a.submittedAt?.toMillis() ?? 0)))), []);
  return <><AppHeader role="TEACHER" /><main className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><p className="text-sm font-medium text-primary">Khu vực giáo viên</p><h1 className="text-3xl font-bold">Kết quả bài làm</h1><div className="mt-7 overflow-hidden rounded-xl border bg-card"><table className="w-full text-left text-sm"><thead className="bg-muted text-muted-foreground"><tr><th className="p-4 font-medium">Đề kiểm tra</th><th className="p-4 font-medium">Học sinh</th><th className="p-4 font-medium">Điểm</th><th className="p-4 font-medium">Thời gian</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t"><td className="p-4 font-medium">{row.examTitle}</td><td className="p-4 font-mono text-xs">{row.studentId.slice(0, 12)}…</td><td className="p-4">{row.score}/{row.total}</td><td className="p-4 text-muted-foreground">{row.submittedAt?.toDate().toLocaleString('vi-VN') ?? 'Đang lưu...'}</td></tr>)}{!rows.length && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">Chưa có bài nộp.</td></tr>}</tbody></table></div></main></>;
}
export default function TeacherResultsPage() { return <RequireRole role="TEACHER"><Results /></RequireRole>; }
