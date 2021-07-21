const fs = require('fs');

// accessing json data of all the a/vailable tours
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'server error',
    message:
      'server is currently under maintainence we will get back to you soon...',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'server error',
    message:
      'server is currently under maintainence we will get back to you soon...',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'server error',
    message:
      'server is currently under maintainence we will get back to you soon...',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'server error',
    message:
      'server is currently under maintainence we will get back to you soon...',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'server error',
    message:
      'server is currently under maintainence we will get back to you soon...',
  });
};
