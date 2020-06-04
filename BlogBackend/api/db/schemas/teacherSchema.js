const mongoose=require("../connection");
//const Schema= mongoose.Schema;

 const teachers= new mongoose.Schema({
     name:String,
     id:String,
     //add url for the profile pic
     dpLink:String,
     password:String,
     email:String,
     type:String,
     phoneno:String,
     documentLink:String,
     verified:{type:Boolean,default:false},
     empverified:{type:Boolean,default:false},
     rejected:{type:Boolean,default:false}
 },{timestamps:true})

module.exports={
    teachers:mongoose.model('teachers',teachers)
}
