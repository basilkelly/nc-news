const {
  selectAllTopics,
  getAllEndpoints,
  selectArticleById,
  selectAllArticles,
  SelectArticleComments,
  addArticleComment,
  updateArticle,
  removeComment,
  checkComment,
  SelectAllComments,
  selectAllUsers,
} = require("../model/model");
module.exports = {
  getTopics,
  getApi,
  getArticle,
  getArticles,
  getArticleComments,
  postComment,
  patchArticle,
  deleteComment,
  getComments,
  getUsers,
};

function getTopics(request, response) {
  selectAllTopics().then((topics) => {
    response.status(200).send({ topics });
  });
}

function getApi(request, response) {
  getAllEndpoints().then((result) => {
    response.status(200).send(result);
  });
}

function getArticle(request, response, next) {
  const articleId = request.params.article_id;
  selectArticleById(articleId)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch(next);
}
function getArticles(request, response, next) {
  const { topic } = request.query;
  selectAllArticles(topic)
    .then((result) => {
      response.status(200).send(result);
    })
    .catch(next);
}
function getArticleComments(request, response, next) {
  const articleId = request.params.article_id;
  SelectArticleComments(articleId)
    .then((commentsArray) => {
      response.status(200).send(commentsArray);
    })
    .catch(next);
}

function postComment(request, response, next) {
  const articleId = request.params.article_id;
  const comment = request.body;

  return addArticleComment(articleId, comment)
    .then((result) => {
      response.status(201).send(result);
    })
    .catch(next);
}
function patchArticle(request, response, next) {
  const articleId = request.params.article_id;
  const updateRequest = request.body;

  return updateArticle(articleId, updateRequest)
    .then((result) => {
      response.status(200).send(result);
    })
    .catch(next);
}

function deleteComment(request, response, next) {
  const commentId = request.params.comment_id;

  Promise.all([checkComment(commentId), removeComment(commentId)])
    .then(() => {
      response.status(204).send({ msg: "No content" });
    })
    .catch(next);
}

function getComments(request, response, next) {
  SelectAllComments()
    .then((comments) => {
      response.status(200).send({ comments });
    })
    .catch(next);
}
function getUsers(request, response, next) {
  selectAllUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch(next);
}
