import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.json({
  message: "LeetCode Revision API",
});
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});