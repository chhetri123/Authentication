const { check } = require("express-validator");
const userRepo = require("../repo/user");

module.exports = {
  requireEmail: check("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Enter valid email")
    .custom(async (email) => {
      const existingUser = await userRepo.getByOne({ email });
      if (existingUser) {
        throw new Error("Email in use");
      } else return true;
    }),
  requirePassword: check("password")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Must be between 4 and 20 character"),

  requireConformPassword: check("ConformPassword")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Must be between 4 and 20 character")
    .custom((ConformPassword, { req }) => {
      if (ConformPassword !== req.body.password) {
        throw new Error("Password must be matched");
      } else return true;
    }),
  checkPassword: check("password")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Must be between 4 and 20 character")
    .custom(async (password, { req }) => {
      const record = await userRepo.getByOne({ email: req.body.email });
      if (!record) {
        throw new Error("Invalid Password");
      }
      const isContain = await userRepo.comparePassword(
        record.password,
        password
      );
      if (!isContain) {
        throw new Error("Invalid password");
      }
      return true;
    }),
  checkEmail: check("email")
    .trim()
    .isEmail()
    .withMessage("Email must be valid")
    .custom(async (email) => {
      const record = await userRepo.getByOne({ email });
      if (!record) {
        throw new Error("Email not found");
      }
      return true;
    }),
};
