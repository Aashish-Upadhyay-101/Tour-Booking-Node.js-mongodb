const express = require('express');
const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  // checkID,
  // checkBody,
} = require('../controllers/tourController');

// const AuthController = require('../controllers/authController');
const { protect, restrictTo } = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/review', reviewRouter);

// router.param('id', checkID); // it is also called params validating / validator (to check or to perform certain operations on the basis of parameters....the 'id' is the key of the req.params object...)

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/').get(protect, getAllTours).post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide', 'user'), deleteTour);

// router
//   .route('/:tourId/review')
//   .post(protect, restrictTo('user'), reviewController.createReview);

module.exports = router;
