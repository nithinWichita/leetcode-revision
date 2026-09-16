export function getReviewBatch(): number[] {
  const savedBatch = localStorage.getItem("reviewBatch");

  if (!savedBatch) {
    return [];
  }

  return JSON.parse(savedBatch);
}