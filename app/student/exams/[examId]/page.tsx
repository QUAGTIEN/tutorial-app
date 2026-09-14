'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { CheckCircle2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { RequireRole } from '@/components/auth/require-role';
import { useAuth } from '@/components/auth/auth-provider';
import { firestore } from '@/lib/firebase';
import type { Exam, ExamQuestion } from '@/lib/quiz-types';

function TakeExam() {
  const { user } = useAuth();
  const router = useRouter();
  const { examId } = useParams<{ examId: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { (async () => { try { const ref = doc(firestore, 'exams', examId); const [examDoc, questionDocs] = await Promise.all([getDoc(ref), getDocs(query(collection(ref, 'questions'), orderBy('order')))]); if (!examDoc.exists() || !examDoc.data().isPublished) throw new Error('Đề này hiện chưa mở.'); setExam({ id: examDoc.id, ...examDoc.data() } as Exam); setQuestions(questionDocs.docs.map((item) => ({ id: item.id, ...item.data() }) as ExamQuestion)); } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Không thể tải đề.'); } finally { setLoading(false); } })(); }, [examId]);
  async function submit() { if (!user || !exam) return; if (Object.keys(answers).length !== questions.length) { setMessage('Hãy trả lời tất cả câu hỏi trước khi nộp.'); return; } setSubmitting(true); setMessage(''); try { const token = await user.getIdToken(); const response = await fetch('/api/grade', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ examId, answers }) }); const result = await response.json() as { error?: string; score?: number; total?: number }; if (!response.ok) throw new Error(result.error ?? 'Không thể nộp bài.'); setMessage(`Đã nộp bài. Điểm của bạn: ${result.score}/${result.total}.`); setTimeout(() => router.push('/student/results'), 1500); } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Không thể nộp bài.'); } finally { setSubmitting(false); } }
  if (loading) return <main className="p-10 text-center text-muted-foreground">Đang tải đề...</main>;
  return <><AppHeader role="STUDENT" /><main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">{exam && <><p className="text-sm font-medium text-primary">Đang làm bài</p><h1 className="mt-1 text-3xl font-bold">{exam.title}</h1>{exam.description && <p className="mt-2 text-muted-foreground">{exam.description}</p>}<div className="mt-7 space-y-4">{questions.map((question, index) => <fieldset key={question.id} className="rounded-xl border bg-card p-5"><legend className="font-semibold">Câu {index + 1}. {question.text}</legend><div className="mt-4 space-y-2">{question.choices.map((choice, choiceIndex) => <label key={choiceIndex} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${answers[question.id] === choiceIndex ? 'border-primary bg-blue-50' : ''}`}><input type="radio" name={question.id} checked={answers[question.id] === choiceIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: choiceIndex }))} />{choice}</label>)}</div></fieldset>)}</div><button onClick={submit} disabled={submitting} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground disabled:opacity-60"><CheckCircle2 size={18} /> {submitting ? 'Đang nộp bài...' : 'Nộp bài'}</button></>}{message && <p role="status" className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}</main></>;
}
export default function StudentExamPage() { return <RequireRole role="STUDENT"><TakeExam /></RequireRole>; }
