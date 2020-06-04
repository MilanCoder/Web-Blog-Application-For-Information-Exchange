const express= require('express');
const CustomerRoutes= express.Router();
const async= require('async');
const BlogCrud=require('../db/crudOperations/blogCrud');
const TeacherCrud=require('../db/crudOperations/teacherCrud');
const CatCrud=require('../db/crudOperations/categoryCrud');
const config=require('../Utils/statusconfig');
const jwt=require('jsonwebtoken');
const jwtVerification = require('../Utils/jwt/jwtverify');
const StudentCrud=require('../db/crudOperations/studentCrud');
const checkCategoryData=require('../Utils/middleware/checkCategoryData');
const checkBlogData=require('../Utils/middleware/checkBlogData');

CustomerRoutes.get('/getCategories',(req,res)=>{
 
 async.waterfall([
     CatCrud.getCategories()
 ],(err,result)=>{
     if(err){
res.status(422).json({status:config.ERROR,message:err});
     }else{
 res.status(200).json({status:config.SUCCESS,result:result})
     }
 })
})

CustomerRoutes.get('/teacherAuthorData',(req,res)=>{
    async.waterfall([
        TeacherCrud.getTeacherMainDetails(req.query.id)
    ],(err,result)=>{
        if(err){
            res.status(422).json({status:config.ERROR,message:err});
                 }else{
             res.status(200).json({status:config.SUCCESS,result:result})
                 }
    })
})

CustomerRoutes.get('/getIdoflogInUser',(req,res)=>{
    let bearerHeader = req.headers['studentauthorization'];
        
    if(typeof bearerHeader!= 'undefined'){
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
      
     jwt.verify(bearerToken,jwtVerification.studentSecurekey,(err, authData) => {
        if (err) {
       
            let bearerHeader = req.headers['teacherauthorization'];
        
            if(typeof bearerHeader!= 'undefined'){
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
               
         jwt.verify(bearerToken,jwtVerification.teacherSecurekey,(err, authData) => {
            if (err) {
           
                res.status(422).json({status:config.ERROR,message:'Please Login First For Commenting'});
    
    
            } else {
                res.status(200).json({status:config.SUCCESS,result:authData.teacherData})
    
            }})
            }


        } else {
            res.status(200).json({status:config.SUCCESS,result:authData.studentData})

        }})
    }else{
        // res.status(422).json({status:config.ERROR,message:'Please Login First For Commenting'});
        let bearerHeader = req.headers['teacherauthorization'];
        
        if(typeof bearerHeader!= 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
           
     jwt.verify(bearerToken,jwtVerification.teacherSecurekey,(err, authData) => {
        if (err) {
       
            res.status(422).json({status:config.ERROR,message:'Please Login First For Commenting'});


        } else {
            res.status(200).json({status:config.SUCCESS,result:authData.teacherData})

        }})
        }
    }
})

CustomerRoutes.get('/teacherinfo',(req,res)=>{
 async.waterfall([
 BlogCrud.getTeacherBlogMap(req.query),
  TeacherCrud.getTeacherFromBlogId()

 ],(err,result)=>{
    if(err){
        res.status(422).json({status:config.ERROR,message:err});
             }else{
         res.status(200).json({status:config.SUCCESS,result:result})
             }
 })


})



CustomerRoutes.get('/getBlogOfCategory', (req, res) => {
    async.waterfall([
        BlogCrud.getBlogOfCategory(req.query)
    ], (err, data) => {
        if (err) {
            res.status(422).json({ status: config.ERROR, message: err });
        } else {
            res.status(200).json({ status: config.SUCCESS, data })
        }
    })
})

CustomerRoutes.get('/getBlog', (req, res) => {
    async.waterfall([
        BlogCrud.getBlogTopic(req.query.id),
        BlogCrud.getBlogTemplate()
    ], (err, data) => {
        if (err) {
            res.status(422).json({ status: config.ERROR, message: err });
        } else {
            res.status(200).json({ status: config.SUCCESS, data })
        }
    })
})

CustomerRoutes.get('/searchBlog', (req, res) => {
    async.waterfall([
        BlogCrud.searchBlog(req.query.key)
    ], (err, blogs) => {
        if (err) {
            res.status(422).json({ status: config.ERROR, message: err });
        } else {
            res.status(200).json({ status: config.SUCCESS, blogs })
        }
    })
}),

CustomerRoutes.get('/getComments',(req,res)=>{
async.waterfall([
  StudentCrud.getComments(req.query.id)
],(err,result)=>{
    if (err) {
        res.status(422).json({ status: config.ERROR, message: err });
    } else {
        res.status(200).json({ status: config.SUCCESS, comments:result })
    }
})
})




module.exports=CustomerRoutes;