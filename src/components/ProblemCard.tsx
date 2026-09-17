import type { Problem } from "../types/Problem";
import { useState } from "react";
import { patterns } from "../data/patterns";
import { getTodayDate } from "../utils/getTodayDate";

type ProblemCardProps = {
  problem: Problem;
  isNew: boolean;
  onComplete: () => void;
};

function ProblemCard({ problem, isNew, onComplete }: ProblemCardProps) {
  const [selectedPattern, setSelectedPattern] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hasOpenedProblem, setHasOpenedProblem] = useState(false);
  const [nextReviewDate, setNextReviewDate] = useState<Date | null>(() => {
    const saved = localStorage.getItem(`problem-${problem.id}`);

    if (!saved) {
      return null;
    }

    const revision = JSON.parse(saved);

    return new Date(revision.nextReview);
  });
  function scheduleReview(result: "forgot" | "help" | "solved" | "easy") {
    const today = new Date();
    const nextReview = new Date(today);
    const saved = localStorage.getItem(`problem-${problem.id}`);
    let currentInterval = 0;

    if (saved) {
      const revision = JSON.parse(saved);
      currentInterval = revision.interval;
    }
    let days = 0;

    if (result === "forgot") {
      days = 1;
    } else if (result === "help") {
      days = currentInterval === 0 ? 3 : Math.max(1, Math.floor(currentInterval / 2));
    } else if (result === "solved") {
      days = currentInterval === 0 ? 7 : Math.min(60, currentInterval * 2);
    } else if (result === "easy") {
      days = currentInterval === 0 ? 14 : Math.min(60, currentInterval * 3);
    }
    nextReview.setDate(today.getDate() + days);

    setNextReviewDate(nextReview);
    localStorage.setItem(
      `problem-${problem.id}`,
      JSON.stringify({
        nextReview: nextReview.toISOString(),
        interval: days,
      })
    );
    if (isNew) {
      localStorage.setItem("lastNewProblemDate", getTodayDate());
    }
    onComplete();
  }
  return (
    <div>
      <h2>{problem.title}</h2>
      <p>{problem.difficulty}</p>
      <p>What pattern would you use?</p>

      <select value={selectedPattern} onChange={(e) => setSelectedPattern(e.target.value)}>
        <option>Select a pattern</option>
        {patterns.map((pattern) => (
          <option key={pattern} value={pattern}>
            {pattern}
          </option>
        ))}
      </select>

      <button
        onClick={() => {
          setIsCorrect(problem.pattern === selectedPattern);
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
          onClick={() => setHasOpenedProblem(true)}
        >
          Open on LeetCode
        </a>

      )}
      {hasOpenedProblem && (
        <div>
          <button onClick={() => scheduleReview("forgot")}>Forgot</button>
          <button onClick={() => scheduleReview("help")}>Needed Help</button>
          <button onClick={() => scheduleReview("solved")}>Solved</button>
          <button onClick={() => scheduleReview("easy")}>Easy</button>
        </div>
      )}
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