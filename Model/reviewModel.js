const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review cannot be empty'],
    trim: true // Remove any whitespace from the beginning and end
  },
  rating: {
    type: Number,
    required: [true, 'A review must have a rating'],
    min: [1, 'Rating must be at least 1.0'],
    max: [5, 'Rating must be at most 5.0']
  },
  createdAt: {
    type: Date,
    default: Date.now() // Default to the current date and time
  },

  // what tour that review belong to
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour']
  },

  // whatuser that review belong to
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

reviewSchema.pre(/^find/, function(next) {
    this.sort({ rating: -1 });
    next();
});
//Query middleware
reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name'
    // });
    this.populate({
        path: 'user',
        select: 'name'
    });
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
