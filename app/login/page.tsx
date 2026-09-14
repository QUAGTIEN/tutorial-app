import { BookOpenCheck, KeyRound, UsersRound } from 'lucide-react';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/exam/login-form';
import { getCurrentUser } from '@/lib/auth';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === 'TEACHER' ? '/teacher' : '/student');
  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,_#dbeafe,_transparent_35%),linear-gradient(135deg,#f8fafc,#eef5ff)] p-4">
    <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl shadow-blue-950/10 md:grid-cols-[1.05fr_.95fr]">
      <section className="bg-blue-700 p-8 text-white sm:p-12"><div className="grid size-12 place-items-center rounded-2xl bg-white/15"><BookOpenCheck className="size-7" /></div><h1 className="mt-8 text-3xl font-bold tracking-tight">Kiểm tra nhanh, học tập chủ động.</h1><p className="mt-3 max-w-sm text-blue-100">Giáo viên tạo đề trắc nghiệm, học sinh đăng nhập và làm bài ngay trên một nơi.</p>
        <div className="mt-10 space-y-3 text-sm text-blue-50"><p className="flex items-center gap-2"><KeyRound className="size-4" />Phân quyền rõ ràng theo vai trò</p><p className="flex items-center gap-2"><UsersRound className="size-4" />Kết quả được chấm tự động</p></div>
      </section>
      <section className="p-6 sm:p-10"><LoginForm /><aside className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><p className="font-medium text-slate-800">Tài khoản thử nghiệm</p><p className="mt-1">Giáo viên: <b>teacher / 123456</b></p><p>Học sinh: <b>student / 123456</b></p></aside></section>
    </div>
  </main>;
}
