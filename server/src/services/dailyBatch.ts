export function createDailyBatch(
  dueReviews: number[],
  newProblems: number[]
): number[] {
  if (newProblems.length > 0) {
    const reviewCount = Math.min(dueReviews.length, 4);
    const newCount = 5 - reviewCount;

    const reviews = dueReviews.slice(0, reviewCount);
    const newOnes = newProblems.slice(0, newCount);

    return [...newOnes, ...reviews];
  }
  else {
    return dueReviews.slice(0, 5);
  }
}