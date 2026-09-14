import type { ExamDraft } from '@/types';

export function normalizeExamDraft(input: unknown): ExamDraft {
  const raw = input as Partial<ExamDraft>;
  const title = raw.title?.trim() ?? '';
  const description = raw.description?.trim() ?? '';
  if (!title || title.length > 120) throw new Error('Tên đề phải có từ 1 đến 120 ký tự.');
  if (!Array.isArray(raw.questions) || raw.questions.length === 0) throw new Error('Đề cần ít nhất một câu hỏi.');
  if (raw.questions.length > 50) throw new Error('Mỗi đề tối đa 50 câu hỏi.');
  const questions = raw.questions.map((question, index) => {
    const content = question.content?.trim() ?? '';
    const points = Number(question.points);
    if (!content) throw new Error(`Câu ${index + 1} chưa có nội dung.`);
    if (!Number.isInteger(points) || points < 1 || points > 10) throw new Error(`Điểm của câu ${index + 1} không hợp lệ.`);
    if (!Array.isArray(question.choices) || question.choices.length < 2 || question.choices.length > 6) throw new Error(`Câu ${index + 1} cần từ 2 đến 6 lựa chọn.`);
    const choices = question.choices.map((choice) => ({ content: choice.content?.trim() ?? '', isCorrect: Boolean(choice.isCorrect) }));
    if (choices.some((choice) => !choice.content)) throw new Error(`Câu ${index + 1} có lựa chọn trống.`);
    if (choices.filter((choice) => choice.isCorrect).length !== 1) throw new Error(`Câu ${index + 1} cần đúng một đáp án.`);
    return { content, points, choices };
  });
  return { title, description, questions };
}

export const totalPoints = (questions: { points: number }[]) => questions.reduce((sum, question) => sum + question.points, 0);
