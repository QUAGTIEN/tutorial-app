'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

export function RequireRole({ role, children }: { role: 'TEACHER' | 'STUDENT'; children: React.ReactNode }) {
  const { loading, user, role: currentRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (currentRole !== role) router.replace(currentRole === 'TEACHER' ? '/teacher' : '/student');
  }, [currentRole, loading, role, router, user]);

  if (loading || !user || currentRole !== role) {
    return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Đang tải...</main>;
  }
  return <>{children}</>;
}
