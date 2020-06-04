const async = require('async');
const BlogSchema=require('../schemas/BlogSchema');
const teacherBlogSchema=require('../schemas/teacherBlogMapSchema');
const BlogTemplate= require('../schemas/BlogTemplate');
const idGen= require('../../Utils/idGen');

const BlogCrud={


    getNonPublishedArticles(){
      return function(cb){
   BlogSchema.find({published:false},(err,doc)=>{
       if(err){
           cb('DB Error');
       }else {
           cb(null,doc);
       }
   })


      }
    },


    getTeacherBlogMap(obj){
        return function(cb){
            teacherBlogSchema.findOne({blogId:obj.id},(err,doc)=>{
                if(err){
                 cb('DB Error');
                }else if(doc==null){
                  cb('No Teacher Found');
                    }else{
                    cb(null,doc);
                }
            })
        }
    },



    publishArticle(obj){
        return function(info,cb){
            BlogSchema.findOneAndUpdate({blogId:obj.blogId},{$set:{published:true}},(err,doc)=>{
                if(err){
                  cb('DB error');
                }else if(doc==null){
             cb('No Document Found');
                }else{
                   cb(null,doc);
                }
            })
  
    }},

    getBlogOfCategory(obj){
        return function(cb){
           BlogSchema.find({catId:obj.catId,published:true},(err,doc)=>{
               if(err){
              cb('DB error')
               }else {
                   cb(null,doc);
               }
           })
        }
    },
    saveBlog(obj,id){
     //   console.log(obj)
        return function(info,cb){
            let arr=obj.content.map((cont)=>{
                return new BlogTemplate.ContentTemplate({
                  priority:cont.priority,
                  type:cont.type,
                  subHeading:cont.subHeading,
                  data:cont.data
                })
            })
      if(obj.blogId!=null){
        BlogSchema.findOneAndUpdate({blogId:obj.blogId,published:false},{$set:{
            catId:obj.catId,
            topic:obj.topic,  
            userId:obj.userId,
            thumbnail:obj.thumbnail,
            stars:{
                value:0,
                users:0
            }
        }},(err,doc)=>{
            if(err){
                cb('dB Error');
             }else if(doc==null){
           cb('No Blog Found ');
             }else{
             BlogTemplate.BlogTemplate.findOneAndUpdate({ blogId:obj.blogId},{$set:{
                content:arr
             }},{new:true},(err,doc)=>{
                 if(err){
                     cb('DB error');
                 }else if(doc==null){
                  cb('Schema and Template not in sync');
                 }else{
                     console.log(doc);
                    cb(null,{isCreated:true});
                 }
             })
      
             }
        })
    }else{
       if(obj.published==null || obj.published==false){
        let blog= new BlogSchema({
            catId:obj.catId,
            blogId:idGen.idgenerator('BL'),
            topic:obj.topic,  
            userId:id,
            thumbnail:obj.thumbnail,
            published:false,
            stars:{
                value:0,
                number:0
            }
          })
         
       
          let blogTemplate = new BlogTemplate.BlogTemplate({
              blogId:blog.blogId,
              content:arr,
              
          })

          blog.save((err)=>{
              if(err){
                  console.log(err)
                  cb('DB error');
              }else{
                  blogTemplate.save(err=>{
                      if(err){
                          console.log(err);
                          cb('DB Error');
                      }else{
                          cb(null,{isCreated:true});
                      }
                  })
              }
          })
        }else{
            cb('Already published article');
        }
    }

              
        }
    },
    indexBlog(){
    return((info,cb)=>{
        //    Products.SubProduct.syncIndexes(err=>{
        //        cb(null,true);
        //    })

          BlogSchema.ensureIndexes((err)=>{
                 if(err){
                     console.log(err);
                     return cb('DB Error');
                 }else{
                     cb(null,info);
                 }
             })
            })}
    ,

    getBlogTopic(id){
        return ((cb)=>
        {
            BlogSchema.findOne({blogId:id},(err,doc)=>{
                if(err){
cb('DB Error')
                }else if(doc==null){
cb('No Blog Found')
                }else{
                    cb(null,doc)
                }
            })
        })
    },

    getBlogTemplate(){
        return ((info,cb)=>{
            BlogTemplate.BlogTemplate.findOne({blogId:info.blogId},(err,doc)=>{
                if(err){
                    cb('DB Error')
                                    }else if(doc==null){
                    cb('No Blog Found')
                                    }else{
                                        cb(null,{
                                          blogTopic:info,
                                          blogTemplate:doc
                                        })
                                    }
            })
        })
    },

    
    searchBlog(blogname){
        return (cb=>{
            BlogSchema.find({$text:{$search:blogname},published:true},(err,doc)=>{
          if(err){
cb('DB Error')
          }else {
              cb(null,doc)
          }
            })
        })

    },

    checkIfTeacherTaken(){
    return ((info,cb)=>{
       
    teacherBlogSchema.findOne({blogId:info.blogTopic.blogId},(err,doc)=>{
        if(err){
             cb('DB Error');
        }else if(doc==null){
            cb(null,info);
        }else{ 
          let obj={
             blogTopic:info.blogTopic,
             blogTemplate:info.blogTemplate,
             taken:true,
             teacher:doc
          }
        
          cb(null,obj);
        }
    })


    })
    }

}

module.exports= BlogCrud;