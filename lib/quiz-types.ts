import type { Timestamp } from 'firebase/firestore';

export type QuestionInput = {
  id?: string;
  text: string;
  choices: string[];
  correctChoice: number;
};

export type Exam = {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
  questionCount: number;
  createdBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type ExamQuestion = {
  id: string;
  text: string;
  choices: string[];
  order: number;
};

export type Submission = {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  score: number;
  total: number;
  submittedAt?: Timestamp;
};
