const mongoose=require('../connection');

const CommentSchema=new mongoose.Schema({
  blogId:{type:String,required:true},
  description:{type:String,required:true},
  userId:{type:String,required:true}
})


module.exports=mongoose.model('comments',CommentSchema);