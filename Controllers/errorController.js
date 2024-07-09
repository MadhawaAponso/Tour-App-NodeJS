const errorHandlingMiddleware = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500
    err.status = err.status || "Failed"

    console.log(err.stack);
    res.status(err.statusCode).json({
        status : err.status,
        message : err.stack
    })
}

module.exports = errorHandlingMiddleware