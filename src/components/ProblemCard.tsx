import type { Problem } from "../types/Problem";
import { useState } from "react";
type ProblemCardProps = {
  problem: Problem;
};

function ProblemCard({ problem }: ProblemCardProps) {
  const [selectedPattern, setSelectedPattern] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [nextReviewDate, setNextReviewDate] = useState<Date | null>(() => {
    const saved = localStorage.getItem(`problem-${problem.id}`);

    if (!saved) {
      return null;
    }

    const revision = JSON.parse(saved);

    return new Date(revision.nextReview);
  });
  function scheduleReview(days: number) {
    const today = new Date();
    const nextReview = new Date(today);

    nextReview.setDate(today.getDate() + days);

    setNextReviewDate(nextReview);
    localStorage.setItem(
      `problem-${problem.id}`,
      JSON.stringify({
        nextReview: nextReview.toISOString(),
        interval: days,
      })
    );
  }
  return (
    <div>
      <h2>{problem.title}</h2>
      <p>{problem.difficulty}</p>
      <p>What pattern would you use?</p>

      <select value={selectedPattern} onChange={(e) => setSelectedPattern(e.target.value)}>
        <option>Select a pattern</option>
        <option>Hash Map</option>
        <option>Two Pointers</option>
        <option>Sliding Window</option>
        <option>Greedy</option>
      </select>

      <button
        onClick={() => {
          setIsCorrect(problem.patterns.includes(selectedPattern));
        }}
      >
        Check Pattern
      </button>
      {isCorrect === true && <p>✅ Correct!</p>}
      {isCorrect === true && (
        <a
          href={problem.leetcodeUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open on LeetCode
        </a>

      )}
      <div>
        <button onClick={() => scheduleReview(1)}>Forgot</button>
        <button onClick={() => scheduleReview(3)}>Needed Help</button>
        <button onClick={() => scheduleReview(7)}>Solved</button>
        <button onClick={() => scheduleReview(14)}>Easy</button>
      </div>
      {nextReviewDate && (
        <p>
          Next review: {nextReviewDate.toLocaleDateString()}
        </p>
      )}
      {isCorrect === false && <p>❌ Try again.</p>}
    </div>
  );
}

export default ProblemCard;