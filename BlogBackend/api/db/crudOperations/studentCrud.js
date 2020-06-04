const student=require('../schemas/studentSchema');
const emailVerificatinSchema=require('../schemas/emailVerificationSchema');
const idGen=require('../../Utils/idGen');
const passwordEncrpytor=require('../../Utils/passwordEncryptor');
const blogs=require('../schemas/BlogSchema');
const BlogTemplate =require('../schemas/BlogTemplate');
const commentSchema=require('../schemas/commentSchema');
const StarSchema =require('../schemas/starSchema');
const PasswordRecoverSchema=require('../schemas/passwordRecoverSchema');
// const logger=require('../../Utils/winstonLogger');

const studentCrud={
  
    signUp(obj){
        return function(cb){
        student.students.create(obj,(err)=>{
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
        var pr=await student.students.findOne({email:obj.email,verified:true});
        if(pr){
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

    checkAlreadyAcc(obj){
        return function(cb){
            student.students.findOne({email:obj.email,verified:true},
                (err,doc)=>{
                if(err){
                  cb('DB Error');
                }else if(doc!=null){
                    cb('User Already Exist');
                }else{
                    cb(null,obj);
                }
            })
        }
    },

    checkIfVerifiedUser(userId){
        return function(cb){
            student.students.findOne({id:userId,verified:true},(err,result)=>{
                if(err){
                    cb('DB Error');
                }
                else if(result==null){
                    cb('No such student present');
                }
                else{
                    cb(null,{isPresent:true})
                }
            })
        }
    },

setStudentVerified(obj){
    return function(info,cb){
student.students.findOneAndUpdate({email:obj.email},
    {$set:{isVerified:true}},(err,doc)=>{
    if(err){
cb('DB Error');
    }else if(doc==null){
cb('No Such email present')
    }else{
cb(null,true);
    }
})
    }
},

saveEmailObjStatus(obj){
    return function(info,cb){
 let emailschema =  new emailVerificatinSchema({
        email:obj.email,
        verifyId:idGen.idgenerator(obj.email),
        isVerified:false
    })

    emailschema.save(err=>{
        if(err){
            cb('DB Error');

        }else{
            return cb(null,emailschema)
        }
    })}
},


checkAccountValid(obj){
    return cb=>{
        student.students.findOne({email:obj.email,verified:true},(err,doc)=>{
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
updatePass(obj){
return (info,cb)=>{
    student.students.findOneAndUpdate({email:info.email,verified:true},
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


setAccountVerifyStatus(){
    return function(info,cb){
        student.students.findOneAndUpdate({email:info.email},
            {$set:{verified:true}},(err,doc)=>{
            if(err){
                cb('DB Error');
                            }else if(doc==null){
                cb('No Email Account Found');
                            }else{
                cb(null,doc);
                            }
        })
    }
}
,
 
 setEmailVerificationStatus(id){
        return function(cb){
            emailVerificatinSchema.findOneAndUpdate({verifyId:id},
                {$set:{isVerified:true}},(err,doc)=>{
                if(err){
    cb('DB Error');
                }else if(doc==null){
    cb('No Email Account Found');
                }else{
    cb(null,doc);
                }
            })
        }
    },
    getPersonalInfo(userId){
        return function(cb){
            student.students.findOne({id:userId,verified:true},(err,doc)=>{
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
            student.students.findOneAndUpdate({id:userId,verified:true},{$set:
                {name:formData.name,
               dpLink:formData.dpLink
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
    getMyBlogs(id){
        return function(cb){
            blogs.find({userId:id},(err,docs)=>{
                if(err){
                    cb('DB Error');
                }
                else if(docs==null){
                    cb("You don't have any blogs");
                }
                else{
                    cb(null,docs)
                }
            })
        }
        
    },
    getStudentMainDetails(id) {
        return (cb => {
            console.log(id);
            student.students.findOne({ id: id }, (err, doc) => {
                if (err) {
                    cb('DB Error');

                } else if (doc == null) {
                    cb("Invalid User's Blog")

                } else {
                    cb(null, {
                        name: doc.name,
                        email: doc.email,
                        rollno: doc.rollno,
                        dpLink:doc.dpLink,
                    });
                }
            })
        })
    },

    commentOnBlog(obj,id){
        return (cb=>{
            console.log(obj);
         let comment= new  commentSchema({
             blogId:obj.blogId,
             userId:obj.userId,
             description:obj.description
         })
         console.log(comment);
          comment.save(err=>{
              if(err){
                  cb('DB/Schema Error');
              }else{
                  cb(null,comment);
              }
          })
         
        })
    },

    getComments(id){
    return (cb=>{
        commentSchema.find({blogId:id},(err,doc)=>{
            if(err){
                cb('DB/Error');
            }else{
                cb(null,doc);
            }
        })
    })
    },

    checkIfAlreadyVoted(obj,user){
     return (cb=>{
         console.log(obj,'here');
       StarSchema.findOne({blogId:obj.blogId,userId:user.id},(err,doc)=>{
           if(err){
               cb('DB/Schema Error');
           }else if(doc==null){
               cb(null,{isAlreadyVoted:false});
           }else
           {
cb(null,{isAlreadyVoted:true})
           }
       })
      })
    }

    // saveCommentInBlog(obj){
    //     return ((info,cb)=>{
    //          BlogTemplate.findOneAndUpdate({blogId:obj.blogId},{$push:{
    //              comments:info._id
    //          }},(err,doc)=>{
    //              if(err){
    //                  cb('DB Error');
    //              }else{
    //                  cb(null,doc);
    //              }
    //          })
    //     })
    // }
    ,
    upVote(obj){
        return (info,cb)=>{
            blogs.findOneAndUpdate({blogId:obj.blogId,published:true},{$inc:{'stars.value':1,'stars.users':1}},(err,doc)=>{
                if(err){
                    cb('DB Error');
                }else if(doc==null){
                    cb('Blog Not Yet Published');
                }else{
                    cb(null,{updated:true});
                }
            })
               
          }
    },

    downVote(obj){
       
        return (info,cb)=>{
          blogs.findOneAndUpdate({blogId:obj.blogId,published:true},{$inc:{'stars.value':-1,'stars.users':1}},(err,doc)=>{
              if(err){
                  cb('DB Error');
              }else if(doc==null){
                  cb('Blog Not Yet Published');
              }else{
                  cb(null,{updated:true});
              }
          })
             
        }
    },

    checkBlogUserSchemaPresent(obj,user){
        return (cb)=>{
            StarSchema.findOne({blogId:obj.blogId,userId:user.id},(err,doc)=>{
                if(err){
                    cb('DB Error');
                }else if(doc==null){

                    let newStar=new StarSchema({
                        blogId:obj.blogId,
                        userId:user.id
                    })
                    
                     newStar.save(err=>{
                         if(err)
                         {
                             cb('DB /Schema Error');
                         }else {
                             cb(null,newStar);
                         }
                     })


                }else{
                    cb('Already Upvoted');
                }
            })
        }
    }

}

module.exports=studentCrud;