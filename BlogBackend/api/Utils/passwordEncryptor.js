const bcrypt = require('bcrypt');
const passwordEncryptor = {
    generatePassHash(plainText,salt){
        
        let password=null;
        if(plainText!=null){
         password= bcrypt.hashSync(plainText, salt, function(err, hash) {
          if(err){
              return err;
          }else{
            return hash
        }});
    }
return password;
}
,
verifyPassword(plainText,hash){

   if(hash!=null){
       try{
           let isPresent=false;
       isPresent=bcrypt.compareSync(plainText, hash);
        if(isPresent==true){
           return true
        }else{
            return false;
        }
       }catch(e){
     return false;
       }
    }
}

}

module.exports=passwordEncryptor;