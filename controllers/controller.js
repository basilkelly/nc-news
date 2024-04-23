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
  selectAllUsers,
  checkTopic,
  checkSortBy,
  selectUserByUsername,
  updateComment,
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
  getUsers,
  getUserByUsername,
  patchComment,
};

function getTopics(request, response, next) {
  selectAllTopics()
    .then((topics) => {
      response.status(200).send({ topics });
    })
    .catch(next);
}

function getApi(request, response, next) {
  getAllEndpoints()
    .then((api) => {
      response.status(200).send({ api });
    })
    .catch(next);
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
  const query = Object.keys(request.query);
  const { topic } = request.query;
  const { sort_by } = request.query;
  const { order } = request.query;

  Promise.all([
    checkSortBy(sort_by),
    checkTopic(topic),
    selectAllArticles(topic, query[0], sort_by, order),
  ])
    .then((result) => {
      result.reverse();
      response.status(200).send(result[0]);
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

function getUsers(request, response, next) {
  selectAllUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch(next);
}

function getUserByUsername(request, response, next) {
  const username = request.params.username;
  selectUserByUsername(username)
    .then((user) => {
      response.status(200).send(user);
    })
    .catch(next);
}

function patchComment(request, response, next) {
  const commentId = request.params.comment_id;
  const updateRequest = request.body;
  return updateComment(commentId, updateRequest)
    .then((result) => {
      response.status(200).send(result);
    })
    .catch(next);
}
