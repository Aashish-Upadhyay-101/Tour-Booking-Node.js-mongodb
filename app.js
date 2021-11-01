// core modules
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitizer = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// utility functions
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// global middlewares
app.use(helmet()); // set security http header

if (process.env.NOVE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many attempts, Please try again after 1 hour',
});

const userLoginLimiter = rateLimit({
  max: 10,
  windowsMs: 60 * 60 * 1000,
  message: 'Too login atemps, try again in an hour',
});

app.use('/api', limiter);
app.use('/api/v1/users/login', userLoginLimiter);

app.use(express.json({ limit: '10kb' }));

// protect against noSQL query injection
app.use(mongoSanitizer());

// protect against xss attacks
app.use(xss());

// parameter pollution cleaning by removing duplicate query
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// parent route middleware
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// to handle unhandled request
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server !`, 404));
});

// error handling middleware
app.use(globalErrorHandler);

module.exports = app;
