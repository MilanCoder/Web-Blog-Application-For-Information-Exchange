const express=require('express');
const studentRoutes=express.Router();
const studentCrud=require('../db/crudOperations/studentCrud');
const blogCrud = require('../db/crudOperations/blogCrud');
const categoryCrud=require('../db/crudOperations/categoryCrud')
//const passwordEncryptor = require('../../Utils/passwordEncryptor');
const jwtVerification = require('../Utils/jwt/jwtverify');
const idGen=require('../Utils/idGen');
const jwt=require('jsonwebtoken');
const passwordEncryptor=require('../Utils/passwordEncryptor');
const async=require('async');
const config=require('../Utils/statusconfig');
const mailPass =require('../Utils/email/passwordRecover/passwordContantmail');
const mailfn=require('../Utils/email/verificationEmail/contactusmail');

studentRoutes.post('/signUp', (req, res) => {
    var obj = {
        id: null,
        type: 'ST',
        name: req.body.name,
        email: req.body.email,
        password: passwordEncryptor.generatePassHash(req.body.password,10),
        rollno: req.body.rollno,
        verified: false,
        link: req.body.link,
        data: req.body.data,
        action: req.body.action
    }

    if (obj.name && obj.password && obj.email && obj.rollno) {
        obj.id = idGen.idgenerator(obj.type);
        //   console.log(obj);
        async.waterfall([
            studentCrud.signUp(obj),
            studentCrud.saveEmailObjStatus(obj),
            mailfn(obj)
        ], (err, doc) => {
            if (err) {
                res.status(409).json({ status: config.ERROR, msg: 'Please enter all the details' });

            } else {
                res.status(200).json({
                    status: config.SUCCESS,
                    msg: 'In order to Proceed please verify your Email Address'
                });}})}
    else {
        res.status(409).json({ status: config.ERROR, msg: 'Please enter all the details' });
    }})


studentRoutes.post('/recoverPass',(req,res)=>{

if(req.body.email!=null){
 
    async.waterfall([
        studentCrud.checkAccountValid(req.body),
        studentCrud.savepasswordRecover(req.body),
        mailPass(req.body)
    ],(err,result)=>{
        if(err){
            res.status(409).json({status:config.ERROR,message:err});
        }else {
            res.status(200).json({status:config.SUCCESS,result});
        }
    })

}else{
    res.status(409).json({ status: config.ERROR, message: 'Invalid Email' });

}

})


studentRoutes.post('/setNewPass',(req,res)=>{
    if(req.body.password!=null){
        
      async.waterfall([
          studentCrud.setPassChangeStatus(req.body),
          studentCrud.updatePass(req.body)
      ],(err,result)=>{
        if(err){
            res.status(409).json({status:config.ERROR,message:err});
        }else {
            res.status(200).json({status:config.SUCCESS,result});
        }
      })
    }else{
        res.status(409).json({ status: config.ERROR, message: 'Empty Password' });

    }
})


    studentRoutes.post('/login', async function (req, res) {

        try{
    
        var studentData = await studentCrud.login({ 'email': req.body.email, 'password': req.body.password });
       
       // console.log(studentData);
        if (studentData) {
            jwt.sign({studentData}, jwtVerification.studentSecurekey,
                 { expiresIn: jwtVerification.studentExpiryTime }, (err, token) => {
                //token is generated after checking the presence of user
                
                if (err) {
                    console.log(err);
                    res.status(409).json({ message: 'JWT Error' });
                }
                else {
                    res.status(200).json({
                        token: token,
                        logged: true
                    })
                }
    
            })
        }
        else {
            res.status(409).json({ message: 'JWT Error' });
        }
    }
    catch(err){
        console.log(err);
        res.status(422).json({ status: config.ERROR, message: 'user not found' });
    }
    })



studentRoutes.get('/setEmailStatus', (req, res) => {
    if (req.query.verifyId != null) {
        async.waterfall([
            studentCrud.setEmailVerificationStatus(req.query.verifyId),
            studentCrud.setAccountVerifyStatus()
        ], (err, result) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<html>');
            res.write('<head>');
            res.write('<title>Email Verification</title>');
            res.write('</head>');
            res.write('<body>');
            res.write('<div>');
            if (err) {
                res.write("Error Occured " + err);
            } else {
                res.write('Email is verified you may login in your account');
            }
            res.write('</div>')
            res.write('</body>');
            res.write('</html>');
            res.end();
        })
    }
})




studentRoutes.get('/getStudentDetails',(req,res)=>{
    console.log(req.query)
    async.waterfall([
        studentCrud.getStudentMainDetails(req.query.id)
    ],(err,result)=>{
        if(err){
            res.status(409).json({status:config.ERROR,message:err});
        }else {
            res.status(200).json({status:config.SUCCESS,result});
        }
    })
})

studentRoutes.post('/saveBlog',jwtVerification.studentverifyToken, (req, res) => {
    //check if account is valid or not using student crud
    //save blog using blog crud
    //use series

    jwt.verify(req.studentToken, jwtVerification.studentSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'JWT Error' });
        } else {
            async.waterfall([
                studentCrud.checkIfVerifiedUser(authData.studentData.id),
                blogCrud.saveBlog(req.body,authData.studentData.id),
                blogCrud.indexBlog()
            ], (err, data) => {
                if (err) {
                    res.status(500).json({ status: config.ERROR, message: err });
                }
                else {
                    res.status(200).json({ status: config.SUCCESS, message:data });
                }
            })
        }
    })
    
})

