import type { Problem } from "../types/Problem";
import { useState } from "react";
import { patterns } from "../data/patterns";
const API_URL = import.meta.env.VITE_API_URL;
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
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function scheduleReview(
    result: "forgot" | "help" | "solved" | "easy"
  ) {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${API_URL}/api/progress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            problemId: problem.id,
            result,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to save progress:", data);
        setSaveError("Could not save progress. Please try again.");
        return;
      }
      setSaveError("");
      onComplete();
    } catch {
      setSaveError("Could not connect to the server. Please try again.");
    } finally {
      setIsSaving(false);
    }
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
          <button className="button"  disabled={isSaving} onClick={() => scheduleReview("forgot")}>
            Forgot
          </button>

          <button className="button"  disabled={isSaving} onClick={() => scheduleReview("help")}>
            Needed Help
          </button>

          <button className="button"  disabled={isSaving} onClick={() => scheduleReview("solved")}>
            Solved
          </button>

          <button className="button"  disabled={isSaving} onClick={() => scheduleReview("easy")}>
            Easy
          </button>
        </div>
      )}
      {saveError && (
        <p className="save-error">{saveError}</p>
      )}
    </div>
  );
}

export default ProblemCard; 