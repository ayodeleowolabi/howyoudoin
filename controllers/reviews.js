const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/review');
const wrap = require('../utils/asyncHandler');

const router = express.Router();
const EDITABLE_FIELDS = ['weekNumber', 'rating', 'weeklyReview'];

// Only accept the fields a student is allowed to set (prevents mass assignment).
function pickReviewFields(body) {
  const data = {};
  for (const key of EDITABLE_FIELDS) {
    if (body[key] !== undefined) data[key] = String(body[key]).trim();
  }
  return data;
}

// Load a review only if it belongs to the logged-in user; otherwise 404.
const loadOwnReview = wrap(async function loadOwnReview(req, res, next) {
  const { reviewId } = req.params;
  if (!mongoose.isValidObjectId(reviewId)) return res.status(404).render('404.ejs');
  const review = await Review.findOne({ _id: reviewId, owner: req.user._id });
  if (!review) return res.status(404).render('404.ejs');
  req.review = review;
  next();
});

function validationMessage(err) {
  return Object.values(err.errors || {}).map((e) => e.message).join(' ') || 'Please check your answers.';
}

router.get('/', wrap(async (req, res) => {
  const reviews = await Review.find({ owner: req.user._id }).sort({ weekNumber: 1, createdAt: 1 });
  res.render('reviews/index.ejs', { reviews });
}));

router.get('/new', (req, res) => {
  res.render('reviews/new.ejs', { error: null, review: {} });
});

router.post('/', wrap(async (req, res) => {
  const data = pickReviewFields(req.body);
  try {
    await Review.create({ ...data, owner: req.user._id });
    res.redirect('/student/reviews');
  } catch (err) {
    if (err.name !== 'ValidationError') throw err;
    res.status(422).render('reviews/new.ejs', { error: validationMessage(err), review: data });
  }
}));

router.get('/:reviewId', loadOwnReview, (req, res) => {
  res.render('reviews/show.ejs', { review: req.review });
});

router.get('/:reviewId/edit', loadOwnReview, (req, res) => {
  res.render('reviews/edit.ejs', { review: req.review, error: null });
});

router.put('/:reviewId', loadOwnReview, wrap(async (req, res) => {
  Object.assign(req.review, pickReviewFields(req.body));
  try {
    await req.review.save();
    res.redirect(`/student/reviews/${req.review._id}`);
  } catch (err) {
    if (err.name !== 'ValidationError') throw err;
    res.status(422).render('reviews/edit.ejs', { review: req.review, error: validationMessage(err) });
  }
}));

router.delete('/:reviewId', loadOwnReview, wrap(async (req, res) => {
  await req.review.deleteOne();
  res.redirect('/student/reviews');
}));

module.exports = router;
