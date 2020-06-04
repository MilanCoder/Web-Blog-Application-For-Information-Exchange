const config=require('../statusconfig');
const async= require('async');
const StudentCrud=require('../../db/crudOperations/studentCrud');
module.exports = (req, res, next) => {
    if (obj.name && obj.password && obj.email && obj.rollno) {
        async.waterfall([
            StudentCrud.checkAlreadyAcc(obj)
        ], (err, doc) => {
            if (err) {
                res.status(409).json({ status: config.ERROR, message: err })
            } else {
                next();
            }
        })
    } else {
        next();
    }
}