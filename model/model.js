const db = require("../db/connection")

function getAllTopics() {
const query = `SELECT * FROM topics;`
return db.query(query).then((result) => {
    return result.rows
})
}

module.exports = {getAllTopics}