const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_');
const idGen={

    nosplit(no){
    let strlength= no.length;
    no = no.slice(strlength-2,strlength);
     return no;
    },

    idgenerator(no)
    {  // console.log(no,typeof(no));
        if(no!=null&& typeof(no)=="string"){
        let str;
        let random=shortid.generate()

        str= random + this.nosplit(no);
    

    return str;
    }
    else{
        return null;
    }
    }
}


module.exports=idGen;
