const router = require("express").Router();
const bcrypt = require("bcrypt");
const { validateSignup1, User, validateSignUp2 } = require("../../models/User");
const { routeHandler } = require("../../startup/expressMiddlewares");
const { Session } = require("../../models/Session");
const { initTransaction } = require("../../config/initTransaction");

router.post(
  "/step-1",
  routeHandler(async (req, res) => {
    const { error } = validateSignup1(req.body);
    if (error)
      return res.status(400).send({
        message: error.details ? error.details[0].message : error.message,
      });

    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res
        .status(400)
        .send({ message: "A user with this email already exists" });

    const salt = await bcrypt.genSalt(10);

    let session = await Session.findOne({
      email: req.body.email,
      codeConfirmed: false,
    });

    if (session)
      return res.status(400).send({
        message: "A code has already been sent to this email",
        sessionId: session._id,
      });

    session = new Session({
      name: req.body.name,
      email: req.body.email,
      //====>This is a random 4 character code that will be sent to the user's email
      //==> This code will be used to verify the user's email address but for now, we will just store it in the database and send as a response to the user because this is just a demo
      codeGenerated: Math.random().toString(36).substring(2, 6),
      password: await bcrypt.hash(req.body.password, salt),
      role: req.body.role,
    });

    await session.save();

    res.status(200).send({
      message: "A code has been sent to your email",
      code: session.codeGenerated,
      sessionId: session._id,
    });
  })
);

router.post(
  "/step-2",
  routeHandler(async (req, res) => {
    const { error } = validateSignUp2(req.body);
    if (error)
      return res.status(400).send({
        message: error.details ? error.details[0].message : error.message,
      });

    const session = await Session.findById(req.body.sessionId);
    if (!session) return res.status(400).send({ message: "Invalid session" });

    if (session.codeGenerated !== req.body.code)
      return res.status(400).send({ message: "Invalid code" });

    session.codeConfirmed = true;

    const user = new User({
      name: session.name,
      email: session.email,
      password: session.password,
      role: session.role,
    });

    await initTransaction(async (transaction) => {
      await Session.deleteOne({ _id: session._id }, { session: transaction });
      await user.save({ session: transaction });
    });

    res.status(200).send({ message: "Registration Successful" });
  })
);

module.exports = router;
