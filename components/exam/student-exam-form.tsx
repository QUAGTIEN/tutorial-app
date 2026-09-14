'use client';

import { CheckCircle2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type StudentQuestion = { id: string; content: string; points: number; position: number; choices: { id: string; content: string; position: number }[] };

export function StudentExamForm({ examId, questions }: { examId: string; questions: StudentQuestion[] }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState(''); const [submitting, setSubmitting] = useState(false);
  const answered = Object.keys(answers).length;
  async function submit() {
    if (!confirm(`Bạn đã trả lời ${answered}/${questions.length} câu. Nộp bài ngay?`)) return;
    setSubmitting(true); setMessage('');
    const response = await fetch(`/api/exams/${examId}/submit`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ answers }) });
    const data = await response.json(); setSubmitting(false);
    if (!response.ok) return setMessage(data.error ?? 'Không thể nộp bài.');
    router.replace('/student/results'); router.refresh();
  }
  return <div className="space-y-4">
    {questions.map((question, index) => <Card key={question.id}><CardHeader><CardTitle className="text-base">Câu {index + 1}. {question.content}<span className="ml-2 text-sm font-normal text-slate-500">({question.points} điểm)</span></CardTitle></CardHeader><CardContent>
      <RadioGroup value={answers[question.id]} onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}>
        {question.choices.map((choice) => <label key={choice.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 text-sm hover:border-blue-300 hover:bg-blue-50/40"><RadioGroupItem value={choice.id} /><span>{choice.content}</span></label>)}
      </RadioGroup>
    </CardContent></Card>)}
    <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-xl border border-blue-100 bg-white/95 p-3 shadow-lg backdrop-blur"><span className="text-sm text-slate-600"><CheckCircle2 className="mr-1 inline size-4 text-blue-600" />Đã trả lời {answered}/{questions.length} câu</span><Button size="lg" onClick={submit} disabled={submitting}><Send className="size-4" />{submitting ? 'Đang nộp…' : 'Nộp bài'}</Button></div>
    {message && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>}
  </div>;
}
