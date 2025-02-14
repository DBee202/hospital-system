const { logger } = require("./config/winston");
const { connectToDB } = require("./startup/dbStarter");
const { enableMiddlewares } = require("./startup/expressMiddlewares");

require("dotenv").config();
const app = require("express")();
enableMiddlewares(app);

connectToDB(() =>
  app.listen(process.env.PORT || 3000, () =>
    logger.info(`Server is running on port ${process.env.PORT}`)
  )
);
