import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { ExamEditor } from '@/components/exam/exam-editor';
import { AppShell } from '@/components/layout/app-shell';
import { requireRole } from '@/lib/auth';

export default async function NewExamPage() {
  const user = await requireRole('TEACHER');
  return <AppShell user={user}><Link href="/teacher" className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-950"><ChevronLeft className="size-4" />Danh sách đề</Link><h1 className="mb-6 text-3xl font-bold tracking-tight">Tạo đề kiểm tra</h1><ExamEditor /></AppShell>;
}
