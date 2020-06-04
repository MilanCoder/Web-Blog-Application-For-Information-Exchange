const express= require('express');
const AdminRoutes= express.Router();
const async= require('async');
const AdminCrud=require('../db/crudOperations/adminCrud');
const BlogCrud=require('../db/crudOperations/blogCrud');
const CatCrud=require('../db/crudOperations/categoryCrud');
const config=require('../Utils/statusconfig');
const checkCategoryData=require('../Utils/middleware/checkCategoryData');
const checkBlogData=require('../Utils/middleware/checkBlogData');
const adminjwt=require('../Utils/jwt/jwtverify');
const jwt=require('jsonwebtoken');
const mailfn=require('../Utils/email/verificationEmail/userverificationcontactmail');

AdminRoutes.post('/saveCategory', adminjwt.adminverifyToken,
    checkCategoryData, (req, res) => {
        jwt.verify(req.admintoken, adminjwt.adminSecurekey, 
            (error, authData) => {
            if (error) {
                res.status(401).json({
                    status: config.ERROR,
                    message: "Session TimeOut ,Please login again"
                });
            }
            else {
                async.waterfall([
                    CatCrud.saveCategory(req.body)
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

AdminRoutes.post('/deleteCategory', adminjwt.adminverifyToken, checkCategoryData, (req, res) => {
    jwt.verify(req.admintoken, adminjwt.adminSecurekey, (error, authData) => {
        if (error) {
            res.status(401).json({ status: config.ERROR,
                 message: "Session TimeOut ,Please login again" });
        }
        else {
            async.waterfall([
                CatCrud.deleteCategory(req.body)
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

AdminRoutes.post('/verifyEmp',adminjwt.adminverifyToken,(req,res)=>{
    jwt.verify(req.admintoken, adminjwt.adminSecurekey, (error, authData) => {
        if (error) {
            res.status(401).json({ status: config.ERROR,
                 message: "Session TimeOut ,Please login again" });
        }
        else {
           
            let obj={
                email:'',
                data:{
                    subject:"Employee User Verification"
                },
                action:"vr"

            }
            async.waterfall([
                AdminCrud.verifyEmp(req.body.id),
                function(info,cb){
                 obj.email=info.email;
                 cb(null,info);
                },
                mailfn(obj)
            ],(err,result)=>{
                if (err) {
                    res.status(422).json({ status: config.ERROR, message: err });
                } else {
                    res.status(200).json({ status: config.SUCCESS, verified:true })
                }

            })
        }
    })
})
AdminRoutes.post('/rejectEmp',adminjwt.adminverifyToken,(req,res)=>{
    jwt.verify(req.admintoken, adminjwt.adminSecurekey, (error, authData) => {
        if (error) {
            res.status(401).json({ status: config.ERROR,
                 message: "Session TimeOut ,Please login again" });
        }
        else {
             console.log(req.body.id);
             let obj={
                 email:'',
                 data:{
                     subject:"Rejection Email"
                 },
                 action:"rj"

             }
            async.waterfall([
                AdminCrud.rejectEmp(req.body.id),
                function(info,cb){
                  obj.email=info.email;
                  cb(null,info);
                },
                mailfn(obj)
            ],(err,result)=>{
                if (err) {
                    res.status(422).json({ status: config.ERROR, message: err });
                } else {
                    res.status(200).json({ status: config.SUCCESS, rejected:true })
                }

            })
        }
    })
})



AdminRoutes.get('/getUnverifiedTeachers',adminjwt.adminverifyToken,(req,res)=>{
    jwt.verify(req.admintoken, adminjwt.adminSecurekey, (error, authData) => {
        if (error) {
            res.status(401).json({ status: config.ERROR,
                 message: "Session TimeOut ,Please login again" });
        }
        else {
            async.waterfall([
                AdminCrud.getunverifiedTeachers()
            ],(err,result)=>{
                if (err) {
                    res.status(422).json({ status: config.ERROR, message: err });
                } else {
                    res.status(200).json({ status: config.SUCCESS, teacher:result })
                }
            })
   
        }
    })
})


AdminRoutes.get('/getVerifiedTeachers',adminjwt.adminverifyToken,(req,res)=>{
    jwt.verify(req.admintoken, adminjwt.adminSecurekey, (error, authData) => {
        if (error) {
            res.status(401).json({ status: config.ERROR,
                 message: "Session TimeOut ,Please login again" });
        }
        else {
            async.waterfall([
                AdminCrud.getVerifiedTeachers()
            ],(err,result)=>{
                if (err) {
                    res.status(422).json({ status: config.ERROR, message: err });
                } else {
                    res.status(200).json({ status: config.SUCCESS, teacher:result })
                }
            })
   
        }
    })
})

AdminRoutes.post('/login', (req, res) => {
    if (req.body.email && req.body.password) {
        async.waterfall([
            AdminCrud.login(req.body)
        ], (err, result) => {
            if (err) {
                res.status(422).json({ status: config.ERROR, message: err });
            } else {
                jwt.sign(req.body, adminjwt.adminSecurekey, 
                    { expiresIn: adminjwt.adminExpiryTime }, (err, token) => {
                    //token is generated after checking the presence of user
                    if (err) {
                        console.log(err);
                        res.status(500).json({ status: config.ERROR, message: 'Jwt error' });
                    }
                    else {
                        res.status(200).json({
                            status: config.SUCCESS,
                            token: token,
                            logged: true
                        }
                        )
                    }
                })
            }
        })

    } else {
        res.status(422).json({ status: config.ERROR, message: 'Illegal Param' });
    }
})

module.exports=AdminRoutes;