const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { resetPassword } = require('../Controllers/AuthenticationCOntroller');

userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate : [validator.isEmail , "Please provide a proper email address"]
    },
    photo: {
        type: String,
        
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'leadguide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Do not return the password field in queries by default
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords do not match!'
        }
    },
    passwordChangedAt: Date,
    resetPasswordToken:String,
    resetPasswordTokenExpireDate : Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
})

userSchema.pre('save', async function (next) {
    // if it is not modified just go to the next middleware
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000;
    }
    next();
    
});


// USING THIS MIDDLEWARE TO HIDE ALL THE NON ACTIVE DOCS IN 
userSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } }); // Exclude secret tours from results
    next();
});


userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10); // make milliseconds -> seconds
        return JWTTimestamp < changedTimestamp;
    }

    return false;
};




// The purpose of this method is to generate a token that can be used for resetting a user's password. 
// This token is typically sent to the user's email, and the user can use it to reset their password within a certain timeframe.

userSchema.methods.tokenForchangePassword = function(){
    
    // Step 1: Create a new token
    //crypto.randomBytes(32) generates 32 random bytes.
    //.toString('hex') converts these bytes into a hexadecimal string.
    //This hexadecimal string (resettoken) is a unique token that will be sent to the user.
    const resettoken = crypto.randomBytes(32).toString('hex')

    
    // Step 2: Hash the token and set it on the user schema
    //we are hashing it only for storing it in db
    //but we need is the plain resettoken to be send to user
    this.resetPasswordToken = crypto.createHash('sha256').update(resettoken).digest('hex');

    // Step 3: Set the expiration time for the reset token
    this.resetPasswordTokenExpireDate = Date.now() + 10*60*1000 // 10 minutes from now

    // Step 4: Return the plain token
    //here we are returning the plain token to the user
    return resettoken
}


const User = mongoose.model("User",userSchema)

module.exports = User