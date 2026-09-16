import { problems } from "./data/problems";
import ProblemCard from "./components/ProblemCard";
import { isProblemDue } from "./utils/isProblemDue";
import { isNewProblem } from "./utils/isNewProblem";
import { useState } from "react";
import { getProblemInterval } from "./utils/getProblemInterval";
import { getTodayDate } from "./utils/getTodayDate";
import { getReviewBatch } from "./utils/getReviewBatch";

function App() {
  const [, setRefreshKey] = useState(0);
  const today = getTodayDate();
  const lastNewProblemDate = localStorage.getItem("lastNewProblemDate");
  const canDoNewProblem = lastNewProblemDate !== today;
  const savedBatch = getReviewBatch();

  const unfinishedBatch = savedBatch.filter((id) =>
    isProblemDue(id)
  );
  const batchProblems = problems.filter((problem) =>
    unfinishedBatch.includes(problem.id)
  );
  let reviewProblems;

  if (savedBatch.length > 0 && batchProblems.length > 0) {
    reviewProblems = batchProblems;
  } else {
    reviewProblems = problems
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

    const batchIds = reviewProblems.map((problem) => problem.id);

    localStorage.setItem(
      "reviewBatch",
      JSON.stringify(batchIds)
    );
  }


  const newProblems = canDoNewProblem
    ? problems
      .filter((problem) => isNewProblem(problem.id))
      .slice(0, 1)
    : [];

  const todaysProblems = [...reviewProblems, ...newProblems];
  return (
    <div>
      <h1>LeetCode Revision</h1>

      {todaysProblems.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} isNew={isNewProblem(problem.id)} onComplete={() => setRefreshKey((old) => old + 1)} />
      ))}
    </div>
  );
}

export default App;