const express = require('express');
const teacherRoutes = express.Router();

const teacherCrud = require('../db/crudOperations/teacherCrud');
const blogCrud = require('../db/crudOperations/blogCrud');
const categoryCrud=require('../db/crudOperations/categoryCrud');
const passwordEncryptor = require('../Utils/passwordEncryptor');
const jwtVerification = require('../Utils/jwt/jwtverify');
const jwt = require('jsonwebtoken')
const config = require('../Utils/statusconfig')
const mailfn = require('../Utils/email/verificationEmail/contactusmail');
const async=require('async')
const idGen = require('../Utils/idGen');
const mailPass=require('../Utils/email/passwordRecover/passwordContantmail');

teacherRoutes.post('/signUp', (req, res) => {
    var obj = {
        id: null,
        type: 'TH',
        name: req.body.name,
        email: req.body.email,
        password: passwordEncryptor.generatePassHash(req.body.password,10),
        verified: false,
        empverified:false,
        rejected:false,
        phoneno: req.body.phoneno,
        documentLink: req.body.documentLink,
        link: req.body.link,
        data: req.body.data,
        action: req.body.action
    }
    if (obj.name && obj.password && obj.email && obj.phoneno&& obj.documentLink) {
        obj.id = idGen.idgenerator(obj.type);
            async.waterfall([    
            teacherCrud.checkAlreadyAcc(obj),
            teacherCrud.signUp(obj),
            teacherCrud.saveEmailObjStatus(obj),
            mailfn(obj)
        ], (err, doc) => { if (err) {
                console.log(err)
                res.status(409).json({ status: config.ERROR, message: `Please enter all the details${err}` });
            } else { res.status(200).json({
                    status: config.SUCCESS,
                    message: 'In order to Proceed please verify your Email Address'
                });}})}
    else {
        res.status(409).json({ status: config.ERROR, message: 'Please enter all the details' });
    }
})
 
