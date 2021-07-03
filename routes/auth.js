const express = require("express");
const userRepo = require("../repo/user");
const { validationResult } = require("express-validator");
const signinTemplate = require("../views/signin");
const signupTemplate = require("../views/signup");
const router = express.Router();
const {
  requireEmail,
  requirePassword,
  requireConformPassword,
  checkPassword,
  checkEmail,
} = require("./validator");

router.get("/", (req, res) => {
  res.send(`<h3><a href="/signin">Sign in</a></h3>
<h3><a href="/signup" >SignUp</a></h3>

    `);
});
router.get("/home", (req, res) => {
  if (!req.session.userID) {
    return res.redirect("/");
  }
  res.send('<h1>Welcome to the Home page ): </h1>";');
});
router.get("/signup", (req, res) => {
  res.send(signupTemplate({}));
});

router.get("/signin", (req, res) => {
  res.send(signinTemplate({}));
});

router.post(
  "/signup",
  [requireEmail, requirePassword, requireConformPassword],
  async (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send(signupTemplate({ errors }));
    }
    const user = await userRepo.createAccount({ email, password });
    req.session.userID = user.id;

    res.redirect("/home");
  }
);

router.post("/signin", [checkEmail, checkPassword], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.send(signinTemplate({ errors }));
  }
  const user = await userRepo.getByOne({ email: req.body.email });
  req.session.userID = user.id;
  res.redirect("/home");
});
module.exports = router;
