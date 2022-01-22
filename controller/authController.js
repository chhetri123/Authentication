const User = require("./../model/userModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const sendMail = require("./../utils/email");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const createSignToken = (user, res) => {
  user.password = undefined;
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_AT,
  });

  res.status(200).json({ status: "success", token });
};
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.correctPassword(password, user.password)) {
    return next(new AppError("Invalid email or password", 200));
  }
  createSignToken(user, res);
});
exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  createSignToken(user, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  if (
    !req.headers.authorization &&
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return next(new AppError("Please login or Sign Up"), 401);
  }

  const token = req.headers.authorization.split(" ")[1];
  const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await User.findById(decode.id);
  if (!user) {
    return next(new AppError("User belongs to this token does not exist"));
  }
  if (user.changePasswordAt(decode.iat)) {
    return next(
      new AppError("User recently changed password .Please login again"),
      401
    );
  }
  req.user = user;
  next();
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );
  if (!user) return next(new AppError("User Does Not Exist"));
  const resetToken = user.getResetToken();
  await user.save({ validateBeforeSave: false });
  // sending mail
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  // message
  const message = `Forget your password ? Submit a Update request with your new password and passwordConform to :${resetURL}.\n If you didn't forget your password , please ignore this email`;
  console.log(resetURL);
  try {
    await sendMail({ message, email });
  } catch (err) {
    return next(new AppError("Failed to send email. Try later"), 403);
  }
  res.status(200).json({ status: "success", message: "Email is sent" });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = req.params.token;
  const token = crypto.createHash("sha256").update(resetToken).digest("hex");
  const user = await User.findOne({
    passwordResetToken: token,
    passwordTokenExpiresIn: { $gt: Date.now() },
  }).select("+password");
  if (!user) return next("Invalid reset Token or token expired");
  user.password = req.body.password;
  user.conformPassword = req.body.conformPassword;
  user.passwordResetToken = undefined;
  user.passwordTokenExpiresIn = undefined;

  await user.save();
  createSignToken(user, res);
});
