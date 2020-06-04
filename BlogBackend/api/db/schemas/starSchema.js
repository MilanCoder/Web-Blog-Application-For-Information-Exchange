const mongoose = require('../connection');

const StarSchema = new mongoose.Schema({
     userId:String,
     blogId:String,
})


module.exports=mongoose.model('stars',StarSchema);