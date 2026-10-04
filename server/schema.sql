CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS problem_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id INTEGER NOT NULL,
  last_attempted DATE,
  next_review DATE,
  interval_days INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, problem_id)
);
CREATE TABLE IF NOT EXISTS daily_batch_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  batch_date DATE NOT NULL,
  problem_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (user_id, batch_date, problem_id)
);