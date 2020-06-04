
const ejs = require('ejs');
const veremailpath = __dirname + "/views/adminEmpVerification.ejs";
const rejemailpath=__dirname + "/views/adminEmpReject.ejs";
function userTemplate(userdata, res) {
    //  console.log(path);
    var pr = new Promise((resolve, reject) => {
        if (userdata.action == 'vr') {
          
            ejs.renderFile(veremailpath, {name:res.name,id:res.id}, (err, str) => {
                if (err) {
                    console.log("error while reading the template ", err);
                    reject(err);
                }
                else {
                    resolve(str);
                }
            })
        } else if(userdata.action=='rj'){
            ejs.renderFile(rejemailpath, {name:res.name,id:res.id}, (err, str) => {
                if (err) {
                    console.log("error while reading the template ", err);
                    reject(err);
                }
                else {
                    resolve(str);
                }
            })
        }
        
        
        else {
            reject('Illegal Param');
        }
    });
    return pr;
}
module.exports = userTemplate;  