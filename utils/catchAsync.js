// Purpose: The catchAsync function is a higher-order function that wraps an asynchronous function (fn). 
//It ensures that any errors occurring within the async function are caught and passed to the next middleware (usually an error-handling middleware).
// In our case fn is getalltour , addtour , deletetour , updatetour, getstats,..... once there is a error in the promise it goes to 
// error handling middleware


// Parameters:
// fn: An asynchronous function that takes req, res, and next as arguments. should be same as getalltour , add tour... cause those are the async functions that fn refering to

// Returns: A new function that:

// Calls the original async function with req, res, and next.
// Attaches a .catch(next) to the promise returned by the async function to catch any errors and pass them to the next middleware.



// Utility function to handle async functions and catch errors
const catchAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next); // Call the async function and pass errors to the error handling middleware
    }
}

module.exports = catchAsync