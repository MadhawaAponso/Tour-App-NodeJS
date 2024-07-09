// all the functions related to authetication are here
const jwt = require('jsonwebtoken')
const { promisify} = require('util')
const crypto = require('crypto');
const bcrypt = require('bcryptjs')
const User = require("../Model/userModel")
const catchAsync = require('../utils/catchAsync')
const appErrors = require('../utils/appErrors')
const sendMail = require('../utils/email')


const createSendToken = (user,statusCode,res)=>{
    const token = jwt.sign({id : user._id} , process.env.JWT_SECRET,{  // here using id as the payload
        expiresIn : process.env.JWT_EXPIRES_IN
    }) 
    user.password = undefined
    res.status(statusCode).json({
        status : "Success",
        token,
        data : {
            user
        }
    })
}

const signUp = catchAsync(async(req,res,next)=>{

    const newuser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password : req.body.password,
        passwordConfirm : req.body.passwordConfirm,
        role : req.body.role
    }) 
    createSendToken(newuser,201,res)
})

const login = catchAsync(async(req,res,next)=>{
    const {email , password} = req.body // object destructuring
    //if email and password exits
    if(!email || !password){
        return next(new appErrors("Please provide email and Password" , 400))
    }
    // check if the user exist for the password and email
    const user = await User.findOne({email}).select('+password') // in the data model password select is false. so we need to select the password like this. this return the email and password related to that email

    if (!user) {
        return next(new appErrors('Incorrect email or password', 401));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        return next(new appErrors('Incorrect email or password', 401));
    }

    createSendToken(user , 200 , res)
})

const checkingaloggedIn = catchAsync(async(req,res,next)=>{
    //1) getting token and check if it there

    let token

    //authorization=[Bearer adbaskjdbakdakdkbdlbdakbd] : the token is the thing after the space
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(" ")[1] //after spliting [Bearer,adbaskjdbakdakdkbdlbdakbd] and we are getting the last one as it is the token
    }

    
    if(!token){
        return next(new appErrors("You are not logged in",401)) // 401 unauthroizedd
    }

    //2) validate the token(verification)
    try {
        // 2) Validate the token (verification)
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // Decode the token

        // 3) Check if the user still exists
        const currentUser = await User.findById(decoded.id);
        console.log(currentUser);
        if (!currentUser) {
            return next(new appErrors('The user belonging to this token does no longer exist', 401));
        }

        // // 4) Check if user changed password after JWT was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next(new appErrors('User recently changed password! Please log in again.', 401));
        }

        // // Grant access to the protected route
        req.user = currentUser;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new appErrors('Your token has expired! Please log in again.', 401));
        }
        return next(new appErrors('Invalid token. Please log in again!', 401));
    }
})

//RESTRICTING THIS TO CERTAIN ROLES
const restrictedTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new appErrors('You do not have permission to perform this action', 403));
        }
        next();
    };
};





const forgotPassword = catchAsync(async(req,res,next)=>{
    //1)get the user by email address

    const user = await User.findOne({email:req.body.email})

    if(!user){
        return next(new appErrors("The user with the email address is not exist",404))
    }

    //2)if user exist generate random reset token
    const resetToken = user.tokenForchangePassword()
    
    await user.save({validateBeforeSave : false}) // because once we are saving something we are validating password and stuff. here we are just storing the reset thing. so we do not need any validations to be happed

    
    //3) send it back to the user
    const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetpassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendMail({
          email: user.email,
          subject: 'Your password reset token (valid for 10 min)',
          message
        });
    
        res.status(200).json({
          status: 'success',
          message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
    
        return next(
          new appErrors('There was an error sending the email. Try again later!'),
          500
        );
      }
    

})





const resetPassword =catchAsync(async(req,res,next)=>{
    // get the user based on the token

    const hasedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    console.log(hasedToken);

    const user = await User.findOne({
        resetPasswordToken :hasedToken,
        resetPasswordTokenExpireDate:{$gt : Date.now()} // this gives the user who has the token and token not expired // this check the both
    })

    console.log(user);

    if (!user) {
        return next(new appErrors('The token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpireDate = undefined;

    await user.save();

    // Update changePasswordAt property for the user
    user.passwordChangedAt = Date.now();
    await user.save({validateBeforeSave:false});

    // Log the user in, send JWT
    createSendToken(user,200,res)})





const updatePassword = catchAsync(async (req, res, next) => {
        try {
            const { password, Currentpassword,passwordConfirm } = req.body;
    
            // Check if all fields are provided
            if (!password || !Currentpassword || ! passwordConfirm) {
                return next(new appErrors('Please provide all required fields', 400));
            }
    
            // Get the user from the collection
            const user = await User.findById(req.user.id).select('+password'); // checklogin function runs before this and it says req.user = current user
            if (!user) {
                return next(new appErrors('User does not exist', 400));
            }
    
            // Check if the current password is correct
            const isPasswordCorrect = await bcrypt.compare(Currentpassword, user.password); // compare the password that is coming from the user and the password that is stored is same or not
            if (!isPasswordCorrect) {
                return next(new appErrors('Incorrect password', 401));
            }
    
    
            // Update the password
            user.password = password;
            user.passwordConfirm = passwordConfirm;
    
            await user.save();
    
            // Log the user in, send JWT
            createSendToken(user,200,res)
        } catch (error) {
            next(error);
        }
    })

module.exports = {
    signUp,
    login,
    checkingaloggedIn,
    restrictedTo,
    forgotPassword,
    resetPassword,
    updatePassword
};