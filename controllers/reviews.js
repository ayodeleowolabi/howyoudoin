const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Review = require('../models/review');


router.get('/', async (req, res) => {
 
    const reviews = await Review.find({owner: req.user._id}).sort('createdAt').populate('owner')
    res.render('reviews/index.ejs', { reviews })

});



router.get('/new', (req, res) => {
    res.render('reviews/new.ejs')
});


router.get('/:reviewId', async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId).populate('owner')
        res.render('reviews/show.ejs', { review })

    } catch (err) {
        res.redirect('/student/reviews')

    }
});



router.post('/', async (req, res) => {
    try {
        req.body.owner = req.user._id
        reviewBank = req.body.reviewBank
        const newReview = new Review(req.body)
        await newReview.save()
        console.log(req.body)
        console.log(newReview)

    } catch (err) {

    }
    res.redirect('/student/reviews')

});



router.get('/:reviewId/edit', async (req, res) => {

    try {
        const review = await Review.findById(req.params.reviewId).populate('owner')
        res.render('reviews/edit.ejs', { review })
    } catch (err) {
        console.log(err)
        res.redirect('/student/reviews')
    }

});




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