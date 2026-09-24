import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import "dotenv/config";
import {
  authenticate,
  type AuthenticatedRequest,
} from "./middleware/auth.ts";
import {
  calculateNextInterval,
  type ReviewResult,
} from "./services/review.ts";
const app = express();
app.use(express.json());
app.use(cookieParser());
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}
const PORT = 3000;
const { Pool } = pg;

const pool = new Pool({
  database: "leetcode_revision",
});
app.get("/users", async (req, res) => {
  const result = await pool.query("SELECT * FROM users");
  res.json(result.rows);
});
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash)
   VALUES ($1, $2)
   RETURNING id, email, created_at`,
    [email, passwordHash]
  );

  res.status(201).json(result.rows[0]);
});
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
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
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    id: user.id,
    email: user.email,
  });
});
app.get("/api/me", authenticate, (req: AuthenticatedRequest, res) => {
  res.json({
    userId: req.userId,
  });
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

    const progressResult = await pool.query(
      `INSERT INTO problem_progress
    (user_id, problem_id, last_attempted, next_review, interval_days)
   VALUES
    ($1, $2, CURRENT_DATE, CURRENT_DATE + $3::integer, $3)

   ON CONFLICT (user_id, problem_id)

   DO UPDATE SET
     last_attempted = EXCLUDED.last_attempted,
     next_review = EXCLUDED.next_review,
     interval_days = EXCLUDED.interval_days

   RETURNING *`,
      [req.userId, problemId, intervalDays]
    );

    res.json(progressResult.rows[0]);
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});