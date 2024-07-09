const express = require('express');
const Tour = require('../Model/tourModel')
const AllAPIFeatures = require('../utils/apifeatures')
const catchAsync = require('../utils/catchAsync')
const appErrors = require('../utils/appErrors')


// Middleware to get the top 5 cheap tours
const aliasTopTours = async (req, res, next) => {
    req.query.limit = '5'; // Limit the results to 5
    req.query.sort = "-ratingsAverage price"; // Sort by ratingsAverage in descending order and price in ascending order
    req.query.fields = "name price ratingsAverage summary"; // Select specific fields to return
    next();
}

// Get all tours

// here we are adding next as arg only if there is a error it should call the error handling middleware
const getAllTours = catchAsync(async (req, res, next) => {
    // Execute the query with filtering, sorting, limiting, and pagination
    const features = new AllAPIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limiting()
        .paginate();
    const getalltours = await features.mongooseQuery;

    res.status(200).json({
        status: 'success',
        results: getalltours.length,
        places: {
            tours: getalltours
        }
    });
});

// Get a single tour by its ID
const getTour = catchAsync(async (req, res , next) => {
    const tour = await Tour.findById(req.params.id).populate("reviews")
//     .populate({
//         path: 'guides',
//         select: '-__v' // Exclude the __v field
//   });// Find tour by ID from the route parameters
    //populate means guides are refering to objects in User docs. popuate means if there is guides in a tour get the data from the
    //refered ids

    if(!tour){
        return next(new appErrors(`No tour found with that matching id` , 404))
    }
    res.status(200).json({
        status: 'success',
        place: {
            tours: tour
        }
    });
});

// Add a new tour
const addTour = catchAsync(async (req, res ,next) => {
    const newTour = await Tour.create(req.body); // Create a new tour with the request body data

    res.status(201).json({
        status: "201",
        data: {
            tours: newTour
        }
    });
});

// Update an existing tour
const updateTour = catchAsync(async (req, res , next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // Return the updated document
        runValidators: true // Run validators on the updated data
    });

    if(!tour){
        return next(new appErrors(`No tour found with that matching id` , 404))
    }

    res.status(201).json({
        status: "201",
        data: {
            tours: tour
        }
    });
});

// Delete a tour
const deleteTour = catchAsync(async (req, res,next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id); // Find tour by ID and delete it

    if(!tour){
        return next(new appErrors(`No tour found with that matching id` , 404))
    }

    res.status(200).json({
        status: "Success",
        data: null
    });
});

// Get tour statistics with aggregation
const getTourStats = catchAsync(async (req, res,next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } } // Filter tours with ratingsAverage greater than or equal to 4.5
        },
        {
            $group: {
                _id: '$difficulty', // Group by difficulty
                numTours: { $sum: 1 }, // Count the number of tours
                avgRating: { $avg: '$ratingsAverage' }, // Calculate average ratings
                avgPrice: { $avg: '$price' }, // Calculate average price
                minPrice: { $min: '$price' }, // Find minimum price
                maxPrice: { $max: '$price' } // Find maximum price
            }
        },
        {
            $sort: { avgPrice: 1 } // Sort by average price in ascending order
        }
    ]);
    res.status(200).json({
        status: "Success",
        data: {
            stats
        }
    });
});

// Get the monthly plan for tours in a specific year
const getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1; // Convert year to a number
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates' // Deconstruct the startDates array
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`), // Match start dates within the given year
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' }, // Group by month
                numTours: { $sum: 1 }, // Count the number of tours per month
                tours: { $push: '$name' } // Push tour names into an array
            }
        },
        {
            $sort: { numTours: -1 } // Sort by the number of tours in descending order
        },
        {
            $project: {
                _id: 0,
                month: '$_id', // Rename _id to month
                numTours: 1,
                tours: 1
            }
        }
    ]);
    res.status(200).json({
        status: "Success",
        data: {
            plan
        }
    });
});

// Export the controller functions
module.exports = {
    getAllTours,
    getTour,
    addTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan
};
