import { FirebaseExamEditor } from '@/components/exam/firebase-exam-editor';
import { RequireRole } from '@/components/auth/require-role';
import { AppHeader } from '@/components/layout/app-header';

export default function NewExamPage() {
  return <RequireRole role="TEACHER"><AppHeader role="TEACHER" /><FirebaseExamEditor /></RequireRole>;
}
