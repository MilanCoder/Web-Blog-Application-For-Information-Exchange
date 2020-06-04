const jwtVerification={
    adminSecurekey:'adminhere',
    studentSecurekey:'studenthere',
     teacherSecurekey:'custhere',
    // empSecurekey:'emphere',
    // delBoySecurekey:'delboyhere',
    // custExpiryTime:'1000000s',
    adminExpiryTime:'1000000s',
    studentExpiryTime:'1000000s',
    teacherExpiryTime:'1000000s',
    // delboyExpiryTime:'1000000s',


     adminverifyToken(req,res,next){   
         console.log(req.headers);            //checking for webtoken in the header of req and filling it into req.token
        let bearerHeader = req.headers['adminauthorization'];
       // console.log(bearerHeader);
        if(typeof bearerHeader!= 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.admintoken= bearerToken;
        next();
        
        }else{
            res.status(403).json({message:'Session TimeOut ,Please login again'});
        }
    
    },
    studentverifyToken(req,res,next){      
                 //checking for webtoken in the header of req and filling it into req.token
               //  console.log(req.headers);
        let bearerHeader = req.headers['studentauthorization'];
        
        if(typeof bearerHeader!= 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.studentToken= bearerToken;
        next();
        
        }else{
            res.status(403).json({message:'Session TimeOut ,Please login again'});
        }
     } ,

      teacherverifyToken(req,res,next){               //checking for webtoken in the header of req and filling it into req.token
        let bearerHeader = req.headers['teacherauthorization'];
        
        if(typeof bearerHeader!= 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.teacherToken= bearerToken;
        next();
        
        }else{
            res.status(403).json({message:'Session TimeOut ,Please login again'});
        }
    }

    // delboyverifyToken(req,res,next){               //checking for webtoken in the header of req and filling it into req.token
    //     let bearerHeader = req.headers['delboyauthorization'];
        
    //     if(typeof bearerHeader!= 'undefined'){
    //     const bearer = bearerHeader.split(' ');
    //     const bearerToken = bearer[1];
    //     req.delboytoken= bearerToken;
    //     next();
        
    //     }else{
    //         res.status(403).json('Session TimeOut ,Please login again');
    //     }
    // }

}

module.exports=jwtVerification;