teacherRoutes.post('/login', async function (req, res) {

    try{

    var teacherData = await teacherCrud.login({ 'email': req.body.email, 'password': req.body.password });
    //console.log(teacherData);
    if (teacherData) {
        //compare the hashed password
        jwt.sign({teacherData}, jwtVerification.teacherSecurekey, { expiresIn: jwtVerification.teacherExpiryTime }, (err, token) => {
            //token is generated after checking the presence of user
            if (err) {
                res.status(409).json({ message: 'Session Timeout' });
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
        res.status(409).json({ message: 'Session Timeout' });
    }
}
catch(err){
    res.status(422).json({ status: config.ERROR, message: 'user not found' });
}
})

teacherRoutes.get('/setEmailStatus', (req, res) => {
    if (req.query.verifyId != null) {
        async.waterfall([ //this should be done differently for teacher
            teacherCrud.setEmailVerificationStatus(req.query.verifyId),
            teacherCrud.setAccountVerifyStatus()
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

teacherRoutes.get('/getStudentDetails', (req, res) => {
    console.log(req.query)
    async.waterfall([
        teacherCrud.getStudentMainDetails(req.query.id)
    ], (err, result) => {
        if (err) {
            res.status(409).json({ status: config.ERROR, message: err });
        } else {
            res.status(200).json({ status: config.SUCCESS, result });
        }
    })
})


teacherRoutes.post('/saveBlog',jwtVerification.teacherverifyToken, (req, res) => {
    //check if account is valid or not using student crud
    //save blog using blog crud
    //use series

    jwt.verify(req.teacherToken, jwtVerification.teacherSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'Session Timeout' });
        } else {
            async.waterfall([
            teacherCrud.isAllowedChanges(req.body,authData.teacherData.id),
              teacherCrud.saveBlog(req.body)
              
            ], (err, result) => {
                if (err) {
                    res.status(500).json({ status: config.ERROR, message: err });
                }
                else {
                    res.status(200).json({ status: config.SUCCESS, message:result});
                }
            })
        }
    })
    
})

teacherRoutes.get('/getMyBlogs',jwtVerification.teacherverifyToken, (req, res) => {
    //use jwt check
    //call teacherCrud
    jwt.verify(req.teacherToken, jwtVerification.teacherSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'Session Timeout' });
        } else {
            async.waterfall([
                teacherCrud.getTeacherBlogs(authData.teacherData.id),
                teacherCrud.getMyBlogs()
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

teacherRoutes.get('/getPersonalInfo',jwtVerification.teacherverifyToken, (req, res) => {
    //use jwt check
    //call teacherCrud
    jwt.verify(req.teacherToken, jwtVerification.teacherSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'Session Timeout' });
        } else {
            async.waterfall([
                teacherCrud.getPersonalInfo(authData.teacherData.id)
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
teacherRoutes.post('/updateProfile',jwtVerification.teacherverifyToken, (req, res) => {
    //use jwt check
    //call teacherCrud
    jwt.verify(req.teacherToken, jwtVerification.teacherSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'Session Timeout' });
        } else {
            async.waterfall([
                teacherCrud.updateProfile(authData.teacherData.id,req.body)
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


teacherRoutes.post('/allowMeToEdit',jwtVerification.teacherverifyToken, (req, res) => {
    //use jwt check
    //call teacherCrud
    jwt.verify(req.teacherToken, jwtVerification.teacherSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'Session Timeout' });
        } else {
            async.waterfall([ 
                teacherCrud.setChangeStatus(req.body,authData.teacherData.id)
            ],(err,result)=>{
                if(err){
                    res.status(409).json({ status: config.ERROR, message: err });
                }else{
                    res.status(200).json({ status: config.SUCCESS, result });
                }
            })
           
        }}
        )
    })

// teacherRoutes.get('/getBlog',jwtVerification.teacherverifyToken, (req, res) => {
//     //use jwt check
//     //call teacherCrud
//     jwt.verify(req.teacherToken, jwtVerification.teacherSecurekey, (err, authData) => {
//         if (err) {
//             res.status(409).json({ message: 'Session Timeout' });
//         } else {
//             //console.log(req.query)
//             async.waterfall([
//                 blogCrud.getBlogTopic(req.query.id),
//                 blogCrud.getBlogTemplate()
//             ], (err, data) => {
//                 if (err) {
//                     res.status(422).json({ status: config.ERROR, message: err });
//                 } else {
//                     res.status(200).json({ status: config.SUCCESS, data })
//                 }
//             })
//         }
//     })
// })

teacherRoutes.get('/getCategoryList',(req,res)=>{
    console.log('here');
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

teacherRoutes.post('/createBlog',jwtVerification.teacherverifyToken, (req, res) => {
   
    jwt.verify(req.teacherToken, jwtVerification.teacherSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'Session Timeout' });
        } else {
    
       async.waterfall([
         
           teacherCrud.createBlog(req.body,authData.teacherData.id),
           teacherCrud.createMap(authData.teacherData.id)
           
       ],(err,result)=>{
        if (err) {
            res.status(422).json({ status: config.ERROR, message: err });
        } else {
            res.status(200).json({ status: config.SUCCESS, result })
        }
       })

        }})
    })


teacherRoutes.get('/getBlog',jwtVerification.teacherverifyToken, (req, res) => {
   
    jwt.verify(req.teacherToken, jwtVerification.teacherSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'Session Timeout' });
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


teacherRoutes.get('/getNonPublishedNewBlogs',(req,res)=>{
    async.waterfall([
        blogCrud.getNonPublishedArticles(),
        teacherCrud.getNonPublishedMap()
    ],(err,result)=>{
        if (err) {
            res.status(409).json({ status: config.ERROR, message: err });
        } else {
            res.status(200).json({ status: config.SUCCESS, blogs:result });
        }
    })
})


teacherRoutes.get('/checkLogin', jwtVerification.teacherverifyToken, (req, res) => {
    jwt.verify(req.teacherToken, jwtVerification.teacherSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'Session Timeout' });
        } else {
            //console.log(authData.teacherData);
            res.status(200).json({ message: 'user has valid token' })
        }
    })
})

teacherRoutes.post('/publishBlog', jwtVerification.teacherverifyToken, (req, res) => {
    jwt.verify(req.teacherToken, jwtVerification.teacherSecurekey, (err, authData) => {
        if (err) {
            res.status(409).json({ message: 'Session Timeout' });
        } else {
            //console.log(authData.teacherData);
           async.waterfall([
               teacherCrud.isAllowedChanges(req.body,authData.teacherData.id),
               blogCrud.publishArticle(req.body)
           ],(err,result)=>{
            if (err) {
                res.status(422).json({ status: config.ERROR, message: err });
            } else {
                res.status(200).json({ status: config.SUCCESS, result })
            }
           })
        }
    })
})

teacherRoutes.post('/recoverPass',(req,res)=>{

    if(req.body.email!=null){
     
        async.waterfall([
            teacherCrud.checkAccountValid(req.body),
            teacherCrud.savepasswordRecover(req.body),
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
    


teacherRoutes.post('/setNewPass',(req,res)=>{
    if(req.body.password!=null){
        
      async.waterfall([
          teacherCrud.setPassChangeStatus(req.body),
          teacherCrud.updatePass(req.body)
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





module.exports = teacherRoutes;