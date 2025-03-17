const mongoose = require('mongoose')
require('dotenv').config()
const connectionString = process.env.MONGODB_CONNECTION

function connectDB(){
    mongoose.connect(connectionString)
        .then(console.log('database is connected'))
        .catch((err)=>{
            console.log('big failure')
        })
}
module.exports = connectDB;