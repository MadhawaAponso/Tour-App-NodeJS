const express = require('express');

const userController = require('../Controllers/userController')
const authController = require('../Controllers/AuthenticationController')

const router = express.Router();

router.post('/signup', authController.signUp)
router.post('/login',authController.login)
router.post('/forgotpassword',authController.forgotPassword)
router.patch('/resetpassword/:token',authController.resetPassword)
// router.patch('/updatepassword',authController.updatePassword)
router.route('/updatepassword').patch(authController.checkingaloggedIn,authController.updatePassword)
router.route('/updateMe').patch(authController.checkingaloggedIn,userController.updateMe)
router.route('/deleteMe').delete(authController.checkingaloggedIn,userController.deleteMe)

router.route('/').get(userController.getAllUsers).post(userController.addUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
