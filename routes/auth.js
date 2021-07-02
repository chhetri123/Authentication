const express = require("express");
const router = express.Router();
const userRepo = require("../repo/user");
router.get("/", (req, res) => {
  res.send(`<h3><a href="/signin">Sign in</a></h3>
<h3><a href="/signup" >SignUp</a></h3>

    `);
});
router.get("/signup", (req, res) => {
  res.send(`<form method="POST">
  <div class="container">
    <h1>Sign Up</h1>
    <p>Please fill in this form to create an account.</p>
    <hr>
    <label for="email"><b>Email</b></label>
    <input type="text" placeholder="Enter Email" name="email" required>
    <label for="psw"><b>Password</b></label>
    <input type="password" placeholder="Enter Password" name="password" required>
    <label for="psw-repeat"><b>Repeat Password</b></label>
    <input type="password" placeholder="Repeat Password" name="ConformPassword" required>
    <div>Already signed in? <a href="/signin">Signin</a><div>
      <button type="submit" class="cancelbtn">Submit</button>
  </div>
</form>`);
});

router.post("/signup", async (req, res) => {
  const { email, password, ConformPassword } = req.body;
  const records = await userRepo.getAll();
  if (records.find((record) => record.email === email)) {
    return res.send("User already exist");
  }
  if (password != ConformPassword) {
    return res.send("Password are not matched");
  }
  await userRepo.createAccount({ email, password });
  res.send("You are signed <h1>Welcome to the page </h1>");
});

router.get("/signin", (req, res) => {
  res.send(`<form method="POST">  
        <div class="container">   
            <label>Username : </label>   
            <input type="text" placeholder="Enter Username" name="email" required>  
            <label>Password : </label>   
            <input type="password" placeholder="Enter Password" name="password" required>  
            <button type="submit">Login</button>   
            <button type="button" class="cancelbtn"> Cancel</button>   
            Forgot <a href="#"> password? <a href="/signup">SignUp</a> </a>   
        </div>   
    </form>  `);
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const records = await userRepo.getAll();
  const record = records.find((record) => record.email === email);
  if (!record) {
    return res.send("Email not found");
  }
  const isContant = await userRepo.comparePassword(record.password, password);
  if (!isContant) {
    return res.send("password is incorrect");
  }
  res.send("You are logged in <h1>Welcome To the page </h1>");
});
module.exports = router;
