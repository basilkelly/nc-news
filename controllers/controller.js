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
  addArticle,
  addTopic,
  checkArticle,
  removeArticle,
  removeArticleComments,
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
  postArticle,
  postTopic,
  deleteArticle,
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
  const { limit } = request.query;
  const { p } = request.query;
  Promise.all([
    checkSortBy(sort_by),
    checkTopic(topic),
    selectAllArticles(topic, query[0], sort_by, order, limit, p),
  ])
    .then((result) => {
      result.reverse();
      if (limit || p) {
        response.status(200).send(result[0]);
      } else {
        response.status(200).send(result[0][0].articles);
      }
    })
    .catch(next);
}
function getArticleComments(request, response, next) {
  const articleId = request.params.article_id;
  const { limit } = request.query;
  const { p } = request.query;
  SelectArticleComments(articleId, limit, p)
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

function postArticle(request, response, next) {
  const article = request.body;
  return addArticle(article)
    .then((result) => {
      response.status(201).send(result);
    })
    .catch(next);
}

function postTopic(request, response, next) {
  const topic = request.body;
  return addTopic(topic)
    .then((result) => {
      response.status(201).send(result);
    })
    .catch(next);
}

function deleteArticle(request, response, next) {
  const articleId = request.params.article_id;
  Promise.all([
    checkArticle(articleId),
    removeArticle(articleId),
    removeArticleComments(articleId),
  ])
    .then(() => {
      response.status(204).send({ msg: "No content" });
    })
    .catch(next);
}
