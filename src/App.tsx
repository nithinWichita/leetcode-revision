import { problems } from "./data/problems";
import ProblemCard from "./components/ProblemCard";
import { isProblemDue } from "./utils/isProblemDue";
import { isNewProblem } from "./utils/isNewProblem";
import { useState } from "react";
import { getProblemInterval } from "./utils/getProblemInterval";

function App() {
  const [, setRefreshKey] = useState(0);
  const reviewProblems = problems
    .filter(
      (problem) =>
        !isNewProblem(problem.id) &&
        isProblemDue(problem.id)
    )
    .sort(
      (a, b) =>
        getProblemInterval(a.id) - getProblemInterval(b.id)
    )
    .slice(0, 4);

  const newProblems = problems
    .filter((problem) => isNewProblem(problem.id))
    .slice(0, 1);

  const todaysProblems = [...reviewProblems, ...newProblems];
  return (
    <div>
      <h1>LeetCode Revision</h1>

      {todaysProblems.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} onComplete={() => setRefreshKey((old) => old + 1)} />
      ))}
    </div>
  );
}

export default App;