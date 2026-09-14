'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { ArrowLeft, Plus, Save, Send, Trash2 } from 'lucide-react';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/components/auth/auth-provider';
import type { QuestionInput } from '@/lib/quiz-types';

const newQuestion = (): QuestionInput => ({ text: '', choices: ['', '', '', ''], correctChoice: 0 });

export function FirebaseExamEditor({ examId }: { examId?: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(false);
  const [questions, setQuestions] = useState<QuestionInput[]>([newQuestion()]);
  const [loading, setLoading] = useState(Boolean(examId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!examId) return;
    (async () => {
      try {
        const examRef = doc(firestore, 'exams', examId);
        const [exam, questionDocs, keys] = await Promise.all([getDoc(examRef), getDocs(collection(examRef, 'questions')), getDoc(doc(firestore, 'examKeys', examId))]);
        if (!exam.exists()) throw new Error('Không tìm thấy đề kiểm tra.');
        const data = exam.data();
        const answerMap = (keys.data()?.answers ?? {}) as Record<string, number>;
        setTitle(data.title ?? ''); setDescription(data.description ?? ''); setPublished(Boolean(data.isPublished));
        setQuestions(questionDocs.docs.sort((a, b) => (a.data().order ?? 0) - (b.data().order ?? 0)).map((item) => ({ id: item.id, text: item.data().text, choices: item.data().choices, correctChoice: answerMap[item.id] ?? 0 })));
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải đề.'); }
      finally { setLoading(false); }
    })();
  }, [examId]);

  const valid = useMemo(() => title.trim() && questions.length > 0 && questions.every((question) => question.text.trim() && question.choices.length >= 2 && question.choices.every((choice) => choice.trim())), [questions, title]);
  function updateQuestion(index: number, patch: Partial<QuestionInput>) { setQuestions((all) => all.map((item, position) => position === index ? { ...item, ...patch } : item)); }
  function updateChoice(questionIndex: number, choiceIndex: number, value: string) { setQuestions((all) => all.map((question, index) => index === questionIndex ? { ...question, choices: question.choices.map((choice, position) => position === choiceIndex ? value : choice) } : question)); }

  async function save() {
    if (!user || !valid) { setError('Hãy nhập tên đề, nội dung câu hỏi và ít nhất hai lựa chọn cho mỗi câu.'); return; }
    setSaving(true); setError('');
    try {
      let targetId = examId;
      if (!targetId) {
        const created = await addDoc(collection(firestore, 'exams'), { title: title.trim(), description: description.trim(), isPublished: false, questionCount: 0, createdBy: user.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        targetId = created.id;
      }
      const examRef = doc(firestore, 'exams', targetId);
      const batch = writeBatch(firestore);
      const oldQuestions = await getDocs(collection(examRef, 'questions'));
      oldQuestions.forEach((question) => batch.delete(question.ref));
      const answerMap: Record<string, number> = {};
      questions.forEach((question, index) => {
        const questionRef = doc(collection(examRef, 'questions'));
        batch.set(questionRef, { text: question.text.trim(), choices: question.choices.map((choice) => choice.trim()), order: index });
        answerMap[questionRef.id] = question.correctChoice;
      });
      batch.set(examRef, { title: title.trim(), description: description.trim(), isPublished: published, questionCount: questions.length, createdBy: user.uid, updatedAt: serverTimestamp() }, { merge: true });
      batch.set(doc(firestore, 'examKeys', targetId), { createdBy: user.uid, answers: answerMap, updatedAt: serverTimestamp() });
      await batch.commit();
      router.replace(`/teacher/exams/${targetId}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể lưu đề.'); }
    finally { setSaving(false); }
  }

  async function togglePublished() {
    if (!examId) { setError('Hãy lưu đề trước khi công bố.'); return; }
    setSaving(true); setError('');
    try { await updateDoc(doc(firestore, 'exams', examId), { isPublished: !published, updatedAt: serverTimestamp() }); setPublished(!published); }
    catch { setError('Không thể thay đổi trạng thái công bố.'); }
    finally { setSaving(false); }
  }

  if (loading) return <main className="p-10 text-center text-muted-foreground">Đang tải đề...</main>;
  return <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><button onClick={() => router.push('/teacher')} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Quay lại danh sách đề</button><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-primary">Trình soạn thảo</p><h1 className="text-3xl font-bold">{examId ? 'Chỉnh sửa đề' : 'Tạo đề mới'}</h1></div>{examId && <button onClick={togglePublished} disabled={saving} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium ${published ? 'border' : 'bg-primary text-primary-foreground'}`}><Send size={17} /> {published ? 'Gỡ công bố' : 'Công bố đề'}</button>}</div><section className="mt-7 space-y-5 rounded-xl border bg-card p-5 shadow-sm"><label className="block font-medium">Tên đề<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Kiểm tra Toán chương 1" className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5" /></label><label className="block font-medium">Mô tả (không bắt buộc)<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5" /></label></section><div className="mt-6 space-y-4">{questions.map((question, questionIndex) => <section key={questionIndex} className="rounded-xl border bg-card p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Câu {questionIndex + 1}</h2>{questions.length > 1 && <button onClick={() => setQuestions((all) => all.filter((_, index) => index !== questionIndex))} className="rounded-md p-2 text-red-600 hover:bg-red-50" aria-label={`Xóa câu ${questionIndex + 1}`}><Trash2 size={17} /></button>}</div><label className="block text-sm font-medium">Nội dung câu hỏi<input value={question.text} onChange={(event) => updateQuestion(questionIndex, { text: event.target.value })} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5" /></label><fieldset className="mt-4 space-y-2"><legend className="text-sm font-medium">Lựa chọn — chọn đáp án đúng</legend>{question.choices.map((choice, choiceIndex) => <label key={choiceIndex} className="flex items-center gap-3 rounded-lg border p-2.5"><input type="radio" checked={question.correctChoice === choiceIndex} onChange={() => updateQuestion(questionIndex, { correctChoice: choiceIndex })} name={`correct-${questionIndex}`} /><input value={choice} onChange={(event) => updateChoice(questionIndex, choiceIndex, event.target.value)} aria-label={`Lựa chọn ${choiceIndex + 1}`} className="min-w-0 flex-1 bg-transparent outline-none" /></label>)}</fieldset></section>)}</div><button onClick={() => setQuestions((all) => [...all, newQuestion()])} className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 font-medium hover:bg-muted"><Plus size={17} /> Thêm câu hỏi</button>{error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="sticky bottom-4 mt-6 flex justify-end"><button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground shadow-lg disabled:opacity-60"><Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu đề'}</button></div></main>;
}
