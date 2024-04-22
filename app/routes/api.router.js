const { getApi } = require("../../controllers/controller");

const apiRouter = require("express").Router();

apiRouter.get("/api", getApi);

module.exports = apiRouter;
