const express = require('express');
const Review = require('../Model/reviewModel')
const catchAsync = require('../utils/catchAsync')
const appErrors = require('../utils/appErrors')



const getAllReviews = catchAsync(async(req,res,next)=>{
    const allreviews = await Review.find();
    res.status(200).json({
        status: "success",
        results: allreviews.length,
        users: allreviews
    });
})
const createReview = catchAsync(async(req,res,next)=>{
    const newreview = await Review.create(req.body); // Create a new review with the request body data

    res.status(201).json({
        status: "201",
        data: {
            reviews: newreview
        }
    });

})

module.exports ={
    createReview,
    getAllReviews

}