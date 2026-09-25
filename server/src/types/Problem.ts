import type { Pattern } from "../data/patterns.ts";

export type Problem = {
  id: number;
  title: string;
  leetcodeUrl: string;
  difficulty: "Easy" | "Medium" | "Hard";
  pattern: Pattern;
  why: string;
};