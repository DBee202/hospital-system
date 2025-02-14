const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const schema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 255 },
  email: {
    type: String,
    unique: true,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  password: { type: String, required: true },
  role: { type: String, enum: ["Patient", "Doctor"], required: true },
});

schema.methods.generateToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.UNIQUE_PRIVATE_KEY, {
    expiresIn: "12h",
  });
  return token;
};

schema.methods.validatePassword = async function (password) {
  const isValidPassword = await bcrypt.compare(password, this.password);
  return isValidPassword;
};

module.exports.validateSignup1 = (account) => {
  //Min 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character
  const passwordError = new Error(
    "Password must be at least 8 characters long, contain 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character"
  );

  const schema = Joi.object({
    name: Joi.string().required().max(255),
    email: Joi.string().email().required(),
    password: Joi.string()
      .required()
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
        )
      )
      .error(() => passwordError),
    confirmPassword: Joi.ref("password"),
    role: Joi.string().valid("Patient", "Doctor").required(),
  });
  return schema.validate(account);
};

module.exports.validateSignUp2 = (account) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    sessionId: Joi.objectId().required(),
  });
  return schema.validate(account);
};

module.exports.User = mongoose.model("User", schema);
