const express = require('express');

const router = express.Router({ mergeParams: true });

const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourReviewIds,
  getReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authController');

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourReviewIds, createReview);

router
  .route('/:id')
  .delete(protect, deleteReview)
  .patch(protect, updateReview)
  .get(protect, setTourReviewIds, getReview);

module.exports = router;
