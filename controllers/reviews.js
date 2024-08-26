const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Review = require('../models/review');

// All Paths begin with /student/review.

// index functionality

router.get('/', async (req, res) => {
    const reviews = await Review.find({}).sort('createdAt').populate('owner')
    console.log(reviews)
    res.render('reviews/index.ejs', { reviews })

});

// new functionality

router.get('/new', (req, res) => {
    res.render('reviews/new.ejs')
});

// Individual Reviews Show
router.get('/:reviewId', async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId).populate('owner')
        console.log(review)
        res.render('reviews/show.ejs', { review })

    } catch (err) {
        console.log(err)
        res.redirect('/student/reviews')

    }
});


// Create New Review
router.post('/', async (req, res) => {
    try {
        req.body.owner = req.user._id
        reviewBank = req.body.reviewBank
        const newReview = new Review(req.body)
        await newReview.save()
        console.log(req.body)
        console.log(newReview)

    } catch (err) {
        console.log(err)

    }
    res.redirect('/student/reviews')

});

// Edit Review

router.get('/:reviewId/edit', async (req, res) => {

    try {
        const review = await Review.findById(req.params.reviewId).populate('owner')
        res.render('reviews/edit.ejs', { review })
    } catch (err) {
        console.log(err)
        res.redirect('/student/reviews')
    }

});


// Update Review

router.put('/:reviewId', async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.reviewId, req.body)
        res.redirect(`/student/reviews/`)
    } catch (err) {
        console.log(err)
        res.redirect('/student/reviews')
    }
});

router.delete('/:reviewId', async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.reviewId)
        Review.save()


    } catch (err) {
        console.log(err)
    }
    res.redirect('/student/reviews')
});


module.exports = router