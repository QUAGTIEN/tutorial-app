'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

export function AppHeader({ role }: { role: 'TEACHER' | 'STUDENT' }) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const home = role === 'TEACHER' ? '/teacher' : '/student';

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return <header className="border-b bg-card">
    <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
      <Link href={home} className="font-semibold text-primary">Kiểm tra nhanh</Link>
      <nav className="flex items-center gap-3 text-sm">
        {role === 'TEACHER' ? <>
          <Link href="/teacher">Đề kiểm tra</Link>
          <Link href="/teacher/results">Kết quả</Link>
        </> : <>
          <Link href="/student">Làm bài</Link>
          <Link href="/student/results">Kết quả</Link>
        </>}
        <button onClick={handleLogout} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 hover:bg-muted" aria-label="Đăng xuất">
          <LogOut size={16} /> <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </nav>
    </div>
  </header>;
}
