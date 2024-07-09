const express = require('express')

const User = require('../Model/userModel')
const catchAsync = require('../utils/catchAsync')
const appErrors = require('../utils/appErrors')




const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
        if (allowedFields.includes(key)) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
};


// Middleware functions
const getAllUsers = async(req, res) => {
    const users = await User.find();
    
    res.status(200).json({
        status: "success",
        results: users.length,
        users: users
    });
};



const updateMe = catchAsync(async(req,res,next)=>{
    //create error if user ask to change the password 
    if(req.body.password || req.body.passwordConfirm){
        return next(new appErrors("This route is not for the password to change"),400 )
    }


    
    // Filter out unwanted fields names that are not allowed to be updated : we only need name or email
    const filteredBody = filterObj(req.body, 'email', 'name');

    const UpdatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new: true, 
        runValidators: true
    }) // we are getitng after checklogin in there req.user = currentuser there for we can say req.user.id

    res.status(200).json({
        status:"Success",
        data:{
            UpdatedUser
        }
    })
     
})

const deleteMe = catchAsync(async(req,res,next)=>{
    //for that user need to be logged in

    const delUser = await User.findByIdAndUpdate(req.user.id,{active:false});

    res.status(204).json({
        status: 'success',
        data: null
      });


})

const getUser = (req, res) => {
    console.log("Add get user logic here");
};

const addUser = (req, res) => {
    console.log("Add user logic here");
};


// this is for the admin updateing the user
const updateUser = (req, res) => {
    console.log("Update user logic here");
};

const deleteUser = (req, res) => {
    console.log("Delete user logic here");
};

module.exports = {
    getAllUsers,
    getUser,
    addUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe
};
