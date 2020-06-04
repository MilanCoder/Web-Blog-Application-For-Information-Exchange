const nodemailer = require("nodemailer");
const userTemplate=require('./mailcontact');
function mailPass(userdata) { 
  console.log(userdata);
 return function(res,cb){
    userTemplate(userdata,res).then(data=> {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
               user: 'engblog98@gmail.com', 
               pass: 'engblog1234' 
           }
       });
       const mailOptions = {
        from: 'doNotReply@engBlog.com',  
        to: userdata.email, 
        subject: userdata.data.subject, 
        html: data 
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if(err){
        console.log(err);
        cb('Email Error');
        }
        else
        //  console.log(info);
          cb(null,res);
     });
    }).catch(err=> {
   //  console.log(err);
cb(err);
    })
  
  }
}
module.exports=mailPass;