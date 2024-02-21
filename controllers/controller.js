const {
  SelectAllTopics,
  getAllEndpoints,
  selectArticleById,
  selectAllArticles,
  SelectArticleComments,
  addArticleComment,
} = require("../model/model");
module.exports = {
  getTopics,
  getApi,
  getArticle,
  getArticles,
  getArticleComments,
  postComment,
};

function getTopics(request, response) {
  SelectAllTopics().then((topics) => {
    response.status(200).send({ topics });
  });
}

function getApi(request, response) {
  getAllEndpoints().then((result) => {
    response.status(200).send(result);
  });
}

function getArticle(request, response, next) {
  const ArticleId = request.params.article_id;
  selectArticleById(ArticleId)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch(next);
}
function getArticles(request, response, next) {
  selectAllArticles()
    .then((result) => {
      response.status(200).send(result);
    })
    .catch(next);
}
function getArticleComments(request, response, next) {
  const ArticleId = request.params.article_id;
  SelectArticleComments(ArticleId)
    .then((commentsArray) => {
      response.status(200).send(commentsArray);
    })
    .catch(next);
}

function postComment(request, response, next) {
  const ArticleId = request.params.article_id;
  const comment = request.body;

  return addArticleComment(ArticleId, comment)
    .then((result) => {
      response.status(201).send(result);
    })
    .catch(next);
}
