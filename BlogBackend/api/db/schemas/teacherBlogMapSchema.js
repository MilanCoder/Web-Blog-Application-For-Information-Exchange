const mongoose =require('../connection');

const Schema= mongoose.Schema;

const TeacherBlogMap=new Schema({
  
    teacherId:String,
    blogId:String
     

},{timestamps:true})

module.exports=mongoose.model('teacherBlogmaps',TeacherBlogMap);