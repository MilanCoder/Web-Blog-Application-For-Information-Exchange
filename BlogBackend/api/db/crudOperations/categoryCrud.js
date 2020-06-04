const async= require('async');
const CategorySchema= require('../schemas/CategorySchema');
const idGen= require('../../Utils/idGen');
const CategoryCrud={
 
    getCategories(){
      return function(cb){
          CategorySchema.find({},(err,doc)=>{
            if(err){
cb('DB Error');
            }else if(doc.length==0){
               cb('No Doc Found')
            }else{
      cb(null,doc);
            }
          })
      }
    }
    ,
    saveCategory(obj){
        return function(cb){
            CategorySchema.findOneAndUpdate({catId:obj.catId},{$set:{
              catName:obj.catName,
              active:obj.active
            }},(err,doc)=>{
              if(err){
                cb('DB Error');
              }else if(doc==null){
                
               let schema= new CategorySchema({
                   catId:idGen.idgenerator('CT'),
                   catName:obj.catName,
                   active:obj.active
               })

               schema.save(err=>{
                   if(err){
             cb('DB Error');
                   }else{
            cb(null,{isCreated:true})
                   }
               })

              }else{
                cb(null,{isCreated:true})
              }
            })
        }
      },
    
deleteCategory(obj){
return function(cb){
  CategorySchema.findOneAndDelete({catId:obj.catId},(err,doc)=>{
    if(err){
      cb('DB Error');
        
    }else if(doc==null){
cb('No Doc Found');
    }else{
cb(null,{isDeleted:true});
    }
  })
}
}
}

module.exports=CategoryCrud;