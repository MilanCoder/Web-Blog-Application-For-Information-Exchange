const mongoose= require('../connection');

const Schema=mongoose.Schema;

const BlogSchema=new Schema({
    catId:String,
    blogId:String,
    topic:String,
    userId:String,
    thumbnail:String,
    published:Boolean,
    stars:{
        value:Number,
        users:Number
    }
    
},{timestamps:true})

BlogSchema.index({
topic:'text'
})

module.exports=mongoose.model('Blogs',BlogSchema);