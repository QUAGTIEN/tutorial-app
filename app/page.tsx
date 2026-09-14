'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';

export default function Home() {
  const { loading, user, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(!user ? '/login' : role === 'TEACHER' ? '/teacher' : '/student');
  }, [loading, role, router, user]);

  return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Đang tải...</main>;
}
