import type { Problem } from "../types/Problem";
import { useState } from "react";
import { patterns } from "../data/patterns";

type ProblemCardProps = {
  problem: Problem;
  isNew: boolean;
  onComplete: () => void;
};

function ProblemCard({ problem, isNew, onComplete }: ProblemCardProps) {
  const [selectedPattern, setSelectedPattern] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hasOpenedProblem, setHasOpenedProblem] = useState(false);
  const [showPattern, setShowPattern] = useState(false);
  const [nextReviewDate, setNextReviewDate] = useState<Date | null>(() => {
    const saved = localStorage.getItem(`problem-${problem.id}`);

    if (!saved) {
      return null;
    }

    const revision = JSON.parse(saved);
    return new Date(revision.nextReview);
  });

  function scheduleReview(
    result: "forgot" | "help" | "solved" | "easy"
  ) {
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
      days =
        currentInterval === 0
          ? 3
          : Math.max(1, Math.floor(currentInterval / 2));
    } else if (result === "solved") {
      days =
        currentInterval === 0
          ? 7
          : Math.min(60, currentInterval * 2);
    } else if (result === "easy") {
      days =
        currentInterval === 0
          ? 14
          : Math.min(60, currentInterval * 3);
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

    onComplete();
  }

  return (
    <div className="problem-card">
      <div className="problem-header">
        <h2>{problem.title}</h2>

        <span
          className={`problem-type ${isNew ? "new" : "review"}`}
        >
          {isNew ? "New" : "Review"}
        </span>
      </div>
      <p className={`difficulty ${problem.difficulty.toLowerCase()}`}>
        {problem.difficulty}
      </p>
      <div className="pattern-section">
        {!showPattern && isCorrect !== true && (
          <>
            <p>What pattern would you use?</p>

            <select
              className="pattern-select"
              value={selectedPattern}
              onChange={(e) => {
                setSelectedPattern(e.target.value);
                setIsCorrect(null);
              }}
            >
              <option value="">Select a pattern</option>

              {patterns.map((pattern) => (
                <option key={pattern} value={pattern}>
                  {pattern}
                </option>
              ))}
            </select>

            <button
              className="button"
              onClick={() => {
                setIsCorrect(problem.pattern === selectedPattern);
              }}
            >
              Check Pattern
            </button>
          </>
        )}

        
      </div>

      {isCorrect === true && (
        <p className="pattern-feedback">✅ Correct!</p>
      )}

      {isCorrect === false && !showPattern && (
  <p className="pattern-feedback">❌ Try again.</p>
)}
      {isCorrect === false && !showPattern && (
        <button
          className="button"
          onClick={() => setShowPattern(true)}
        >
          Reveal Pattern
        </button>
      )}
      {showPattern && (
        <div className="pattern-reveal">
          <p>
            Pattern: <strong>{problem.pattern}</strong>
          </p>
          {problem.why && (
            <p>
              Why: {problem.why}
            </p>
          )}
        </div>
      )}

      {(isCorrect === true || showPattern) && (
        <a
          className="leetcode-link"
          href={problem.leetcodeUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => setHasOpenedProblem(true)}
        >
          Open on LeetCode
        </a>
      )}

      {hasOpenedProblem && (
        <div className="rating-buttons">
          <button className="button" onClick={() => scheduleReview("forgot")}>
            Forgot
          </button>

          <button className="button" onClick={() => scheduleReview("help")}>
            Needed Help
          </button>

          <button className="button" onClick={() => scheduleReview("solved")}>
            Solved
          </button>

          <button className="button" onClick={() => scheduleReview("easy")}>
            Easy
          </button>
        </div>
      )}

      {nextReviewDate && (
        <p className="next-review">
          Next review: {nextReviewDate.toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

export default ProblemCard;