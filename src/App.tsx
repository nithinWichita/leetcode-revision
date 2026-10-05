import ProblemCard from "./components/ProblemCard";
import { useEffect, useState } from "react";
import type { Problem } from "./types/Problem";
import "./App.css";
const API_URL = import.meta.env.VITE_API_URL;
function App() {
  const [authError, setAuthError] = useState("");
  const [authAction, setAuthAction] =
    useState<"login" | "register" | null>(null); 
  const [dailyBatchIds, setDailyBatchIds] = useState<number[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean | null>(null);
  const logout = async () => {
    const response = await fetch(
      `${API_URL}/api/auth/logout`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (response.ok) {
      setIsAuthenticated(false);
      setDailyBatchIds([]);
      setAttemptedProblemIds([]);
      setProblems([]);
      setIsLoadingData(true);

    }
  };
  const [attemptedProblemIds, setAttemptedProblemIds] =
    useState<number[]>([]);
  useEffect(() => {
    fetch(`${API_URL}/api/me`, {
      credentials: "include",
    }).then((response) => {
      setIsAuthenticated(response.ok);
    });
  }, []);
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }



    const loadData = async () => {
      await Promise.all([
        fetch(`${API_URL}/api/daily-batch`, {
          credentials: "include",
        })
          .then((response) => {
            if (!response.ok) {
              return [];
            }

            return response.json();
          })
          .then((data) => {
            setDailyBatchIds(data);
          }), fetch(`${API_URL}/api/progress`, {
            credentials: "include",
          })
            .then((response) => {
              if (!response.ok) {
                return [];
              }

              return response.json();
            })
            .then((data) => {
              setAttemptedProblemIds(
                data.map((progress: { problem_id: number }) => progress.problem_id)
              );
            }),
        fetch(`${API_URL}/api/problems`, {
          credentials: "include",
        })
          .then((response) => {
            if (!response.ok) {
              return [];
            }

            return response.json();
          })
          .then((data) => {
            setProblems(data);
          }),


      ]);
      setIsLoadingData(false);
    };
    loadData();
  }, [isAuthenticated]);
  const isNewProblem = (problemId: number) => {
    return !attemptedProblemIds.includes(problemId);
  };

  const login = async () => {
    setAuthAction("login");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAuthError("");
        setIsAuthenticated(true);
      } else {
        setAuthError(data.message);
      }
    } catch {
      setAuthError("Could not connect to the server.");
    } finally {
      setAuthAction(null);
    }
  };
  const register = async () => {
    setAuthAction("register");  
    const response = await fetch(
      `${API_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      setAuthError("");
      await login();
    } else {
      setAuthError(data.message);
    }
    setAuthAction(null);
  };



  const todaysProblems = dailyBatchIds
    .map((id) => problems.find((problem) => problem.id === id))
    .filter((problem) => problem !== undefined);
  const unseenProblems = problems.filter((problem) =>
    isNewProblem(problem.id)
  ).length;
  const attemptedProblems = problems.length - unseenProblems;
  if (isAuthenticated === null) {
    return <p>Loading...</p>;
  }
  if (!isAuthenticated) {
    return (
      <div className="app">
        <h1>LeetCode Revision</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login} disabled={authAction === "login"}>
          {authAction === "login" ? "Logging in..." : "Login"}
        </button>
        <button onClick={register} disabled={authAction === "register"}>
          {authAction === "register" ? "Registering..." : "Register"}
        </button>
        {authError && (
          <p className="auth-error">{authError}</p>
        )}
      </div>
    );
  }
  if (isLoadingData) {
    return <p>Loading problems...</p>;
  }

  return (
    <div className="app">
      <h1>LeetCode Revision</h1><button onClick={logout}>Logout</button>
      <p className="daily-progress">Remaining: {todaysProblems.length}</p>
      <p className="overall-progress">
        Top 150: {attemptedProblems} attempted · {unseenProblems} unseen
      </p>
      {todaysProblems.length === 0 && <p>🎉 You're done for today!</p>}
      {todaysProblems.map((problem) => (
        <ProblemCard
          key={problem.id}
          problem={problem}
          isNew={isNewProblem(problem.id)}
          onComplete={() => {
            setDailyBatchIds((current) =>
              current.filter((id) => id !== problem.id)
            );
            setAttemptedProblemIds((current) => [...current, problem.id]);
          }}
        />
      ))}
    </div>
  );
}

export default App;