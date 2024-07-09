const dotenv = require('dotenv')
dotenv.config();
const mongoose = require('mongoose')
const app = require('./app')
//console.log(process.env);

mongoose.connect(process.env.MONGODB , {
}).then(con=>{
    
    console.log("connection established") // when the connection is established
});



const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("The server is running on port 5000");
});
