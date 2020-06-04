const mongoose=require("../connection");
//const Schema= mongoose.Schema;

 const admin= new mongoose.Schema({
     name:String,
     password:String,
     email:String,
 },{timestamps:true})

module.exports={
    admin:mongoose.model('admins',admin)
}
