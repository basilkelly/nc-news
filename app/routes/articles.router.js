const {
  getArticle,
  getArticles,
  getArticleComments,
  postComment,
  patchArticle,
} = require("../../controllers/controller");

const articlesRouter = require("express").Router();

articlesRouter.get("/:article_id", getArticle);
articlesRouter.get("/", getArticles);
articlesRouter.get("/:article_id/comments", getArticleComments);
articlesRouter.post("/:article_id/comments", postComment);
articlesRouter.patch("/:article_id", patchArticle);

module.exports = articlesRouter;
