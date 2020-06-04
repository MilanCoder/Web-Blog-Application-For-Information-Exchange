const AdminSchema=require('../schemas/adminSchema');
const idGen=require('../../Utils/idGen');
const teacheSchema =require('../schemas/teacherSchema').teachers;

const adminCrud={
   
    login(obj){
        return function(cb){
            AdminSchema.admin.findOne({email:obj.email,password:obj.password},
                (err,doc)=>{
                if(err){
cb('DB error');
                }else if(doc==null){
                    cb('No Admin Found');
                }else{
                    cb(null,doc);
                }
            })
        }
    },

verifyEmp(id){
    return function(cb){
        teacheSchema.findOneAndUpdate({ id:id,verified:true, empverified:false,rejected:false},{$set:{empverified:true}},(err,doc)=>{
            if(err){
              cb('DB Error');
            }else if(doc==null){
                cb('No User Found');
            }
            else {
                cb(null,doc);
            }
        })
   
          }
}
,


rejectEmp(id){
 return function(cb){
    teacheSchema.findOneAndUpdate({ id:id,verified:true,rejected:false},{$set:{rejected:true}},(err,doc)=>{
        if(err){
          cb('DB Error');
        }else if(doc==null){
            cb('No User Found');
        }
        else {
            cb(null,doc);
        }
    })

      }
},

   getunverifiedTeachers(){
        return function(cb){
     teacheSchema.find({verified:true, empverified:false,rejected:false},(err,doc)=>{
         if(err){
           cb('DB Error');
         }else {
             cb(null,doc);
         }
     })

       }
   },
   getVerifiedTeachers(){
    return function(cb){
 teacheSchema.find({verified:true, empverified:true,rejected:false},(err,doc)=>{
     if(err){
       cb('DB Error');
     }else {
         cb(null,doc);
     }
 })

   }
},
getRejectedTeachers(){
    return function(cb){
 teacheSchema.find({rejected:true},(err,doc)=>{
     if(err){
       cb('DB Error');
     }else {
         cb(null,doc);
     }
 })

   }
}

}
module.exports=adminCrud;