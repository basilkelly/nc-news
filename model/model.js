const db = require("../db/connection");
const { forEach } = require("../db/data/test-data/articles");
const fs = require("fs").promises;

function getAllTopics() {
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

function SelectArticleComments(articleId){
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

module.exports = {
  getAllTopics,
  getAllEndpoints,
  selectArticleById,
  selectAllArticles,
  SelectArticleComments,
};
