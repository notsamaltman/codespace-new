const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  console.log(error);

  res.status(500).json({
    message: "Internal Server Error"
  });
};

export default errorHandler;
