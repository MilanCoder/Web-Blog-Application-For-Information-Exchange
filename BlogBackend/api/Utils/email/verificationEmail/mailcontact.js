
const ejs = require('ejs');
const emailpath = __dirname + "/views/emailVerification.ejs";
function userTemplate(userdata, res) {
    //  console.log(path);
    var pr = new Promise((resolve, reject) => {
        if (userdata.action == 'em') {
            let url = userdata.link + "?verifyId=" + res.verifyId;
            console.log(url);
            ejs.renderFile(emailpath, { link: url }, (err, str) => {
                if (err) {
                    console.log("error while reading the template ", err);
                    reject(err);
                }
                else {
                    resolve(str);
                }
            })
        } else {
            reject('Illegal Param');
        }
    });
    return pr;
}
module.exports = userTemplate;  