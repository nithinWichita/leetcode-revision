# LeetCode Revision

A full-stack spaced-repetition app for practicing the LeetCode Top Interview 150.

Instead of randomly revisiting problems, the app creates a daily batch based on previous attempts and review dates. Before opening a problem, the user must identify the underlying problem-solving pattern.

## Features

- Daily batch of up to 5 LeetCode problems
- Spaced-repetition scheduling based on previous performance
- Pattern identification before opening a problem
- Review ratings: Forgot, Help, Solved, and Easy
- User registration, login, and logout
- JWT authentication using HTTP-only cookies
- Per-user progress stored in PostgreSQL
- Daily batches persist across page refreshes
- Completed problems are removed from the current day's batch
- Progress tracking across the LeetCode Top Interview 150

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- Node.js
- Express
- TypeScript
- JWT authentication
- bcrypt

### Database

- PostgreSQL

## Daily Review Logic

The app generates a daily batch of up to 5 problems.

- Due review problems are prioritized.
- If unseen problems remain, up to 4 review problems are selected so that at least 1 new problem can be introduced.
- If fewer than 4 reviews are due, new problems fill the remaining slots.
- If no reviews are due, the batch can contain up to 5 new problems.
- If all problems have been attempted, the batch can contain up to 5 review problems.
- New problems are displayed before review problems.
- Completing a problem removes it from the current day's batch without replacing it.
- Unfinished problems remain available according to their progress and review state.

## Architecture

React / Vite
localhost:5173
      |
      | HTTP / JSON
      v
Node.js / Express
localhost:3000
      |
      | SQL
      v
PostgreSQL
localhost:5432

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- PostgreSQL

### 1. Clone the repository

```bash
git clone <repository-url>
cd leetcode-revision
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```
### 4. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000
```

Then create `server/.env`:

```env
JWT_SECRET=your_jwt_secret
DATABASE_NAME=leetcode_revision
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

You can use the included `.env.example` files as templates.

### 5. Create the PostgreSQL database

Create a database named:

```text
leetcode_revision
```

Then, from the `server` directory, initialize the tables:

```bash
npm run db:setup
```

This creates the tables used for users, problem progress, and daily batches.

### 6. Start the backend

From the `server` directory:

```bash
npm run dev
```

The Express API runs on:

```text
http://localhost:3000
```

### 7. Start the frontend

In a separate terminal, from the project root:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Project Structure

```text
leetcode-revision/
├── src/                  # React frontend
│   ├── components/
│   ├── data/
│   └── types/
├── server/
│   ├── src/
│   │   ├── data/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── types/
│   ├── schema.sql        # PostgreSQL schema
│   └── .env.example
├── .env.example
└── README.md
```

## Review Scheduling

Each completed problem is assigned a future review date based on the selected result:

| Result | First Attempt | Later Reviews |
| --- | --- | --- |
| Forgot | 1 day | Reset to 1 day |
| Help | 3 days | Half the current interval |
| Solved | 7 days | Double the current interval |
| Easy | 14 days | Triple the current interval |

Review intervals are capped at 60 days where applicable.

## Development Checks

Run frontend linting:

```bash
npm run lint
```

Build the frontend for production:

```bash
npm run build
```

Check backend TypeScript:

```bash
cd server
npx tsc --noEmit
```

## Motivation

LeetCode Revision was built to make interview preparation more systematic. The goal is not only to solve problems, but to recognize recurring algorithmic patterns and revisit problems at useful intervals instead of relying on random repetition.

The project also serves as a full-stack application demonstrating React, TypeScript, Express, PostgreSQL, authentication, REST APIs, and persistent user-specific state.

