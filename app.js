const express = require('express')
const Fs = require('fs')
const morgan = require('morgan')
const app = express();
const tourRouter = require('./Routes/tourRouter')
const userRouter = require('./Routes/userRouter')
const reviewRouter = require('./Routes/reviewRouter')
const appErrors = require('./utils/appErrors')
const errorHandlingMiddleware = require('./Controllers/errorController')

app.use(morgan('dev'))

// this one must for getting request
app.use(express.json())

app.use((req,res,next)=>{
    req.requestTime = new Date().toDateString()
    next()
})

//ROUTE MIDDLEWARES
app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/reviews',reviewRouter)

//FOR THE WRONG URLS :
app.get("*",(req,res,next)=>{

    next(new appErrors(`cannot find the url ${req.originalUrl} on this server`,404)) ;
 })
//ERROR HANDLING MIDDLEWARE
app.use(errorHandlingMiddleware)


module.exports =app

