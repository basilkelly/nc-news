const { dirname } = require("path");
const db = require("../db/connection");
const { forEach } = require("../db/data/test-data/articles");
const topics = require("../db/data/test-data/topics");
const fs = require("fs").promises;



function selectAllTopics() {
  const query = `SELECT * FROM topics;`;
  return db.query(query).then((result) => {
    return result.rows;
  });
}
function getAllEndpoints() {
  const moduleDir = `${__dirname}`
  const rootDir = moduleDir.slice(0, -6); 
  return fs
    .readFile(
      `${rootDir}/endpoints.json`,
      "utf-8"
    )
    .then((data) => {
      return JSON.parse(data);
    })
}

function selectArticleById(articleId) {
  const query = `
    SELECT CAST(COUNT(comments.article_id)AS INT) AS comment_count,
    articles.article_id, 
    articles.title, 
    articles.topic, 
    articles.author,
    articles.body,
    articles.created_at, 
    articles.votes, 
    articles.article_img_url
    FROM articles
    JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id `;

  return db
    .query(query, [articleId])

    .then((data) => {
      if (data.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      return data.rows[0];
    });
}
function checkTopic(topic) {
  const topicName = topic;
  if (topicName != undefined) {
    const query = `SELECT * FROM topics WHERE slug = $1`;
    return db.query(query, [topicName]).then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      return result.rows;
    });
  }
  return true;
}
function selectAllArticles(topic) {
  let queryString = `SELECT COUNT(comments.article_id) AS comment_count,
  articles.article_id, 
  articles.title, 
  articles.topic, 
  articles.author, 
  articles.created_at, 
  articles.votes, 
  articles.article_img_url
  FROM articles
  JOIN comments ON articles.article_id = comments.article_id `;

  let queryValues = [];
  if (topic) {
    queryString += ` WHERE articles.topic = $1`;
    queryValues.push(topic);
  }

  queryString += ` 
GROUP BY articles.article_id 
ORDER BY articles.created_at DESC`;

  return db.query(queryString, queryValues).then((result) => {
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
  const voteIncrementNum = Number(Object.values(updateRequest));
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
    });
}
function checkComment(commentId) {
  const comment = commentId;
  const query = `SELECT * FROM comments WHERE comment_id = $1`;
  return db.query(query, [comment]).then((result) => {
    if (result.rowCount === 0) {
      return Promise.reject({ status: 404, msg: "not found" });
    }
    return result.rows;
  });
}
function removeComment(commentId) {
  const validCommentNum = commentId;
  const query = `DELETE FROM comments WHERE comment_id = $1`;
  return db.query(query, [validCommentNum]);
}
function selectAllUsers() {
  const query = `SELECT * FROM users;`;
  return db.query(query).then((result) => {
    return result.rows;
  });
}

module.exports = {
  selectAllTopics,
  getAllEndpoints,
  selectArticleById,
  selectAllArticles,
  SelectArticleComments,
  addArticleComment,
  updateArticle,
  removeComment,
  selectAllUsers,
  checkComment,
  checkTopic,
};
