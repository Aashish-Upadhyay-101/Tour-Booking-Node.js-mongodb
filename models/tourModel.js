const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: [true, 'A tour name must be unique'],
      trim: true,
      maxlength: [40, 'The tour must have at most 40 character'],
      minlength: [10, 'The tour mush have at least 10 character'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },

    priceDiscount: {
      type: Number,
      validate: function (value) {
        return value < this.price;
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have cover Image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual properties ( that is not included in database but is excessable during runtine )
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// mongodb document middleware
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.post('save', (docs, next) => {
  console.log(docs);
  next();
});

// NOTE: Models are like collections, each model can have different Schema
// and each different model in a collection in mongodb database
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
