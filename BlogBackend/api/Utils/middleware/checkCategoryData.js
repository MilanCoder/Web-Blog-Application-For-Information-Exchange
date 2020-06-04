

const config=require('../statusconfig');
module.exports=(req,res,next)=>{
if(req.body.catName==null){
    res.status(409).json({status:config.ERROR,
        message:'Insufficient Data Provided'})
}else{
    next();
}
}