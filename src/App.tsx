import { problems } from "./data/problems";
import ProblemCard from "./components/ProblemCard";
import { isProblemDue } from "./utils/isProblemDue";
import { isNewProblem } from "./utils/isNewProblem";
import { useState } from "react";
import { getTodayDate } from "./utils/getTodayDate";
import { getDailyBatch } from "./utils/getDailyBatch";
function App() {
  const [, setRefreshKey] = useState(0);
  const today = getTodayDate();
  const batchDate = localStorage.getItem("dailyBatchDate");
  const savedDailyBatch = getDailyBatch();
  const isNewDay = batchDate !== today;

  const hasNewProblems = problems.some((problem) =>
    isNewProblem(problem.id)
  );
  const dueReviewProblems = problems.filter(
    (problem) =>
      !isNewProblem(problem.id) &&
      isProblemDue(problem.id)
  );
  const reviewLimit = hasNewProblems ? 4 : 5;
  const reviewProblems = dueReviewProblems.slice(0, reviewLimit);
  const newProblemLimit = 5 - reviewProblems.length;


  const newProblems = problems
    .filter((problem) => isNewProblem(problem.id))
    .slice(0, newProblemLimit);

  const newBatch = [...newProblems, ...reviewProblems];
  if (isNewDay) {
    localStorage.setItem(
      "dailyBatch",
      JSON.stringify(newBatch.map((problem) => problem.id))
    );

    localStorage.setItem("dailyBatchDate", today);
  }
  const dailyBatchIds = isNewDay
    ? newBatch.map((problem) => problem.id)
    : savedDailyBatch;
  const todaysProblems = dailyBatchIds
  .map((id) => problems.find((problem) => problem.id === id))
  .filter((problem) => problem !== undefined);
  return (
    <div>
      <h1>LeetCode Revision</h1>

      {todaysProblems.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} onComplete={() => {
  const updatedBatch = dailyBatchIds.filter(
    (id) => id !== problem.id
  );

  localStorage.setItem(
    "dailyBatch",
    JSON.stringify(updatedBatch)
  );

  setRefreshKey((old) => old + 1);
}} />
      ))}
    </div>
  );
}

export default App;