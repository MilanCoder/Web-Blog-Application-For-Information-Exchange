const mongoose=require('../connection');
const Schema= mongoose.Schema;

const CategorySchema= new Schema({
    catId:String,
    catName:String,
    active:{
        type:Boolean,
        default:false
    }
})

module.exports= mongoose.model('category',CategorySchema)