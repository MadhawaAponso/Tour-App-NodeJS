class appErrors extends Error{
    constructor(message , statusCode){
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'Failed' : 'Error'; // if status code starts with 4 then fialed and else it is a error
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = appErrors