const {
  getAllTopics,
  getAllEndpoints,
  selectArticleById,
} = require("../model/model");
module.exports = { getTopics, getApi, getArticle };

function getTopics(request, response) {
  getAllTopics().then((topics) => {
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
