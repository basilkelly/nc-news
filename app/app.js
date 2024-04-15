const express = require("express");
const {
  getTopics,
  getApi,
  getArticle,
  getArticles,
  getArticleComments,
  postComment,
  patchArticle,
  deleteComment,
  getUsers,
} = require("../controllers/controller");

const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());


app.get("/api/topics", getTopics);
app.get("/api", getApi);
app.get("/api/articles/:article_id", getArticle);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getArticleComments);
app.post("/api/articles/:article_id/comments", postComment);
app.patch("/api/articles/:article_id", patchArticle);
app.delete("/api/comments/:comment_id", deleteComment);
app.get("/api/users", getUsers);

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
