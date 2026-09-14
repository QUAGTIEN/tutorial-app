'use client';

import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

export function TeacherExamActions({ examId, isPublished }: { examId: string; isPublished: boolean }) {
  const router = useRouter(); const [pending, setPending] = useState(false);
  async function togglePublish() { setPending(true); await fetch(`/api/exams/${examId}/publish`, { method: 'POST' }); setPending(false); router.refresh(); }
  async function remove() { if (!confirm('Xóa đề này? Bài nộp liên quan cũng sẽ bị xóa.')) return; setPending(true); const response = await fetch(`/api/exams/${examId}`, { method: 'DELETE' }); if (response.ok) router.replace('/teacher'); else setPending(false); }
  return <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={togglePublish} disabled={pending}>{isPublished ? <EyeOff className="size-4" /> : <Eye className="size-4" />}{isPublished ? 'Ẩn đề' : 'Công bố'}</Button><Button variant="destructive" onClick={remove} disabled={pending}><Trash2 className="size-4" />Xóa đề</Button></div>;
}
