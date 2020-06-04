const mongoose= require('../connection');

const PasswordRecoversSchema=new mongoose.Schema({
    email:String,
    verifyId:String,
    isVerified:{type:Boolean,default:false}
})

module.exports=mongoose.model('passwordrecovers',
PasswordRecoversSchema);
