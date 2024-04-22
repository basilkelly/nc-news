const express = require("express");
const apiRouter = require("./routes/api.router.js");
const articlesRouter = require("./routes/articles.router.js");
const topicsRouter = require("./routes/topics.router.js");
const usersRouter = require("./routes/users.router.js");
const commentsRouter = require("./routes/comments.router.js");

const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

app.use(apiRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/topics", topicsRouter);
app.use("/api/users", usersRouter);
app.use("/api/comments", commentsRouter);

app.use((error, request, response, next) => {
  if (error.code === "22P02") {
    return response.status(400).send({ msg: "Bad request" });
  }
  if (error.code === "23502") {
    return response.status(400).send({ msg: "Bad request" });
  }
  if (error.code === "23503") {
    return response.status(400).send({ msg: "Bad request" });
  } else next(error);
});

app.use((error, request, response, next) => {
  if (error.status && error.msg) {
    return response.status(error.status).send({ msg: error.msg });
  } else next(error);
});

app.use((error, request, response, next) => {
  return response.status(500).send({ msg: "internal server error" });
});
module.exports = app;
