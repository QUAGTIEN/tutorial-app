export type Role = 'TEACHER' | 'STUDENT';

export type CurrentUser = { id: string; username: string; fullName: string; role: Role };
export type QuestionDraft = { id?: string; content: string; points: number; choices: { id?: string; content: string; isCorrect: boolean }[] };
export type ExamDraft = { title: string; description: string; questions: QuestionDraft[] };
