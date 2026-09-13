export type Problem = {
  id: number;
  title: string;
  leetcodeUrl: string;
  difficulty: "Easy" | "Medium" | "Hard";
  patterns: string[];

  lastSolved: string | null;
  nextReview: string | null;
  interval: number;
};