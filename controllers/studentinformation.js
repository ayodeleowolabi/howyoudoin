const express = require('express');
const router = express.Router();
const User = require('../models/user');


// ALL Paths begin with //studentinformation
// INDEX
router.get('/', (req, res) => {
    const user = req.user
    const studentInfo = req.user.studentInformation
    res.render('studentinfo/index.ejs', { user, studentInfo });

});


// NEW 
router.get('/new', (req, res) => {
    res.render('studentinfo/new.ejs')
});

// UPDATE?

router.post('/', async (req, res) => {
    try {
        req.user.studentInformation = req.body
        await req.user.save();

    } catch (err) {
        console.log(err)
    }
    console.log('req.body:', req.body)
    res.redirect('/student/information')
});




// EDIT
router.get('/edit', async (req, res) => {
    const student = req.user
    const studentForm = req.user.studentInformation
    const body = req.body
    console.log('studentform:', { studentForm, student })
    res.render('studentinfo/edit.ejs', { studentForm, student, body })

});


router.delete('/:id', async (req, res) => {

    try {
        const user = await User.findById(req.user._id)
        console.log('user:', user)
       

        await user.studentInformation.deleteOne()
        await user.save()
        console.log("user:", user)


    } catch (err) {
        console.log(err)
    }
    res.redirect('/student/information')
});


// DELETE



module.exports = router

