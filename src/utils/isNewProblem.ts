export function isNewProblem(problemId: number): boolean {
  const saved = localStorage.getItem(`problem-${problemId}`);

  return saved === null;
}