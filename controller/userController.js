const User = require("./../model/userModel");
const AppError = require("./../utils/appError");
exports.signup = (req, res, next) => {};
exports.login = (req, res, next) => {};
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: "success",
      result: users.length,
      users,
    });
  } catch (err) {
    res.status(404).json({ err: err.message });
  }
};
