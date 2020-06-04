const config=require('../statusconfig');
module.exports=(req,res,next)=>{
   // console.log(req.body)
    if (req.body.catId == null) {
        res.status(409).json({
            status: config.ERROR,
            message: 'Insufficient Data Provided'
        })
    } else {
        next();
    }
}