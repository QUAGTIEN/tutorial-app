import { desc, eq } from 'drizzle-orm';
import { ClipboardList, FilePlus2 } from 'lucide-react';
import Link from 'next/link';

import { AppShell } from '@/components/layout/app-shell';
import { TeacherWebMcp } from '@/components/exam/teacher-webmcp';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDb } from '@/db';
import { exams } from '@/db/schema';
import { requireRole } from '@/lib/auth';

export default async function TeacherPage() {
  const user = await requireRole('TEACHER');
  const rows = await getDb().select().from(exams).where(eq(exams.teacherId, user.id)).orderBy(desc(exams.updatedAt)).all();
  return <AppShell user={user}><TeacherWebMcp /><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-blue-700">Khu vực giáo viên</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Đề kiểm tra của bạn</h1><p className="mt-2 text-slate-600">Tạo, chỉnh sửa và công bố đề cho học sinh.</p></div><Link href="/teacher/exams/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"><FilePlus2 className="size-4" />Tạo đề mới</Link></div>
    {rows.length === 0 ? <Card><CardContent className="grid place-items-center gap-3 py-16 text-center"><ClipboardList className="size-9 text-blue-500" /><div><h2 className="font-semibold">Chưa có đề kiểm tra</h2><p className="mt-1 text-sm text-slate-600">Hãy bắt đầu bằng đề trắc nghiệm đầu tiên.</p></div><Link href="/teacher/exams/new" className="text-sm font-medium text-blue-700 hover:underline">Tạo đề mới</Link></CardContent></Card> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.map((exam) => <Link key={exam.id} href={`/teacher/exams/${exam.id}`}><Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md"><CardHeader><Badge variant={exam.isPublished ? 'default' : 'secondary'}>{exam.isPublished ? 'Đã công bố' : 'Bản nháp'}</Badge><CardTitle className="mt-3 line-clamp-2">{exam.title}</CardTitle></CardHeader><CardContent><p className="line-clamp-2 text-sm text-slate-600">{exam.description || 'Không có mô tả.'}</p><p className="mt-4 text-xs text-slate-500">Cập nhật {new Date(exam.updatedAt).toLocaleDateString('vi-VN')}</p></CardContent></Card></Link>)}</div>}
  </AppShell>;
}
