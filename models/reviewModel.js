const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      minlength: [5, 'review must have at least 5 letters'],
      required: [true, 'review can not be empty'],
    },

    rating: {
      type: Number,
      min: [1, 'rating must be atleast 1'],
      max: [5, 'rating must be less or equal to 5'],
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcRatingsAverage = async function (tour) {
  const stats = await this.aggregate([
    {
      $match: { tour },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tour, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tour, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// this.constructor means the current model we are working on!
reviewSchema.post('save', function (next) {
  this.constructor.calcRatingsAverage(this.tour);
  next();
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.temp = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, function () {
  this.r.constructor.calcRatingsAverage(this.temp.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
