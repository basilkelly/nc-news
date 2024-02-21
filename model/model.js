const db = require("../db/connection");
const { forEach } = require("../db/data/test-data/articles");
const fs = require("fs").promises;

function SelectAllTopics() {
  const query = `SELECT * FROM topics;`;
  return db.query(query).then((result) => {
    return result.rows;
  });
}
function getAllEndpoints() {
  return fs
    .readFile(
      `/home/basil/northcoders/backend/be-nc-news/endpoints.json`,
      "utf-8"
    )
    .then((data) => {
      return JSON.parse(data);
    });
}

function selectArticleById(articleId) {
  const query = `
    SELECT *
    FROM articles
    WHERE article_id = $1
    ;`;

  return db
    .query(query, [articleId])

    .then((data) => {
      if (data.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      return data.rows[0];
    });
}
function selectAllArticles() {
  return db
    .query(
      `SELECT COUNT(comments.article_id) AS comment_count,
  articles.article_id, 
  articles.title, 
  articles.topic, 
  articles.author, 
  articles.created_at, 
  articles.votes, 
  articles.article_img_url
  FROM articles
  JOIN comments ON articles.article_id = comments.article_id 
  GROUP BY articles.article_id 
  ORDER BY articles.created_at DESC;`
    )

    .then((result) => {
      return result.rows;
    });
}

function SelectArticleComments(articleId) {
  return db
    .query(
      `SELECT *
FROM comments
WHERE comments.article_id = $1 ORDER BY created_at DESC`,
      [articleId]
    )

    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      return result.rows;
    });
}
function addArticleComment(articleId, comment) {
  const newCommentArray = [
    comment.body,
    0,
    comment.username,
    articleId,
    comment.created_at,
  ];
  const query = `INSERT INTO comments (body,
votes,
author,
article_id,
created_at) 
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
  `;
  return db.query(query, newCommentArray).then((result) => {
    return result.rows[0];
  });
}

function updateArticle(articleId, updateRequest) {
  const voteIncrementNum = Number((Object.values(updateRequest)))
  const select = `
  SELECT *
  FROM articles
  WHERE article_id = $1
  ;`;

  const query = `UPDATE articles SET votes = votes + $1 WHERE article_id = $2;`;

  return db
    .query(query, [voteIncrementNum, articleId])
    .then(() => {
      return db.query(select, [articleId]);
    })
    .then((response) => {
      if (response.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      return response.rows[0];
    }) 
}

module.exports = {
  SelectAllTopics,
  getAllEndpoints,
  selectArticleById,
  selectAllArticles,
  SelectArticleComments,
  addArticleComment,
  updateArticle,
};
