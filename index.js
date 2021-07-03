const express = require("express");
const bodyParser = require("body-parser");
const authRouter = require("./routes/auth");
const cookies = require("cookie-session");
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookies({ keys: ["manish"] }));
app.use(authRouter);

app.listen(3000, () => {
  console.log("app is listening");
});