studentRoutes.get('/getMyBlogs',jwtVerification.studentverifyToken, (req, res) => {
    //use jwt check
    //call studentCrud
    jwt.verify(req.studentToken, jwtVerification.studentSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'JWT Error' });
        } else {
            async.waterfall([
                studentCrud.getMyBlogs(authData.studentData.id)
            ],(err,result)=>{
                if (err) {
                    console.log(err)
                    res.status(409).json({ status: config.ERROR, message: err });
                } else {
                    res.status(200).json({ status: config.SUCCESS, result });
                }
            }) 
        }
    })
})

studentRoutes.get('/getPersonalInfo',jwtVerification.studentverifyToken, (req, res) => {
    //use jwt check
    //call studentCrud
    jwt.verify(req.studentToken, jwtVerification.studentSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'JWT Error' });
        } else {
            async.waterfall([
                studentCrud.getPersonalInfo(authData.studentData.id)
            ],(err,result)=>{
                if (err) {
                    console.log(err)
                    res.status(409).json({ status: config.ERROR, message: err });
                } else {
                    res.status(200).json({ status: config.SUCCESS, result });
                }
            }) 
        }
    })
})
studentRoutes.post('/updateProfile',jwtVerification.studentverifyToken, (req, res) => {
    //use jwt check
    //call studentCrud
    jwt.verify(req.studentToken, jwtVerification.studentSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'JWT Error' });
        } else {
            async.waterfall([
                studentCrud.updateProfile(authData.studentData.id,req.body)
            ],(err,result)=>{
                if (err) {
                    console.log(err)
                    res.status(409).json({ status: config.ERROR, message: err });
                } else {
                    res.status(200).json({ status: config.SUCCESS, result });
                }
            }) 
        }
    })
})

studentRoutes.get('/getBlog',jwtVerification.studentverifyToken, (req, res) => {
    //use jwt check
    //call studentCrud
    jwt.verify(req.studentToken, jwtVerification.studentSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'JWT Error' });
        } else {
            //console.log(req.query)
            async.waterfall([
                blogCrud.getBlogTopic(req.query.id),
                blogCrud.getBlogTemplate(),
                blogCrud.checkIfTeacherTaken()
            ], (err, data) => {
                if (err) {
                    res.status(422).json({ status: config.ERROR, message: err });
                } else {
                    res.status(200).json({ status: config.SUCCESS, data })
                }
            })
        }
    })
})



studentRoutes.get('/getCategoryList',(req,res)=>{
    async.waterfall([
        categoryCrud.getCategories()
    ],(err,result)=>{
        if (err) {
            res.status(409).json({ status: config.ERROR, message: err });
        } else {
            res.status(200).json({ status: config.SUCCESS, result });
        }
    })
})

studentRoutes.get('/checkLogin', jwtVerification.studentverifyToken, (req, res) => {
    jwt.verify(req.studentToken, jwtVerification.studentSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'JWT Error' });
        } else {
            //console.log(authData.studentData);
            res.status(200).json({ message: 'user has valid token' })
        }
    })
})

studentRoutes.post('/comment', (req, res) => {
   
        async.waterfall([
        studentCrud.commentOnBlog(req.body),
    
        ],(err,result)=>{
            if (err) {
                res.status(422).json({ status: config.ERROR, message: err });
            } else {
                res.status(200).json({ status: config.SUCCESS, result })
            }
        })

})

studentRoutes.get('/checkIfAlreadyVoted',jwtVerification.studentverifyToken, (req, res) => {
    jwt.verify(req.studentToken, jwtVerification.studentSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'Please Sign In To vote' });
        } else {
            console.log(req.query);
            async.waterfall([
                studentCrud.checkIfAlreadyVoted(req.query,authData.studentData)
            ],(err,result)=>{
                if (err) {
                    res.status(422).json({ status: config.ERROR, message: err });
                } else {
                    res.status(200).json({ status: config.SUCCESS, result })
                }
            })
    

        }})
    })

    studentRoutes.get('/upVote',jwtVerification.studentverifyToken, (req, res) => {
        jwt.verify(req.studentToken, jwtVerification.studentSecurekey, (err, authData) => {
            if (err) {
                res.status(409).json({ message: 'Please Sign In To vote' });
            } else {
              
                async.waterfall([
                   studentCrud.checkBlogUserSchemaPresent(req.query,authData.studentData),
                studentCrud.upVote(req.query)
                ],(err,result)=>{
                    if (err) {
                        res.status(422).json({ status: config.ERROR, message: err });
                    } else {
                        res.status(200).json({ status: config.SUCCESS, result })
                    }
                })
        
    
            }})
        })
    
        studentRoutes.get('/downVote',jwtVerification.studentverifyToken, (req, res) => {
            jwt.verify(req.studentToken, jwtVerification.studentSecurekey, (err, authData) => {
                if (err) {
                    res.status(409).json({ message: 'Please Sign In To vote' });
                } else {
                  
                    async.waterfall([
                       studentCrud.checkBlogUserSchemaPresent(req.query,authData.studentData),
                    studentCrud.downVote(req.query)
                    ],(err,result)=>{
                        if (err) {
                            res.status(422).json({ status: config.ERROR, message: err });
                        } else {
                            res.status(200).json({ status: config.SUCCESS, result })
                        }
                    })
            
        
                }})
            })
        
    




module.exports=studentRoutes;