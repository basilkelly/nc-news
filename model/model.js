const db = require("../db/connection");
const fs = require("fs").promises;

function selectAllTopics() {
  const query = `SELECT * FROM topics;`;
  return db.query(query).then((result) => {
    return result.rows;
  });
}
function getAllEndpoints() {
  const moduleDir = `${__dirname}`;
  const rootDir = moduleDir.slice(0, -6);
  return fs.readFile(`${rootDir}/endpoints.json`, "utf-8").then((data) => {
    return JSON.parse(data);
  });
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
function checkSortBy(sortByQuery) {
  const sortByColumn = sortByQuery;
  if (sortByColumn != undefined && sortByColumn != "comment_count") {
    const query = `SELECT * 
    FROM information_schema.columns 
    WHERE table_name='articles' and column_name=$1;`;
    return db.query(query, [sortByColumn]).then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      return result.rows;
    });
  }
  return true;
}
function selectAllArticles(topic, queryType, sortquery, orderQuery) {
  let order = "DESC";
  if (
    orderQuery !== undefined &&
    orderQuery !== "asc" &&
    orderQuery !== "desc"
  ) {
    return Promise.reject({ status: 404, msg: "not found" });
  }
  if (orderQuery === "asc") {
    order = "ASC";
  }
  const allowedSortQueries = [
    "comment_count",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
  ];
  let queryString = `SELECT COUNT(comments.article_id) AS comment_count,
  articles.article_id, 
  articles.title, 
  articles.topic, 
  articles.author, 
  articles.created_at, 
  articles.votes, 
  articles.article_img_url
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id `;

  let queryValues = [];
  if (topic && queryType === "topic") {
    queryString += ` WHERE articles.topic = $1`;
    queryValues.push(topic);
  }
  queryString += ` 
GROUP BY articles.article_id`;

  let sort = "created_at";
  if (queryType === "sort_by" && allowedSortQueries.includes(sortquery)) {
    if (sortquery != "comment_count") {
      sort = sortquery;
      queryString += ` ORDER BY articles.${sort} ${order}`;
    }
    if (sortquery === "comment_count") {
      sort = sortquery;
      queryString += ` ORDER BY ${sort} ${order}`;
    }
  } else {
    queryString += ` ORDER BY created_at ${order}`;
  }
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

function selectUserByUsername(username) {
  const user = username;
  const query = `SELECT * FROM users WHERE username = $1`;
  return db.query(query, [user]).then((result) => {
    if (result.rowCount === 0) {
      return Promise.reject({ status: 404, msg: "not found" });
    }
    return result.rows[0];
  });
}

function updateComment(commentId, updateRequest) {
  const voteIncrementNum = Number(Object.values(updateRequest));

  const select = `
  SELECT *
  FROM comments
  WHERE comment_id = $1
  ;`;
  const query = `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2;`;

  return db
    .query(query, [voteIncrementNum, commentId])
    .then(() => {
      return db.query(select, [commentId]);
    })
    .then((response) => {
      if (response.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      return response.rows[0];
    });
}

function addArticle(article) {
  const articleImgUrl = article.article_img_url;

  if (articleImgUrl === undefined) {
    article.article_img_url = "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700"
  }

  const newArticleArray = [
    article.title,
    article.topic,
    article.author,
    article.body,
    article.created_at,
    0,
    article.article_img_url,
  ];
  const query = `INSERT INTO articles (title, topic, author, body,
    created_at, votes, article_img_url
) 
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *;
  `;
  return db
    .query(query, newArticleArray)
    .then((result) => {
      const currentArticle = result.rows[0].article_id;
      const newquery = `
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
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id `;
      return db.query(newquery, [currentArticle]).then((result) => {
        return result.rows[0];
      });
    })
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
  checkSortBy,
  selectUserByUsername,
  updateComment,
  addArticle,
};
