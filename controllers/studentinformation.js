const express = require('express');
const wrap = require('../utils/asyncHandler');

const router = express.Router();
const FIELDS = ['parentname', 'phone', 'address', 'homeroomteacher'];

function pickInfo(body) {
  const data = {};
  for (const key of FIELDS) data[key] = String(body[key] || '').trim();
  return data;
}

router.get('/', (req, res) => {
  res.render('studentinfo/index.ejs', { studentInfo: req.user.studentInformation });
});

router.get('/new', (req, res) => {
  res.render('studentinfo/form.ejs', { studentInfo: {}, error: null, mode: 'new' });
});

router.get('/edit', (req, res) => {
  if (!req.user.studentInformation) return res.redirect('/student/information/new');
  res.render('studentinfo/form.ejs', { studentInfo: req.user.studentInformation, error: null, mode: 'edit' });
});

// Create or replace the logged-in student's contact info
async function saveInfo(req, res) {
  const data = pickInfo(req.body);
  req.user.studentInformation = data;
  try {
    await req.user.save();
    res.redirect('/student/information');
  } catch (err) {
    if (err.name !== 'ValidationError') throw err;
    const mode = req.method === 'PUT' ? 'edit' : 'new';
    res.status(422).render('studentinfo/form.ejs', {
      studentInfo: data, mode, error: 'Please check the contact form and try again.',
    });
  }
}
router.post('/', wrap(saveInfo));
router.put('/', wrap(saveInfo));

async function deleteInfo(req, res) {
  if (req.user.studentInformation) {
    req.user.studentInformation = undefined;
    await req.user.save();
  }
  res.redirect('/student/information');
}
router.delete('/', wrap(deleteInfo));
router.delete('/:id', wrap(deleteInfo)); // older form posted to /student/information/:id

module.exports = router;
