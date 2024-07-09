const express = require('express');
const reviewController = require('../Controllers/reviewController')
const authController = require('../Controllers/AuthenticationController')


const router = express.Router();

//param middleware: that runs only if there certail params
 // ony runs if there is id param
//router.param('id',tourController.checkID)
router
    .route('/')
        .get(reviewController.getAllReviews)
        .post(authController.checkingaloggedIn ,authController.restrictedTo('user'),reviewController.createReview); // here in post request it checks the body first and then add the tour

module.exports = router;
