//Basic Express Middleware configuration

const express = require("express");
const cors = require("cors");
const { logger } = require("../config/winston");

const errorMiddleware = (err, req, res) => {
  res.status(500).send("Something Failed");
  logger.error(err.message, err);
};

module.exports.enableMiddlewares = function (app) {
  app.use(cors());
  app.use(express.json());
  //all middleware routes will be added here

  app.use(errorMiddleware);
  return app;
};
