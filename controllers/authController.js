const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

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
    role: req.body.role,
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

// middleware for protecting some hidden routes
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

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if the user still exist
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    );
  }

  // check if user has changed the password or not
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('password recently changed!, Please login in again.', 401)
    );
  }

  // now finally give access to the protected routes

  // we can attach any object to the request object... to get access of that object in middleware to middleware or in another routes
  // we need to save it to the request object.
  req.user = currentUser;
  next();
});

// restricting user to do something
// AUTHORIZATION
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "Sorry! you don't have permission to perform this action",
          403
        )
      );
    }
    next();
  };

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // get the user based on the email
  if (!req.body.email) {
    return next(new AppError('Please provide with a email!', 400));
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('No user found with the given email address!', 404)
    );
  }

  // generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send token to email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forget your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}. If you didn't forget your password, please Ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset Token (expires in 10 mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was problem sending email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get the user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new AppError('No user found or Invalid token, please try again.', 400)
    );
  }

  // set password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // login the user in
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
