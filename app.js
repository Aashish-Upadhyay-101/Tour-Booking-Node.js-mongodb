// core modules
const express = require('express');
const morgan = require('morgan');
// routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// middleware
if (process.env.NOVE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

// serving static files
app.use(express.static(`${__dirname}/public`));

// parent route middleware
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
