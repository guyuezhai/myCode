module.exports = {

    isPhoneNum : function(phone){

        const REG_PHONE = /^1[3|5|7|8]\d{9}$/;
        return REG_PHONE.test(phone);
    
    },
        
    isEmail : function(email){

        const REG_EMAIL = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
        return REG_EMAIL.test(email);
        
    }

}