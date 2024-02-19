const db = require("../db/connection");
const fs = require("fs").promises;

function getAllTopics() {
  const query = `SELECT * FROM topics;`;
  return db.query(query).then((result) => {
    return result.rows;
  });
}
function getAllEndpoints() {
  return fs.readFile(`/home/basil/northcoders/backend/be-nc-news/endpoints.json`,"utf-8").then((data)=>{
    return JSON.parse(data)
  })
}

module.exports = { getAllTopics, getAllEndpoints };
