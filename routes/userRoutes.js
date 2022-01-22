const express = require("express");
const userController = require("./../controller/userController");
const authController = require("./../controller/authController");
const router = express.Router();

router.route("/").get(authController.protect, userController.getUsers);
router.route("/login").get(userController.login).post(authController.login);
router.route("/signup").get(userController.signup).post(authController.signup);
router.route("/forgetPassword").post(authController.forgetPassword);
router.route("/resetPassword/:token").post(authController.resetPassword);
module.exports = router;
