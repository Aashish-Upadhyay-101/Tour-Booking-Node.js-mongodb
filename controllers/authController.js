const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// generating token
const signToken = (_id) =>
  jwt.sign({ id: _id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError('Please provide with both email and passsword', 400)
    );
  }

  const user = await User.findOne({ email }).select('+password');

  // if (!user || !(await user.correctPassword(password, user.password))) {
  //   return next(new AppError('Incorrect email or password', 401));
  // }

  if (!user) {
    return next(new AppError('Please signup first', 401));
  }

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect password', 401));
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // check if the token exist in the http header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Please login to get access', 401));
  }

  const decode = promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decode);

  next();
});
