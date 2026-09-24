export type ReviewResult =
  | "forgot"
  | "help"
  | "solved"
  | "easy";

export function calculateNextInterval(
  currentInterval: number,
  result: ReviewResult
): number {
  if (result === "forgot") {
    return 1;
  }

  if (result === "help") {
    return currentInterval === 0
      ? 3
      : Math.max(1, Math.floor(currentInterval / 2));
  }

  if (result === "solved") {
    return currentInterval === 0
      ? 7
      : Math.min(60, currentInterval * 2);
  }

  return currentInterval === 0
    ? 14
    : Math.min(60, currentInterval * 3);
}