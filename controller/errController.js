// Global Error Handler middleware
const sendJWTHandleDB = () => {
  const message = `Invalid Token . Please log In`;
  return new AppError(message, 401);
};
const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log("Error :", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    const error = JSON.parse(JSON.stringify(err));
    error.message = err.message;
    if (error.message === "JsonWebTokenError") error = sendJWTHandleDB();
    sendProdError(error, res);
  }
  next();
};
