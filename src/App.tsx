import { problems } from "./data/problems";
import ProblemCard from "./components/ProblemCard";

function App() {
  return (
    <div>
      <h1>LeetCode Revision</h1>

      {problems.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} />
      ))}
    </div>
  );
}

export default App;