// Creates (or resets) a demo account so visitors can try the app without signing up.
//   npm run seed:demo   -> resets the demo account to its sample data
// Uses MONGODB_URI, DEMO_USERNAME (default "demo") and DEMO_PASSWORD (default "howudoin-demo").
require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/user');
const Review = require('../models/review');

const username = process.env.DEMO_USERNAME || 'demo';
const password = process.env.DEMO_PASSWORD || 'howudoin-demo';

const reviews = [
  { weekNumber: 'Week 1', rating: Review.RATINGS[1], weeklyReview: 'Rise over run still confuses me. Can we do more practice problems?' },
  { weekNumber: 'Week 2', rating: Review.RATINGS[2], weeklyReview: 'The graphing activity helped. I get positive slope, negative slope is tricky.' },
  { weekNumber: 'Week 3', rating: Review.RATINGS[3], weeklyReview: 'I can find slope from two points now!' },
  { weekNumber: 'Week 4', rating: Review.RATINGS[4], weeklyReview: 'Slope-intercept form finally clicked during the review game.' },
];

// Creates the demo account. With { onlyIfMissing: true } it leaves an existing account alone.
async function seedDemo({ onlyIfMissing = false } = {}) {
  let user = await User.findOne({ username });
  if (user && onlyIfMissing) return false;
  if (!user) user = new User({ username });
  user.password = bcrypt.hashSync(password, 10);
  user.studentInformation = {
    parentname: 'Jordan Rivera', phone: '202-555-0142', address: '100 Example Ave NW', homeroomteacher: 'Jones',
  };
  await user.save();

  await Review.deleteMany({ owner: user._id });
  await Review.insertMany(reviews.map((r) => ({ ...r, owner: user._id })));

  console.log(`Demo account ready: ${username} (${reviews.length} reviews)`);
  return true;
}

module.exports = seedDemo;

// Run directly: reset the demo account to its original sample data
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => seedDemo())
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
