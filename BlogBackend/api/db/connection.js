const mongoose=require('mongoose');
const config=require('../config/dbconfig');

mongoose.connect(config.url,(err)=>{
    if(err){
console.log('ERR DB CONNECTION');
    }else{
        console.log('DB CONNECTED');
    }
})

module.exports=mongoose;