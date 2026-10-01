const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const addUserToReqAndLocals = require('./middleware/addUserToReqAndLocals');
const ensureLoggedIn = require('./middleware/ensureLoggedIn');
const wrap = require('./utils/asyncHandler');
const Review = require('./models/review');
const User = require('./models/user');

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.locals.Review = { WEEKS: Review.WEEKS, RATINGS: Review.RATINGS, RATING_LABELS: Review.RATING_LABELS };
app.locals.teachers = User.TEACHERS;

if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-secret',
  resave: false,
  saveUninitialized: true,
}));
app.use(addUserToReqAndLocals);
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

app.use('/auth', require('./controllers/auth'));
app.use('/student/information', ensureLoggedIn, require('./controllers/studentinformation'));
app.use('/student/reviews', ensureLoggedIn, require('./controllers/reviews'));

app.get('/', wrap(async (req, res) => {
  let stats = null;
  if (req.user) {
    const reviews = await Review.find({ owner: req.user._id }).sort({ createdAt: -1 });
    stats = { count: reviews.length, latest: reviews[0] || null };
  }
  res.render('home.ejs', { stats });
}));

app.use((req, res) => {
  res.status(404).render('404.ejs');
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error.ejs');
});

module.exports = app;
