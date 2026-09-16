export function getProblemInterval(problemId: number): number {
  const saved = localStorage.getItem(`problem-${problemId}`);

  if (!saved) {
    return 0;
  }

  const revision = JSON.parse(saved);

  return revision.interval;
}