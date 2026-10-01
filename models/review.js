const mongoose = require('mongoose');

const WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
const RATINGS = [
  '0 - I have no understanding',
  '1 - I have very limited Understanding',
  '2 - I understand more than 50% of what weve done',
  '3 - I have a concrete level of understanding',
  '4 - I feel very comfortable with my level of understanding',
];

const reviewSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekNumber: {
    type: String,
    required: [true, 'Please choose a week.'],
    enum: { values: WEEKS, message: 'Please choose a week between 1 and 5.' },
  },
  rating: {
    type: String,
    required: [true, 'Please choose a rating.'],
    enum: { values: RATINGS, message: 'Please choose a rating from 0 to 4.' },
  },
  weeklyReview: { type: String, trim: true, maxlength: [2000, 'Please keep your reflection under 2000 characters.'] },
}, { timestamps: true });

// Friendlier display text for each rating (stored values stay the same for existing data)
const RATING_LABELS = [
  'I have no understanding yet',
  'I have very limited understanding',
  "I understand more than half of what we've done",
  'I have a solid understanding',
  'I feel very comfortable with this material',
];

// 0–4 score parsed from the rating label, handy for display
reviewSchema.virtual('score').get(function score() {
  return this.rating ? Number(this.rating[0]) : null;
});
reviewSchema.virtual('ratingLabel').get(function ratingLabel() {
  return this.rating ? RATING_LABELS[Number(this.rating[0])] : '';
});

const Review = mongoose.model('Review', reviewSchema);
Review.WEEKS = WEEKS;
Review.RATINGS = RATINGS;
Review.RATING_LABELS = RATING_LABELS;

module.exports = Review;
