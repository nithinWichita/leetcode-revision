import type { Problem } from "../types/Problem";
import { useState } from "react";
type ProblemCardProps = {
  problem: Problem;
};

function ProblemCard({ problem }: ProblemCardProps) {
  const [selectedPattern, setSelectedPattern] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
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
      {isCorrect === false && <p>❌ Try again.</p>}
    </div>
  );
}

export default ProblemCard;