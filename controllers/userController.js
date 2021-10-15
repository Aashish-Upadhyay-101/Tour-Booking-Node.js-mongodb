const fs = require('fs');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

// accessing json data of all the a/vailable tours
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

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

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'server error',
    message: 'This route is not yet defined',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'server error',
    message: 'This route is not yet defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'server error',
    message: 'This route is not yet defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'server error',
    message: 'This route is not yet defined',
  });
};
