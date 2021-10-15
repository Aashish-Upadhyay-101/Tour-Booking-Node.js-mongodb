const AppError = require('../utils/appError');

const sendErrorDevelopment = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProduction = (err, res) => {
  // operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // programming or unknown error
  } else {
    console.error('Error:', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong !',
    });
  }
};

// different types of error handler

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg;
  const message = 'Duplicate field value, please enter another one';
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // 500 means internal server error
  err.status = err.status || 'error';

  if (process.env.NOVE_ENV === 'development') {
    sendErrorDevelopment(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    sendErrorProduction(error, res);
  }
};
