export function gradeAnswer(selectedChoiceId: string | undefined, correctChoiceId: string, points: number) {
  const isCorrect = selectedChoiceId === correctChoiceId;
  return { isCorrect, earnedPoints: isCorrect ? points : 0 };
}
