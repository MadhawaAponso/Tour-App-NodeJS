const express = require('express');
const tourController = require('../Controllers/tourController')
const authController = require('../Controllers/AuthenticationController')


const router = express.Router();

//param middleware: that runs only if there certail params
 // ony runs if there is id param
//router.param('id',tourController.checkID)

router.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getAllTours)
router.route('/tour-stats').get(tourController.getTourStats)
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)

router.route('/').get(authController.checkingaloggedIn , tourController.getAllTours).post(tourController.addTour); // here in post request it checks the body first and then add the tour
router.route('/:id').get(tourController.getTour).patch(tourController.updateTour).delete(authController.checkingaloggedIn,authController.restrictedTo('admin','leadguide'),tourController.deleteTour);

module.exports = router;
