import { desc, eq } from 'drizzle-orm';

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDb } from '@/db';
import { exams, submissions } from '@/db/schema';
import { requireRole } from '@/lib/auth';

export default async function StudentResultsPage() {
  const user = await requireRole('STUDENT');
  const rows = await getDb().select({ title: exams.title, score: submissions.score, submittedAt: submissions.submittedAt }).from(submissions).innerJoin(exams, eq(submissions.examId, exams.id)).where(eq(submissions.studentId, user.id)).orderBy(desc(submissions.submittedAt)).all();
  return <AppShell user={user}><div className="mb-7"><p className="text-sm font-medium text-blue-700">Khu vực học sinh</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Kết quả của bạn</h1><p className="mt-2 text-slate-600">Điểm của các đề bạn đã nộp.</p></div><Card><CardHeader><CardTitle>{rows.length} bài đã nộp</CardTitle></CardHeader><CardContent>{rows.length === 0 ? <p className="py-8 text-center text-sm text-slate-600">Bạn chưa nộp bài nào.</p> : <Table><TableHeader><TableRow><TableHead>Đề kiểm tra</TableHead><TableHead>Điểm</TableHead><TableHead>Thời gian nộp</TableHead></TableRow></TableHeader><TableBody>{rows.map((row, index) => <TableRow key={`${row.title}-${index}`}><TableCell className="font-medium">{row.title}</TableCell><TableCell className="font-semibold text-blue-700">{row.score}</TableCell><TableCell>{new Date(row.submittedAt).toLocaleString('vi-VN')}</TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card></AppShell>;
}
