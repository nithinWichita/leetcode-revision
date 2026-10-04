import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import "dotenv/config";

import { problems } from "./data/problems.ts";
import {
  authenticate,
  type AuthenticatedRequest,
} from "./middleware/auth.ts";
import {
  calculateNextInterval,
  type ReviewResult,
} from "./services/review.ts";
import { createDailyBatch } from "./services/dailyBatch.ts";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const PORT = 3000;
const { Pool } = pg;

const pool = new Pool({
  database: process.env.DATABASE_NAME,
});





app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [normalizedEmail]
  );

  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    id: user.id,
    email: user.email,
  });
});
app.get(
  "/api/problems",
  authenticate,
  (req: AuthenticatedRequest, res) => {
    res.json(problems);
  }
);
app.get(
  "/api/me",
  authenticate,
  (req: AuthenticatedRequest, res) => {
    res.json({
      userId: req.userId,
    });
  }
);
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out" });
});
app.post(
  "/api/progress",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    const { problemId, result } = req.body as {
      problemId: number;
      result: ReviewResult;
    };

    const validResults: ReviewResult[] = [
      "forgot",
      "help",
      "solved",
      "easy",
    ];

    if (
      !Number.isInteger(problemId) ||
      !validResults.includes(result)
    ) {
      return res.status(400).json({
        message: "Invalid progress data",
      });
    }

    const existing = await pool.query(
      `SELECT interval_days
       FROM problem_progress
       WHERE user_id = $1
         AND problem_id = $2`,
      [req.userId, problemId]
    );

    const currentInterval =
      existing.rows[0]?.interval_days ?? 0;

    const intervalDays = calculateNextInterval(
      currentInterval,
      result
    );

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const progressResult = await client.query(
        `INSERT INTO problem_progress
          (
            user_id,
            problem_id,
            last_attempted,
            next_review,
            interval_days
          )
         VALUES
          (
            $1,
            $2,
            CURRENT_DATE,
            CURRENT_DATE + $3::integer,
            $3
          )

         ON CONFLICT (user_id, problem_id)

         DO UPDATE SET
           last_attempted = EXCLUDED.last_attempted,
           next_review = EXCLUDED.next_review,
           interval_days = EXCLUDED.interval_days

         RETURNING *`,
        [req.userId, problemId, intervalDays]
      );

      await client.query(
        `UPDATE daily_batch_items
   SET completed = TRUE
   WHERE user_id = $1
     AND problem_id = $2
     AND batch_date = CURRENT_DATE`,
        [req.userId, problemId]
      );

      await client.query("COMMIT");

      return res.json(progressResult.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
);

app.get(
  "/api/progress",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    const result = await pool.query(
      `SELECT *
       FROM problem_progress
       WHERE user_id = $1
       ORDER BY problem_id`,
      [req.userId]
    );

    res.json(result.rows);
  }
);
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();
  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });
  }
  if (!normalizedEmail || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  // registration logic goes here
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email`,
      [normalizedEmail, passwordHash]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }
    console.error(error);

    return res.status(500).json({
      message: "Could not create account",
    });
  }
});
app.get(
  "/api/daily-batch",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    const existingBatch = await pool.query(
      `SELECT problem_id, position,completed
       FROM daily_batch_items
       WHERE user_id = $1
         AND batch_date = CURRENT_DATE
       ORDER BY position`,
      [req.userId]
    );

    if (existingBatch.rows.length > 0) {
      const problemIds = existingBatch.rows
        .filter((row) => !row.completed)
        .map((row) => row.problem_id);

      return res.json(problemIds);
    }

    const dueResult = await pool.query(
      `SELECT problem_id
       FROM problem_progress
       WHERE user_id = $1
         AND next_review <= CURRENT_DATE
       ORDER BY next_review ASC`,
      [req.userId]
    );

    const dueReviews = dueResult.rows.map(
      (row) => row.problem_id
    );

    const attemptedResult = await pool.query(
      `SELECT problem_id
       FROM problem_progress
       WHERE user_id = $1`,
      [req.userId]
    );

    const attemptedIds = new Set(
      attemptedResult.rows.map(
        (row) => row.problem_id
      )
    );

    const allProblemIds = problems.map(
      (problem) => problem.id
    );

    const newProblems = allProblemIds.filter(
      (id) => !attemptedIds.has(id)
    );

    const batch = createDailyBatch(
      dueReviews,
      newProblems
    );

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (
        let index = 0;
        index < batch.length;
        index++
      ) {
        const problemId = batch[index];

        await client.query(
          `INSERT INTO daily_batch_items
            (
              user_id,
              batch_date,
              problem_id,
              position
            )
           VALUES
            ($1, CURRENT_DATE, $2, $3)`,
          [req.userId, problemId, index + 1]
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    return res.json(batch);
  }
);
app.use(
  (
    error: unknown,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    void _next;
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});