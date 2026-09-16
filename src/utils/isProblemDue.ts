export function isProblemDue(problemId: number): boolean {
  const saved = localStorage.getItem(`problem-${problemId}`);

  if (!saved) {
    return true;
  }

  const revision = JSON.parse(saved);
  const nextReview = new Date(revision.nextReview);
  const today = new Date();

  return nextReview <= today;
}