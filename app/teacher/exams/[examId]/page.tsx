'use client';

import { useParams } from 'next/navigation';
import { FirebaseExamEditor } from '@/components/exam/firebase-exam-editor';
import { RequireRole } from '@/components/auth/require-role';
import { AppHeader } from '@/components/layout/app-header';

export default function EditExamPage() {
  const params = useParams<{ examId: string }>();
  return <RequireRole role="TEACHER"><AppHeader role="TEACHER" /><FirebaseExamEditor examId={params.examId} /></RequireRole>;
}
