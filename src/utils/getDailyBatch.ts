export function getDailyBatch(): number[] {
  const savedBatch = localStorage.getItem("dailyBatch");

  if (!savedBatch) {
    return [];
  }

  return JSON.parse(savedBatch);
}