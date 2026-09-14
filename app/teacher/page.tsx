'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { RequireRole } from '@/components/auth/require-role';
import { useAuth } from '@/components/auth/auth-provider';
import { firestore } from '@/lib/firebase';
import type { Exam } from '@/lib/quiz-types';

function TeacherDashboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  useEffect(() => {
    if (!user) return;
    return onSnapshot(query(collection(firestore, 'exams'), where('createdBy', '==', user.uid)), (snapshot) => setExams(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Exam).sort((a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0))));
  }, [user]);
  async function removeExam(id: string) {
    if (!confirm('Xóa đề này?')) return;
    await deleteDoc(doc(firestore, 'exams', id));
  }
  return <><AppHeader role="TEACHER" /><main className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-primary">Khu vực giáo viên</p><h1 className="text-3xl font-bold">Đề kiểm tra</h1><p className="mt-2 text-muted-foreground">Tạo, chỉnh sửa và công bố đề cho học sinh.</p></div><Link href="/teacher/exams/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground"><Plus size={18} /> Tạo đề mới</Link></div><div className="mt-8 grid gap-4">{exams.map((exam) => <article key={exam.id} className="rounded-xl border bg-card p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="text-xl font-semibold">{exam.title}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${exam.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{exam.isPublished ? 'Đã công bố' : 'Bản nháp'}</span></div><p className="mt-2 text-sm text-muted-foreground">{exam.description || 'Chưa có mô tả'} · {exam.questionCount} câu hỏi</p></div><div className="flex gap-2"><Link href={`/teacher/exams/${exam.id}`} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm hover:bg-muted"><Pencil size={15} /> Sửa</Link><button onClick={() => removeExam(exam.id)} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"><Trash2 size={15} /> Xóa</button></div></div></article>)}{!exams.length && <div className="rounded-xl border border-dashed p-12 text-center"><FileText className="mx-auto mb-3 text-muted-foreground" /><h2 className="font-semibold">Chưa có đề kiểm tra</h2><p className="mt-1 text-sm text-muted-foreground">Tạo đề đầu tiên để học sinh có thể làm bài.</p></div>}</div></main></>;
}

export default function TeacherPage() { return <RequireRole role="TEACHER"><TeacherDashboard /></RequireRole>; }
