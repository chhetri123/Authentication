const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Please provide your name"],
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter valid email address"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide your own password"],
    minlength: [8, "Password must be at least 8 characters"],
    maxlength: [14, "Password must be at most 14 characters"],
    select: false,
  },
  conformPassword: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "Invalid Password",
    },
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordTokenExpiresIn: String,
});

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    // console.log("Docuemnt middlewares");
    const salt = crypto.randomBytes(12).toString("hex");
    this.password =
      crypto.scryptSync(this.password, salt, 64).toString("hex") + `.${salt}`;

    this.conformPassword = undefined;
  }
  next();
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangeAt = Date.now() - 1000;
  next();
});
userSchema.methods.correctPassword = function (enteredPassword, savedPassword) {
  const [hashed, salt] = savedPassword.split(".");
  const encryptedPassword = crypto
    .scryptSync(enteredPassword, salt, 64)
    .toString("hex");
  return hashed === encryptedPassword;
};

userSchema.methods.changePasswordAt = function (tokenTime) {
  if (this.passwordChangeAt) {
    const changePasswordTime = this.passwordChangeAt.getTime() / 1000;
    return changePasswordTime > tokenTime;
  }
  return false;
};

userSchema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordTokenExpiresIn = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
