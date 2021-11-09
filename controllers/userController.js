const fs = require('fs');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// accessing json data of all the a/vailable tours
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

// filter object method for line no: 43
const filterObj = (obj, ...allowedField) => {
  const newObj = {};
  allowedField.forEach((elem) => {
    if (elem in obj) {
      newObj[elem] = obj[elem];
    }
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const user = await User.find();

  res.status(200).json({
    status: 'success',
    results: user.length,
    data: {
      user,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.userData = req.user.id;
  // console.log(userData);
  next();
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'server error',
    message: 'This route is not yet defined',
  });
};

// update the user info
exports.updateMe = catchAsync(async (req, res, next) => {
  // create error if user want to udate the password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "You can't update password here, Please use /updatePassword route",
        400
      )
    );
  }
  const filteredBody = filterObj(req.body, 'name', 'email', 'role');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  // update user data
  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

// set user inactive
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.userData.id);

  // if (!user) {
  //   return next(new AppError('No user found !', 404));
  // }

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
