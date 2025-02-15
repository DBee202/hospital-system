const { Reminder } = require("../../models/Reminder");
const { auth, routeHandler } = require("../../startup/expressMiddlewares");

const router = require("express").Router();

router.get(
  "/",
  [auth],
  routeHandler(async (req, res) => {
    const reminders = await Reminder.find({ patientId: req.user._id });
    res.status(200).send(reminders);
  })
);

module.exports = router;
