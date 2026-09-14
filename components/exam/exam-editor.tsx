'use client';

import { GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { ExamDraft, QuestionDraft } from '@/types';

const blankQuestion = (): QuestionDraft => ({ content: '', points: 1, choices: Array.from({ length: 4 }, () => ({ content: '', isCorrect: false })) });

export function ExamEditor({ examId, initialDraft }: { examId?: string; initialDraft?: ExamDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ExamDraft>(initialDraft ?? { title: '', description: '', questions: [blankQuestion()] });
  const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false);
  const updateQuestion = (index: number, change: Partial<QuestionDraft>) => setDraft((current) => ({ ...current, questions: current.questions.map((question, i) => i === index ? { ...question, ...change } : question) }));
  const updateChoice = (questionIndex: number, choiceIndex: number, content: string) => updateQuestion(questionIndex, { choices: draft.questions[questionIndex].choices.map((choice, i) => i === choiceIndex ? { ...choice, content } : choice) });
  const selectCorrect = (questionIndex: number, choiceIndex: number) => updateQuestion(questionIndex, { choices: draft.questions[questionIndex].choices.map((choice, i) => ({ ...choice, isCorrect: i === choiceIndex })) });
  async function save() {
    setSaving(true); setMessage('');
    const response = await fetch(examId ? `/api/exams/${examId}` : '/api/exams', { method: examId ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(draft) });
    const data = await response.json(); setSaving(false);
    if (!response.ok) return setMessage(data.error ?? 'Không thể lưu đề.');
    if (!examId) return router.replace(`/teacher/exams/${data.id}`);
    setMessage('Đã lưu thay đổi.'); router.refresh();
  }
  return <div className="space-y-5">
    <Card><CardHeader><CardTitle>Thông tin đề</CardTitle></CardHeader><CardContent className="grid gap-4">
      <label className="space-y-1.5 text-sm font-medium">Tên đề<Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Ví dụ: Kiểm tra Toán lớp 6" /></label>
      <label className="space-y-1.5 text-sm font-medium">Mô tả <span className="font-normal text-slate-500">(không bắt buộc)</span><Textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Hướng dẫn ngắn cho học sinh" /></label>
    </CardContent></Card>
    {draft.questions.map((question, questionIndex) => <Card key={questionIndex} className="overflow-visible">
      <CardHeader className="flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-base"><GripVertical className="size-4 text-slate-400" />Câu {questionIndex + 1}</CardTitle><Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDraft({ ...draft, questions: draft.questions.filter((_, index) => index !== questionIndex) })} disabled={draft.questions.length === 1} aria-label="Xóa câu hỏi"><Trash2 className="size-4" /></Button></CardHeader>
      <CardContent className="space-y-4"><Textarea value={question.content} onChange={(event) => updateQuestion(questionIndex, { content: event.target.value })} placeholder="Nhập nội dung câu hỏi" />
        <div className="grid gap-3 sm:grid-cols-[1fr_110px]"><div className="space-y-2"><p className="text-sm font-medium">Lựa chọn <span className="font-normal text-slate-500">— chọn đáp án đúng</span></p><RadioGroup value={String(question.choices.findIndex((choice) => choice.isCorrect))} onValueChange={(value) => selectCorrect(questionIndex, Number(value))}>
          {question.choices.map((choice, choiceIndex) => <label key={choiceIndex} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:border-blue-300"><RadioGroupItem value={String(choiceIndex)} aria-label={`Đáp án ${choiceIndex + 1}`} /><Input value={choice.content} onChange={(event) => updateChoice(questionIndex, choiceIndex, event.target.value)} placeholder={`Lựa chọn ${choiceIndex + 1}`} /></label>)}
        </RadioGroup></div><label className="space-y-1.5 text-sm font-medium">Điểm<Input type="number" min="1" max="10" value={question.points} onChange={(event) => updateQuestion(questionIndex, { points: Number(event.target.value) })} /></label></div>
      </CardContent>
    </Card>)}
    <Button variant="outline" onClick={() => setDraft({ ...draft, questions: [...draft.questions, blankQuestion()] })}><Plus className="size-4" />Thêm câu hỏi</Button>
    <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur"><p className="text-sm text-slate-600">{message}</p><Button size="lg" onClick={save} disabled={saving}><Save className="size-4" />{saving ? 'Đang lưu…' : 'Lưu đề'}</Button></div>
  </div>;
}
