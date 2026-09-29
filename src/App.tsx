import { problems } from "./data/problems.ts";
import ProblemCard from "./components/ProblemCard";
import { useEffect, useState } from "react";
import "./App.css";
function App() {
  const [dailyBatchIds, setDailyBatchIds] = useState<number[]>([]);
  const [attemptedProblemIds, setAttemptedProblemIds] =
    useState<number[]>([]);
  useEffect(() => {
    fetch("http://localhost:3000/api/daily-batch", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setDailyBatchIds(data);
      });
    fetch("http://localhost:3000/api/progress", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setAttemptedProblemIds(
          data.map((progress: { problem_id: number }) => progress.problem_id)
        );
      });
  }, []);
  const isNewProblem = (problemId: number) => {
    return !attemptedProblemIds.includes(problemId);
  };

  const login = async () => {
    const response = await fetch(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: "nithin@example.com",
          password: "hello123",
        }),
      }
    );

    const data = await response.json();
    console.log("Login:", data);
  };




  const todaysProblems = dailyBatchIds
    .map((id) => problems.find((problem) => problem.id === id))
    .filter((problem) => problem !== undefined);
  const unseenProblems = problems.filter((problem) =>
    isNewProblem(problem.id)
  ).length;
  const attemptedProblems = problems.length - unseenProblems;

  return (
    <div className="app">
      <button onClick={login}>
        Test Login
      </button>
      <h1>LeetCode Revision</h1>
      <p className="daily-progress">
        Remaining: {todaysProblems.length}
      </p>
      <p className="overall-progress">
        Top 150: {attemptedProblems} attempted · {unseenProblems} unseen
      </p>
      {todaysProblems.length === 0 && (
        <p>🎉 You're done for today!</p>
      )}
      {todaysProblems.map((problem) => (
        <ProblemCard
          key={problem.id}
          problem={problem}
          isNew={isNewProblem(problem.id)}
          onComplete={() => {
            setDailyBatchIds((current) =>
              current.filter((id) => id !== problem.id)
            );
            setAttemptedProblemIds((current) => [
              ...current,
              problem.id,
            ]);
          }} />
      ))}
    </div>
  );
}

export default App;