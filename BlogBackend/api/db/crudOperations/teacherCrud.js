const teacher=require('../schemas/teacherSchema');
const emailVerificatinSchema=require('../schemas/emailVerificationSchema');
const blogs=require('../schemas/BlogSchema')
const idGen=require('../../Utils/idGen');
const async=require('async');
const   PasswordRecoverSchema=require('../schemas/passwordRecoverSchema');
const TeacherBlogMap=require('../schemas/teacherBlogMapSchema');
const passwordEncrpytor=require('../../Utils/passwordEncryptor');
const BlogTemplate=require('../schemas/BlogTemplate');
// const logger=require('../../Utils/winstonLogger');

const teacherCrud={
    signUp(obj){
        return function(info,cb){
            console.log(cb,obj)
        teacher.teachers.create(obj,(err)=>{
            if(err){
               cb('Some error Occured');
            }
            else{
               cb(null,true);
            }
        })
    }
    },

    async login(obj){
        console.log(obj.email)
        var pr=await teacher.teachers.findOne({email:obj.email,verified:true,empverified:true});
        console.log(pr);
        if(pr){
            console.log(pr);
            if(passwordEncrpytor.verifyPassword(obj.password,pr.password)){
                return new Promise((resolve,reject)=>{
                    //console.log(pr)
                    resolve(pr);
                })
            }
            else{
                return new Promise((resolve,reject)=>{
                    reject();
                }) 
            }
        }
        else{
            return new Promise((resolve,reject)=>{
                reject();
            })
        }
            
    },

    checkAccountValid(obj){
        return cb=>{
            teacher.teachers.findOne({email:obj.email,verified:true},(err,doc)=>{
                if(err){
                    cb('DB Error');
                }else if(doc==null){
                    cb('No Email Present In Database');
                }else{
                    cb(null,obj);
                }
            })
        }
    },
    
savepasswordRecover(obj){
    return function(info,cb){
 let passSchema =  new PasswordRecoverSchema({
        email:obj.email,
        verifyId:idGen.idgenerator(obj.email),
        isVerified:false
    })

    passSchema.save(err=>{
        if(err){
            cb('DB Error');

        }else{
            return cb(null,passSchema)
        }
    })}
},


    
updatePass(obj){
    return (info,cb)=>{
        teacher.teachers.findOneAndUpdate({email:info.email,verified:true},
            {$set:{password:passwordEncrpytor.generatePassHash(obj.password,10)}},(err,doc)=>{
            if(err){
                cb('DB Error');
            }else if(doc==null){
                cb('No User Found');
            }else{
                 cb(null,doc);
            }
        })
    }
    }
    
    ,
    setPassChangeStatus(obj){
        return cb=>{
            PasswordRecoverSchema.findOneAndUpdate({verifyId:obj.id,isVerified:false},{$set:{ isVerified:true}},(err,doc)=>{
                if(err){
                    cb('DB Error');
    
                }else if(doc==null){
    cb('No User Found')
                }else{
                    cb(null,doc);
                }
            })
        }
    }
    ,

    checkIfVerifiedUser(userId){
        return function(cb){
            teacher.teachers.findOne({id:userId,verified:true,empverified:true,rejected:false},(err,result)=>{
                if(err){
                    cb('DB Error');
                }
                else if(result==null){
                    cb('No such Teacher present');
                }
                else{
                    cb(null,{isPresent:true})
                }
            })
        }
    },
    checkAlreadyAcc(obj) {
        return function (cb) {
            teacher.teachers.findOne({ email: obj.email }, (err, doc) => {
                if (err) {
                    cb('DB Error');
                } else if (doc != null) {
                    cb('User Already Exist');
                } else {
                    cb(null, obj);
                }
            })
        }
    },
    setStudentVerified(obj) {
        return function (info, cb) {
            teacher.teachers.findOneAndUpdate({ email: obj.email }, { $set: { isVerified: true } },
              (err, doc) => {
                if (err) {
                    cb('DB Error');
                } else if (doc == null) {
                    cb('No Such email present')
                } else {
                    cb(null, true);
                }
            })
        }
    },
    saveEmailObjStatus(obj) {
        return function (info, cb) {
            let emailschema = new emailVerificatinSchema({
                email: obj.email,
                verifyId: idGen.idgenerator(obj.email),
                isVerified: false
            })

            emailschema.save(err => {
                if (err) {
                    cb('DB Error');

                } else {
                    return cb(null, emailschema)
                }
            })
        }

    },
    setAccountVerifyStatus() {
        return function (info, cb) {
            teacher.teachers.findOneAndUpdate({ email: info.email }, { $set: { verified: true } },
              (err, doc) => {
                if (err) {
                    cb('DB Error');
                } else if (doc == null) {
                    cb('No Email Account Found');
                } else {
                    cb(null, doc);
                }
            })
        }
    }
    ,
    setEmailVerificationStatus(id) {
        return function (cb) {
            emailVerificatinSchema.findOneAndUpdate({ verifyId: id }, { $set: { isVerified: true } },
              (err, doc) => {
                if (err) {
                    cb('DB Error');
                } else if (doc == null) {
                    cb('No Email Account Found');
                } else {
                    cb(null, doc);
                }
            })
        }
    }, 

    getMyBlogs(){
        return function(info,cb){
            let arrayob=[];
            async.map(info,(obj,incb)=>{
               blogs.findOne({blogId:obj.blogId},(err,doc)=>{
                    if(err){
              return incb('DB Error');
                    }else if(doc!=null){
                       arrayob.push(doc);
                       incb();
                    }else{
                        incb();
                    }
                })
            },(err,result)=>{
                if(err){
                    cb(err);
  
                }else{
                    console.log(arrayob);
                    cb(null,arrayob);
                }
            })
  
  
          }
        
    },

    getNonPublishedMap(){
        
        return function(info,cb){
            let array=[];
          async.map(info,(obj,incb)=>{
              TeacherBlogMap.findOne({blogId:obj.blogId},(err,doc)=>{
                  if(err){
                     return   incb('DB Error');
                  }else if(doc==null){
                      array.push(obj);
                    incb();
                  }else{
                      incb();
                  }
              })
          },(err,result)=>{
              if(err){
                  cb(err);

              }else{
                  cb(null,array);
              }
          })


        }
    }
,

createBlog(obj,id){
    //   console.log(obj)
       return function(cb){
           let arr=obj.content.map((cont)=>{
               return new BlogTemplate.ContentTemplate({
                 priority:cont.priority,
                 type:cont.type,
                 subHeading:cont.subHeading,
                 data:cont.data
               })
           })
           let blog= new blogs({
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
                          cb(null,blog);
                      }
                  })
              }
          })
  
             
       }
   }
