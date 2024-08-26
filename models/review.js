const mongoose = require("mongoose");
const express = require('express');
const Schema = mongoose.Schema;


const reviewSchema = new Schema ({

    owner:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewBank: {
        type: [Schema.Types.ObjectId],
        ref: 'User'
    },
    weekNumber:{
        type: String,
        enum: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']
    }, 
    weeklyReview:{
        type: String,
       
    },
    rating: {
        type: String,
        enum: ['0 - I have no understanding', 
            '1 - I have very limited Understanding', 
            '2 - I understand more than 50% of what weve done',
        '3 - I have a concrete level of understanding',
    '4 - I feel very comfortable with my level of understanding'],
    
    }, 
},
 { timestamps: true});



const Review = mongoose.model('Review', reviewSchema)

module.exports = Review;