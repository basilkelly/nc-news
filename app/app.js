const express = require("express");
const { getTopics, getApi, getArticle, getArticles } = require("../controllers/controller");
const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);
app.get("/api", getApi);
app.get("/api/articles/:article_id", getArticle)


app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    return res.status(400).send({ msg: "Bad request" });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    return res.status(404).send({ msg: "not found" });
  } else next(err);
});

app.use((error, request, response, next) => {
    return response.status(500).send({ msg: "internal server error" });
  
});



module.exports = app;
