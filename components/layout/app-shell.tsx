'use client';

import { BookOpenCheck, ClipboardList, LogOut, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import type { CurrentUser } from '@/types';

export function AppShell({ user, children }: { user: CurrentUser; children: ReactNode }) {
  const router = useRouter();
  const isTeacher = user.role === 'TEACHER';
  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }
  return <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href={isTeacher ? '/teacher' : '/student'} className="flex items-center gap-2 font-bold tracking-tight text-slate-900">
          <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white"><BookOpenCheck className="size-5" /></span>
          <span>Kiểm tra nhanh</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden text-right text-sm sm:block"><b className="block font-medium">{user.fullName}</b><span className="text-slate-500">{isTeacher ? 'Giáo viên' : 'Học sinh'}</span></span>
          {isTeacher && <><Link href="/teacher/results" className="hidden h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium hover:bg-slate-50 sm:inline-flex"><ClipboardList className="size-4" />Kết quả</Link><Link href="/teacher/exams/new" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"><PlusCircle className="size-4" />Tạo đề</Link></>}
          {!isTeacher && <><Link href="/student/results" className="hidden h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium hover:bg-slate-50 sm:inline-flex"><ClipboardList className="size-4" />Kết quả</Link><Link href="/student" className="hidden h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium hover:bg-slate-50 sm:inline-flex"><ClipboardList className="size-4" />Đề thi</Link></>}
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Đăng xuất"><LogOut className="size-4" /></Button>
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
  </div>;
}
