const { logger } = require("./config/winston");
const { enableMiddlewares } = require("./startup/expressMiddlewares");

require("dotenv").config();
const app = require("express")();
enableMiddlewares(app);

app.listen(process.env.PORT, () => {
  logger.info(`Server is running on port ${process.env.PORT}`);
});
