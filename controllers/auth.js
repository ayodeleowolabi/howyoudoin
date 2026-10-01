const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const wrap = require('../utils/asyncHandler');

const router = express.Router();
const SALT_ROUNDS = 10;

// All paths start with "/auth"

router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs', { error: null, username: '' });
});

router.post('/sign-up', wrap(async (req, res) => {
  const username = (req.body.username || '').trim();
  const { password = '', confirmPassword = '' } = req.body;
  const fail = (error) => res.status(422).render('auth/sign-up.ejs', { error, username });

  if (!username) return fail('Please choose a username.');
  if (password.length < 6) return fail('Password must be at least 6 characters.');
  if (password !== confirmPassword) return fail('Passwords do not match.');
  if (await User.exists({ username })) return fail('That username is already taken.');

  try {
    const user = await User.create({ username, password: bcrypt.hashSync(password, SALT_ROUNDS) });
    req.session.regenerate(() => {
      req.session.user = { _id: user._id };
      req.session.save(() => res.redirect('/'));
    });
  } catch (err) {
    console.error(err);
    fail('Something went wrong. Please try again.');
  }
}));

router.get('/login', (req, res) => {
  res.render('auth/login.ejs', { error: null, username: '' });
});

router.post('/login', wrap(async (req, res) => {
  const username = (req.body.username || '').trim();
  const user = await User.findOne({ username });
  if (!user || !bcrypt.compareSync(req.body.password || '', user.password)) {
    return res.status(401).render('auth/login.ejs', {
      error: 'Incorrect username or password.',
      username,
    });
  }
  req.session.regenerate(() => {
    req.session.user = { _id: user._id };
    req.session.save(() => res.redirect('/'));
  });
}));

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
