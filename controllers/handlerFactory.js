const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const Tour = require('../models/tourModel');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // if the tour is deleted then reviews related to that tour also get deleted
    if (Model === Tour) {
      await Review.deleteMany({ tour: req.params.id });
    }

    // updated piece of code myself

    const doc = await Model.findByIdAndDelete(req.params.id);

    // incase if there is no doc then return a 404 message
    if (!doc) {
      return next(
        new AppError('No document found with that name folks !', 404)
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // incase if there is no docs then return a 404 message
    if (!doc) {
      return next(
        new AppError('No document found with that name folks !', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
