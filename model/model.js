const db = require("../db/connection");
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

module.exports = { getAllTopics, getAllEndpoints, selectArticleById };
