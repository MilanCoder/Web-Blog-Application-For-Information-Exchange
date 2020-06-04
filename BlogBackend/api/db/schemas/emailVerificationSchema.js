const mongoose= require('../connection');

const EmailVerifySchema=new mongoose.Schema({
    email:String,
    verifyId:String,
    isVerified:{type:Boolean,default:false}
})

module.exports=mongoose.model('emailVerifications',
EmailVerifySchema);
