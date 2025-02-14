//Basic Express Middleware configuration

const express = require("express");
const cors = require("cors");
const { logger } = require("../config/winston");

module.exports.enableMiddlewares = function (app) {
  app.use(cors());
  app.use(express.json());
  //all middleware routes will be added here

  app.use("/api/signup", require("../routes/user/create"));

  app.use((req, res) =>
    res.status(404).send("The requested resource was not found")
  );
  return app;
};

module.exports.routeHandler = function (handler) {
  //This function is a wrapper for route handlers to catch any errors that occur in the handler
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      logger.error(error.message);
      res.status(500).send({ message: "An error occurred" });
    }
  };
};
