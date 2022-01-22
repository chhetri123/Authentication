const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (option) => {
  const msg = {
    to: option.email, // for testing i use my another account
    from: process.env.EMAIL_USERNAME, //
    subject: "Password reset token (valid for 10 min)",
    text: option.message,
    // html: "<strong>and easy to do anywhere, even with Node.js</strong>",
  };
  await sgMail.send(msg);
};
module.exports = sendMail;