,

saveBlog(obj){
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
       blogs.findOneAndUpdate({blogId:obj.blogId},{$set:{
           catId:obj.catId,
           topic:obj.topic,  
           thumbnail:obj.thumbnail
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
       cb('Invalid Blog Id');
   }

             
       }
   },

  getTeacherBlogs(id){
      return function(cb){
          TeacherBlogMap.find({teacherId:id},(err,doc)=>{
              if(err){
                  cb('DB Error');
              }else {
                  cb(null,doc);
              }
          })
      }
  }
   ,


    getPersonalInfo(userId){
        return function(cb){
            teacher.teachers.findOne({id:userId,verified:true,empverified:true,rejected:false},(err,doc)=>{
                if(err){
                    cb('DB Error');
                }
                else if(doc==null){
                    cb("No such user present");
                }
                else{
                    cb(null,doc)
                }
            })
        }
    },
    updateProfile(userId,formData){
        return function(cb){
            teacher.teachers.findOneAndUpdate({id:userId,verified:true},{$set:{
                dpLink:formData.dpLink,
                documentLink:formData.documentLink
            }},(err)=>{
                if(err){
                    cb('DB Error');
                }
                else{
                    cb(null,{isUpdated:true})
                }
            })
        }
    },
    getTeacherMainDetails(id) {
        return (cb => {
            console.log(id);
            teacher.teachers.findOne({ id: id }, (err, doc) => {
                if (err) {
                    cb('DB Error');

                } else if (doc == null) {
                    cb("Invalid User's Blog")

                } else {
                    cb(null, {
                        name: doc.name,
                        email: doc.email,
                        
                    });
                }
            })
        })
    },

    createMap(id){
        return ((obj,cb)=>{
           
                        let mp=new TeacherBlogMap({
                            blogId:obj.blogId,
                            teacherId:id
                        })

                        mp.save(err=>{
                            if(err){
                                cb('DB Error');
                                
                            }else{
                                cb(null,mp);
                            }
                        })
                    })   
    },

    setChangeStatus(obj,id){
        return ((cb)=>{
              TeacherBlogMap.findOne({blodId:obj.blogId},(err,doc)=>{
                  if(err){
                      cb('DB Error');
                  }else if(doc!=null){
                      cb('Already Teacher Working On It');
                  }else{
                        let mp=new TeacherBlogMap({
                            blogId:obj.blogId,
                            teacherId:id
                        })

                        mp.save(err=>{
                            if(err){
                                cb('DB Error');
                                
                            }else{
                                cb(null,{isChanged:true});
                            }
                        })
                  }
              })
        })
    },

    isAllowedChanges(obj,id){
        return (cb=>{
            TeacherBlogMap.findOne({blogId:obj.blogId,teacherId:id},(err,doc)=>{
                if(err){

                }else if(doc==null){
                    cb('You Not Allowed To Make Changes');
                }else{
                    cb(null,doc);
                }
            })
        })
    },
    getTeacherFromBlogId(){
        return function(info,cb){
       console.log(info);
            teacher.teachers.findOne({id:info.teacherId},(err,doc)=>{
                if(err){
           cb('DB Error');
                }else if(doc==null){
                    cb('No Teacher Found');
                }
                else{
                    cb(null,doc);
                }
            })
        }
    },


    

}

module.exports=teacherCrud;