import { and, desc, eq } from 'drizzle-orm';

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDb } from '@/db';
import { exams, submissions, users } from '@/db/schema';
import { requireRole } from '@/lib/auth';

export default async function TeacherResultsPage() {
  const user = await requireRole('TEACHER');
  const rows = await getDb().select({ examTitle: exams.title, studentName: users.fullName, studentUsername: users.username, score: submissions.score, submittedAt: submissions.submittedAt })
    .from(submissions).innerJoin(exams, eq(submissions.examId, exams.id)).innerJoin(users, eq(submissions.studentId, users.id)).where(and(eq(exams.teacherId, user.id))).orderBy(desc(submissions.submittedAt)).all();
  return <AppShell user={user}><div className="mb-7"><p className="text-sm font-medium text-blue-700">Khu vực giáo viên</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Kết quả học sinh</h1><p className="mt-2 text-slate-600">Danh sách bài đã nộp cho các đề của bạn.</p></div><Card><CardHeader><CardTitle>{rows.length} bài đã nộp</CardTitle></CardHeader><CardContent>{rows.length === 0 ? <p className="py-8 text-center text-sm text-slate-600">Chưa có học sinh nộp bài.</p> : <Table><TableHeader><TableRow><TableHead>Học sinh</TableHead><TableHead>Đề kiểm tra</TableHead><TableHead>Điểm</TableHead><TableHead>Thời gian nộp</TableHead></TableRow></TableHeader><TableBody>{rows.map((row, index) => <TableRow key={`${row.studentUsername}-${index}`}><TableCell><b>{row.studentName}</b><span className="block text-xs text-slate-500">{row.studentUsername}</span></TableCell><TableCell>{row.examTitle}</TableCell><TableCell className="font-semibold text-blue-700">{row.score}</TableCell><TableCell>{new Date(row.submittedAt).toLocaleString('vi-VN')}</TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card></AppShell>;
}
