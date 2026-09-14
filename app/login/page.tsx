'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { firebaseAuth, isTeacher } from '@/lib/firebase';
import { useAuth } from '@/components/auth/auth-provider';

export default function LoginPage() {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(role === 'TEACHER' ? '/teacher' : '/student');
  }, [loading, role, router, user]);

  async function loginTeacher(event: React.FormEvent) {
    event.preventDefault();
    setError(''); setSubmitting(true);
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      if (!isTeacher(credential.user.uid)) {
        await firebaseAuth.signOut();
        throw new Error('Tài khoản này chưa được cấp quyền giáo viên.');
      }
      router.replace('/teacher');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể đăng nhập.');
    } finally { setSubmitting(false); }
  }

  async function enterAsStudent() {
    setError(''); setSubmitting(true);
    try { await signInAnonymously(firebaseAuth); router.replace('/student'); }
    catch { setError('Chưa thể tạo phiên học sinh. Hãy kiểm tra Anonymous Authentication đã được bật trong Firebase.'); }
    finally { setSubmitting(false); }
  }

  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe,_transparent_42%),linear-gradient(135deg,_#f8fafc,_#eff6ff)] px-4 py-10">
    <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-4xl items-center gap-6 md:grid-cols-2">
      <section className="rounded-3xl bg-primary p-8 text-primary-foreground shadow-xl sm:p-10"><p className="mb-4 text-sm font-semibold tracking-widest text-blue-200 uppercase">Kiểm tra nhanh</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tạo đề. Làm bài. Xem kết quả.</h1><p className="mt-4 leading-7 text-blue-100">Không cần tài khoản cho học sinh. Giáo viên đăng nhập để tạo và quản lý đề kiểm tra.</p></section>
      <section className="rounded-3xl border bg-card p-6 shadow-lg sm:p-8"><div className="mb-6 flex gap-2"><ShieldCheck className="text-primary" aria-hidden="true" /><h2 className="text-xl font-semibold">Đăng nhập giáo viên</h2></div>
        <form onSubmit={loginTeacher} className="space-y-4"><label className="block text-sm font-medium">Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5" /></label><label className="block text-sm font-medium">Mật khẩu<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete="current-password" className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5" /></label><button disabled={submitting} className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground disabled:opacity-60">Đăng nhập</button></form>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">hoặc</div><button onClick={enterAsStudent} disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 font-medium hover:bg-muted disabled:opacity-60"><GraduationCap size={18} /> Vào làm bài với tư cách học sinh</button>{error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}</section>
    </div>
  </main>;
}
