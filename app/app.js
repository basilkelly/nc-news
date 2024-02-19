const express = require("express")
const { getTopics } = require("../controllers/controller")
const app = express()
app.use(express.json())


app.get("/api/topics", getTopics)

app.use((error, request, response, next) => {
    if (error.status && error.msg) {
      response.status(error.status).send({ msg: error.msg });
    }
     else {
      response.status(500).send({ msg: "internal server error" });
    }
  });


module.exports = app