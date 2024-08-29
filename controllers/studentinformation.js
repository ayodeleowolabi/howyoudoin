const express = require('express');
const router = express.Router();
const User = require('../models/user');



router.get('/', (req, res) => {
    const user = req.user
    const studentInfo = req.user.studentInformation
    res.render('studentinfo/index.ejs', { user, studentInfo });

});



router.get('/new', (req, res) => {
    res.render('studentinfo/new.ejs')
});



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
     
       

        await user.studentInformation.deleteOne()
        await user.save()
     


    } catch (err) {
        console.log(err)
    }
    res.redirect('/student/information')
});





module.exports = router

