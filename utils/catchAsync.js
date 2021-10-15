// error handling for async function
const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => next(err));
};

module.exports = catchAsync;
