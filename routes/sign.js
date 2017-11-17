const Router = require('koa-router');
const SHA1 = require('crypto-js/sha1');
const Uuid = require('node-uuid');
const BMP24 = require('gd-bmp').BMP24;

const AccountConfirmTable = require('../db/account_confirm_table');
const OrderResetPwdTable = require('../db/order_resetpwd_table');
const SettingTable = require('../db/setting');
const UserTable = require('../db/user_table');

const ResponseUtils = require('../utils/response_utils');
const ResultCode = require('../utils/result_code');
const CryptoUtils = require('../utils/crypto_utils');
const CacheUtils = require('../utils/cache_utils');
const StrUtils = require('../utils/str_utils');
const RegUtils = require('../utils/reg_utils');
const config = require( "../config");


const router = new Router();

const QUEUE_EMAIL = "queue_email";
const EmailResetPwdExpireTime = 36000; //一小时
const cookiesExpire = 24 * 3600 * 1000 * 30;

const SALT_LEN = 8;
const RESET_PWD_TITTLE = 'email.resetpwd.title';
const RESET_PWD_TEMPLATE = 'email.resetpwd.template';
const CONFIRM_TITTLE = 'email.account.confirm.title';
const CONFIRM_TEMPLATE = 'email.account.confirm.template';
const REG_VERIFY_CODE = 'regVerifyCode';
const CAPCHA_CODE = 'CapchaCode';
const RES_VERIFY_CODE = 'resetVerifyCode';

const HTTP_HEADER  = {

    'Content-Type' : 'application/json', 
    'Encoding' : 'utf8',

};

const signin = async function(ctx){
    
    let phone = ctx.request.body.phone;
    let email = ctx.request.body.email;
    let callback = ctx.request.body.callback;
    
    if ( phone ){

        await signinByPhone(ctx);

    }

    else if( email ){

        await signinByEmail(ctx);
      
    }


};

const signinByPhone = async function(ctx,next){

    ctx.set(HTTP_HEADER);

    let phone = ctx.request.body.phone;
    let password = ctx.request.body.password;
    let callback = ctx.request.body.callback;

    if( !phone || !password){
        ctx.body = ResponseUtils.genError(ResultCode.NO_REQUIRED_PARAMS,callback);
        return;
    }

    if(!RegUtils.isPhoneNum(phone)){
        
        ctx.body = ResponseUtils.genError(ResultCode.ILLEGAL_PARAMS, callback);
        return;

    }

    let getPhoneUser = await UserTable.getByPhone(phone);

    if(!getPhoneUser){

        ctx.body = ResponseUtils.genError(ResultCode.NO_USER_EXIST, callback);
        return;

    }

    let salt = getPhoneUser.salt;

    if(!salt){

        ctx.body = ResponseUtils.genError(ResultCode.NO_USER_SALTA, callback);
        return;

    }

    let PASSWORD = SHA1(password + salt).toString();

    let pwd = getPhoneUser.hash_password;

    if(!pwd){

        ctx.body = ResponseUtils.genError(ResultCode.NO_USER_PWD, callback);
        return;

    }
    if(pwd !== PASSWORD){

        ctx.body = ResponseUtils.genError(ResultCode.ERROR_PASSWORD, callback);
        return;
        
    }

    let id = getPhoneUser.id;
    let hashPassword = pwd;
    let token = CryptoUtils.encrypt(`${id}&${hashPassword}`);
    token = token.toString();

    let domain = ctx.hostname;
    domain = (domain == 'localhost')?"":domain;
    let days = new Date(Date.now() + cookiesExpire);

    let options = {
        expires: days,
        path:'/',
        domain: domain,
        secure: false,
        httpOnly: true
    }
   
    let cookie = ctx.cookies.set('token', token, options);

    let result = {};

    let go = ctx.query.go;
    if( go !=null){
        result = {
            data: go
        };
    }

    ctx.body = ResponseUtils.genResult(result, callback);
 
}

const signinByEmail = async function(ctx,next){
    
    ctx.set(HTTP_HEADER);

    let email = ctx.request.body.email;
    let password = ctx.request.body.password;
    let callback = ctx.request.body.callback;

 

    if(!email || !password){
        ctx.body = ResponseUtils.genError(ResultCode.NO_REQUIRED_PARAMS,callback);
        return;
    }

    if(!RegUtils.isEmail(email)){
        
        ctx.body = ResponseUtils.genError(ResultCode.ILLEGAL_PARAMS, callback);
        return;

    }

    let getEmailUser = await UserTable.getByEmail(email);

    if(!getEmailUser){

        ctx.body = ResponseUtils.genError(ResultCode.NO_USER_EXIST, callback);
        return;

    }

    let confirmed = getEmailUser.confirmed;

    if(!confirmed){
        ctx.body = ResponseUtils.genError(ResultCode.NO_CONFIRMED, callback);
        return;
    }

    let salt = getEmailUser.salt;

    if(!salt){

        ctx.body = ResponseUtils.genError(ResultCode.NO_USER_SALTA, callback);
        return;

    }

    let PASSWORD = SHA1(password + salt).toString();

    let pwd = getEmailUser.hash_password;

    if(!pwd){

        ctx.body = ResponseUtils.genError(ResultCode.NO_USER_PWD, callback);
        return;

    }
    if(pwd !== PASSWORD){

        ctx.body = ResponseUtils.genError(ResultCode.ERROR_PASSWORD, callback);
        return;
        
    }

    let id = getEmailUser.id;
    let hashPassword = pwd;

    let token = CryptoUtils.encrypt(`${id}&${hashPassword}`);
    token = token.toString();

    let domain = ctx.hostname;
    domain = (domain == 'localhost')?"":domain;
    let days = new Date(Date.now() + cookiesExpire);
    let options = {
        expires: days,
        path:'/',
        domain: domain,
        secure: false,
        httpOnly: true
    }
   
    let cookie = ctx.cookies.set('token', token, options);

    let result = {};

    let go = ctx.query.go;
    if( go !=null){
        result = {
            data: go
        };
    }

    ctx.body = ResponseUtils.genResult(result, callback);

}

const signup = async function (ctx) {


    let phone = ctx.request.body.phone;
    let email = ctx.request.body.email;
    let callback = ctx.request.body.callback;

    if( phone ){

        await signupByPhone(ctx);
      
    }

    else if( email ){

        await signupByEmail(ctx);

    }

 
};

const signupByPhone = async function(ctx, next){
    ctx.set(HTTP_HEADER);

    let phone = ctx.request.body.phone;
    let name = ctx.request.body.name;
    let password1 = ctx.request.body.password1;
    let password2 = ctx.request.body.password2;
    let captcha = ctx.request.body.captcha;
    let callback = ctx.request.body.callback;

    if(!name || !phone || !password1 || !password2 || !captcha){
        
        ctx.body = ResponseUtils.genError(ResultCode.NO_REQUIRED_PARAMS, callback);
        return;

    }

    if(!RegUtils.isPhoneNum(phone)){

        ctx.body = ResponseUtils.genError(ResultCode.ILLEGAL_PARAMS, callback);
        return;

    }

    let result = await UserTable.getByPhone(phone);
    
    if(result){

        ctx.body = ResponseUtils.genError(ResultCode.ALREADY_EXIST, callback);
        return; 

    }
    
    if(password1 !== password2){

        ctx.body = ResponseUtils.genError(ResultCode.DIFFERENT_PASSWORD, callback);
        return;      

    }

    let cacheCode = await CacheUtils.get(REG_VERIFY_CODE+phone);
    
    if(captcha !== cacheCode){

        ctx.body = ResponseUtils.genError(ResultCode.ERROR_VERIFY_CODE, callback);
        return;  

    }

    let salt = StrUtils.genStrCode(SALT_LEN);

    let password = SHA1(password1 + salt).toString();

    let userParams = {

        account: phone,
        password: password,
        salt: salt,
        name: name

    }
    
    let add = await UserTable.addByPhone(userParams);

    if(add){

        ctx.body = ResponseUtils.genResult({phone:phone}, callback);
        return; 
    
    }

    ctx.body = ResponseUtils.genError(ResultCode.FAILED, callback);
    return;  
    

}

const signupByEmail = async function(ctx,next){
    ctx.set(HTTP_HEADER);
 
    let email = ctx.request.body.email;
    let name = ctx.request.body.name;
    let password1 = ctx.request.body.password1;
    let password2 = ctx.request.body.password2;
    let captcha = (ctx.request.body.captcha).toLowerCase();
    let callback = ctx.request.body.callback;

    if(!name || !email || !password1 || !password2 || !captcha){
        
        ctx.body = ResponseUtils.genError(ResultCode.NO_REQUIRED_PARAMS, callback);
        return;

    }

    if(!RegUtils.isEmail(email)){

        ctx.body = ResponseUtils.genError(ResultCode.ILLEGAL_PARAMS, callback);
        return;

    }

    if(password1 !== password2){

        ctx.body = ResponseUtils.genError(ResultCode.DIFFERENT_PASSWORD, callback);
        return;      

    }

    let cacheCode = await CacheUtils.get(CAPCHA_CODE+captcha);
    
    if( !cacheCode || captcha == !cacheCode ){

        ctx.body = ResponseUtils.genError(ResultCode.ERROR_VERIFY_CODE, callback);
        return;  

    }

    let salt = StrUtils.genStrCode(SALT_LEN);

    let password = SHA1(password1 + salt).toString();

    let userParams = {

        account: email,
        password: password,
        salt: salt,
        name:name

    }

    let result = await UserTable.getByEmail(email);
    
    if(result){
        let confirmed = result.confirmed;
        
        if(confirmed){

            ctx.body = ResponseUtils.genError(ResultCode.ALREADY_EXIST, callback);
            return; 
    
        }

        
        let update = await UserTable.updatePasswordByEmail(userParams);
        
        if(!update){
            ctx.body = ResponseUtils.genError(ResultCode.UPDATE_FAILED, callback);
            return;
        }
    
    }

    if(!result){
        let add = await UserTable.addByEmail(userParams);
    
        if(!add){
            ctx.body = ResponseUtils.genError(ResultCode.ADD_FAILED, callback);
            return;
        }
    
    }

    let getUser = await UserTable.getByEmail(email);

    let userId = getUser.id;
    
    let getConfirmTable = await AccountConfirmTable.getById(userId);

    if(!getConfirmTable){
        let key = Uuid.v4();
        let params = {
            userId: userId,
            key: key
        }

        await AccountConfirmTable.add(params);
            
    }

    let getConfirmTableOnce = await AccountConfirmTable.getById(userId);
    
    if(!getConfirmTableOnce){
        ctx.body = ResponseUtils.genError(ResultCode.NOT_EXIST,callback);
        return;
    }
    let key = getConfirmTableOnce.key;
    let success = await sendConfirmEmail( email, key);

    if(success){
        ctx.body = ResponseUtils.genResult({email:email}, callback);
        return; 
    }

    ctx.body = ResponseUtils.genError(ResultCode.FAILED, callback);
    return;  

}

const resetPwdCheck = async function(ctx){

    let phone = ctx.request.body.phone;
    let email = ctx.request.body.email;
    let callback = ctx.request.body.callback;

    if( phone ){

        await checkPhone(ctx);
        
    }

    if( email ){

        await checkEmail(ctx);
          
    }

}

const checkPhone = async function(ctx, next){
    ctx.set(HTTP_HEADER);

    let phone = ctx.request.body.phone;
    let captcha = (ctx.request.body.captcha).toLowerCase();
    let callback = ctx.request.body.callback;

    if( !phone  || !captcha){
        ctx.body = ResponseUtils.genError(ResultCode.NO_REQUIRED_PARAMS,callback);
        return;
    }

    if(!RegUtils.isPhoneNum(phone)){
        ctx.body = ResponseUtils.genError(ResultCode.ILLEGAL_PARAMS,callback);
        return;
    }
    let result = await UserTable.getByPhone(phone);
    if(!result){
        ctx.body = ResponseUtils.genError(ResultCode.NO_USER_EXIST, callback);
        return;
    }
    let cacheCode = await CacheUtils.get(CAPCHA_CODE+captcha);
    if(!cacheCode || captcha !== cacheCode){
        ctx.body = ResponseUtils.genError(ResultCode.ERROR_VERIFY_CODE,callback);
        return;
    }

    ctx.body = ResponseUtils.genResult({phone:phone},callback);
    return;
    
}

const checkEmail = async function(ctx, next){
    ctx.set(HTTP_HEADER);

    let email = ctx.request.body.email;
    let captcha = (ctx.request.body.captcha).toLowerCase();
    let callback = ctx.request.body.callback;

    if( !email || !captcha){
        ctx.body = ResponseUtils.genError(ResultCode.NO_REQUIRED_PARAMS,callback);
        return;
    }
    if(!RegUtils.isEmail(email)){
        ctx.body = ResponseUtils.genError(ResultCode.ILLEGAL_PARAMS,callback);
        return;
    }
 
    let cacheCode = await CacheUtils.get(CAPCHA_CODE+captcha);
    if(!cacheCode || captcha !== cacheCode ){
        ctx.body = ResponseUtils.genError(ResultCode.ERROR_VERIFY_CODE,callback);
        return;
    }

    let result = await UserTable.getByEmail(email);
    if(!result){
        ctx.body = ResponseUtils.genError(ResultCode.NO_USER_EXIST, callback);
        return;
    }

    let getByEmail = await OrderResetPwdTable.getByEmail(email);

    if(!getByEmail){
        let key = Uuid.v4();
        let params = {
            email: email,
            key: key,
            expireAt: EmailResetPwdExpireTime
        }
        await OrderResetPwdTable.add(params);
    }

    let getResetTableByEmailOnce = await OrderResetPwdTable.getByEmail(email);
    if(!getResetTableByEmailOnce){
        ctx.body = ResponseUtils.genError(ResultCode.REQUEST_RESET_FAILED,callback);
        return;
    }
    let key = getResetTableByEmailOnce.key;
   
    let success = await sendResetPwdEmail(email, key);
  
    if(success){
        ctx.body = ResponseUtils.genResult({email:email}, callback);
        return; 
    }  

    ctx.body = ResponseUtils.genError(ResultCode.FAILED,callback);
    return;  

}

const resetPassword = async function(ctx){

    let phone = ctx.request.body.phone;
    let email = ctx.request.body.order_email;
    let callback = ctx.request.body.callback;

    if( phone ){

        await resetByPhone(ctx);
    }

    else if( email ){

        await resetByEmail(ctx);

    }

}

const resetByPhone = async function(ctx, next){
    ctx.set(HTTP_HEADER);
    
    let phone = ctx.request.body.phone;
    let password1 = ctx.request.body.password1;
    let password2 = ctx.request.body.password2;
    let captcha = ctx.request.body.captcha;
    let callback = ctx.request.body.callback;
    
    if(!phone || !password1 || !password2 || !captcha){
        
        ctx.body = ResponseUtils.genError(ResultCode.NO_REQUIRED_PARAMS, callback);
        return;

    }

    if(!RegUtils.isPhoneNum(phone)){

        ctx.body = ResponseUtils.genError(ResultCode.ILLEGAL_PARAMS, callback);
        return;

    }

    let result = await UserTable.getByPhone(phone);
    
    if(!result){

        ctx.body = ResponseUtils.genError(ResultCode.NO_USER_EXIST, callback);
        return; 

    }
    
    if(password1 !== password2){

        ctx.body = ResponseUtils.genError(ResultCode.DIFFERENT_PASSWORD, callback);
        return;      

    }

    let cacheCode = await CacheUtils.get(RES_VERIFY_CODE+phone);
        
    if(captcha !== cacheCode){

        ctx.body = ResponseUtils.genError(ResultCode.ERROR_VERIFY_CODE, callback);
        return;  

    }

    let salt = StrUtils.genStrCode(SALT_LEN);

    let password = SHA1(password1 + salt).toString();

    let userParams = {

        account: phone,
        password: password,
        salt: salt

    }
    
    let update = await UserTable.updatePasswordByPhone(userParams);

    if(update){

        ctx.body = ResponseUtils.genResult({phone:phone}, callback);
        return; 
    
    }

    ctx.body = ResponseUtils.genError(ResultCode.FAILED, callback);
    return;

}

const resetByEmail = async function(ctx, next){
    ctx.set(HTTP_HEADER);

    let email = ctx.request.body.order_email;
    let key = ctx.request.body.order_key;
    let password1 = ctx.request.body.hash_password1;
    let password2 = ctx.request.body.hash_password2;
    let callback = ctx.request.body.callback;

    if (!email || !password1 || !password2 || !key){
        
        ctx.body = ResponseUtils.genError(ResultCode.NO_REQUIRED_PARAMS, callback);
        return;

    }

    if(!RegUtils.isEmail(email)){

        ctx.body = ResponseUtils.genError(ResultCode.ILLEGAL_PARAMS, callback);
        return;

    }
    
    let result = await UserTable.getByEmail(email);
    
    if(!result){

        ctx.body = ResponseUtils.genError(ResultCode.NO_USER_EXIST, callback);
        return; 

    }

    if(password1 !== password2){
        
        ctx.body = ResponseUtils.genError(ResultCode.DIFFERENT_PASSWORD, callback);
        return;      

    }

    let success = await OrderResetPwdTable.get(email, key);
    
    if(!success){
        ctx.body = ResponseUtils.genError(ResultCode.NOT_EXIST, callback);
        return;
    }
    

    let salt = StrUtils.genStrCode(SALT_LEN);

    let password = SHA1(password1 + salt).toString();

    let userParams = {

        account: email,
        password: password,
        salt: salt
        
    }
    
    let updateUserTable = await UserTable.updatePasswordByEmail(userParams);

    let confirm = result.confirmed;
    
    if(!confirm){
        let userId = result.id;
        let confirmTable = await AccountConfirmTable.getById(userId);
        let confirmTableKey = confirmTable.key;
        await AccountConfirmTable.update( confirmTableKey, true );
        await UserTable.updateConfirmed( userId, true );
    }

    let resetParams = {
        email: email,
        key: key
    }
    let updateResetTable = await OrderResetPwdTable.update(resetParams);

    if(updateUserTable && updateResetTable){
        
        ctx.body = ResponseUtils.genResult({email:email}, callback);
        return; 
    
    }

    ctx.body = ResponseUtils.genError(ResultCode.FAILED, callback);
    return;

}

const sendEmail = async function(ctx, next){
    
    
    ctx.set(HTTP_HEADER);
    
    let email = ctx.request.body.email;
    let callback = ctx.request.body.callback;

    if(!email){

        ctx.body = ResponseUtils.genError(ResultCode.NO_REQUIRED_PARAMS, callback);
        return;

    }

    if(!RegUtils.isEmail(email)){

        ctx.body = ResponseUtils.genError(ResultCode.ILLEGAL_PARAMS, callback);
        return;

    }

    let result = await UserTable.getByEmail(email);
    if(!result){

        ctx.body = ResponseUtils.genError(ResultCode.NO_USER_EXIST, callback);
        return;
    
    }
   
    let confirmed = result.confirmed;
    
    if(confirmed){

        ctx.body = ResponseUtils.genError(ResultCode.ALREADY_ACTIVE, callback);
        return; 

    }

    let getUser = await UserTable.getByEmail(email);

    let userId = getUser.id;
    
    let getConfirmTable = await AccountConfirmTable.getById(userId);

    if(!getConfirmTable){
        let key = Uuid.v4();
        let params = {
            userId: userId,
            key: key
        }

        await AccountConfirmTable.add(params);
            
    }

    let getConfirmTableOnce = await AccountConfirmTable.getById(userId);
    
    if(!getConfirmTableOnce){
        ctx.body = ResponseUtils.genError(ResultCode.NOT_EXIST,callback);
        return;
    }
    let key = getConfirmTableOnce.key;

    let success = await sendConfirmEmail(email, key);

    if(success){
        ctx.body = ResponseUtils.genResult({email:email}, callback);
        return; 
    }
    
    ctx.body = ResponseUtils.genError(ResultCode.FAILED, callback);
    return;  

};

const confirm = async function (ctx,next){

    ctx.set(HTTP_HEADER);

    let email = ctx.request.body.email;
    let key = ctx.request.body.key;
    let callback = ctx.request.body.callback;

    if(!email || !key){
        ctx.body = ResponseUtils.genError(ResultCode.NO_REQUIRED_PARAMS,callback);
        return;
    }

    if(!RegUtils.isEmail(email)){
        
        ctx.body = ResponseUtils.genError(ResultCode.ILLEGAL_PARAMS, callback);
        return;

    }

    let confirm = await AccountConfirmTable.getByKey( key );
    if ( !confirm ) {
        ctx.body = ResponseUtils.genError(ResultCode.NOT_EXIST, callback);
        return;
    } else {

        let userId = confirm.user_id;
        let result = await UserTable.getById( userId );
      
        if ( email !== result.email ) {

            ctx.body = ResponseUtils.genError(ResultCode.NOT_EXIST, callback);
            return;

        } else {

            try {
                await UserTable.updateConfirmed( userId, true );
                await AccountConfirmTable.update( key, true );
                ctx.body = ResponseUtils.genResult({email:email}, callback);
                return;
            } catch ( e ) {
                ctx.body = ResponseUtils.genError(ResultCode.FAILED,callback);
                return;
            }
        }

    }

    ctx.body = ResponseUtils.genError(ResultCode.FAILED,callback);
    return;

}

const renderReset = async function (ctx,next){

    ctx.set(HTTP_HEADER);
    let email = ctx.request.body.email;
    let key = ctx.request.body.key;
    let callback = ctx.request.body.callback;

    if(!email || !key){
        ctx.body = ResponseUtils.genError(ResultCode.NO_REQUIRED_PARAMS,callback);
        return;
    }
    
    if(!RegUtils.isEmail(email)){
        
        ctx.body = ResponseUtils.genError(ResultCode.ILLEGAL_PARAMS, callback);
        return;

    }
    let result = await UserTable.getByEmail(email);

    if(!result){

        ctx.body = ResponseUtils.genError(ResultCode.NO_USER_EXIST, callback);
        return; 

    }

    let success = await OrderResetPwdTable.get(email, key);

    if(!success){
        ctx.body = ResponseUtils.genError(ResultCode.NOT_EXIST, callback);
        return;
    }

    key = success.key;
    email = result.email;
    ctx.body = ResponseUtils.genResult({key:key,email:email}, callback);
    return;

}

const sendConfirmEmail = async function(toEmail, key){

    let subject = await SettingTable.getByKey(CONFIRM_TITTLE);
    let confirmUrl = `http://localhost/account/confirm/${key}?email=${toEmail}`;
    let template = await SettingTable.getByKey(CONFIRM_TEMPLATE);

    let htmlContent = template.replace( /\${confirmUrl}/g, confirmUrl);
    htmlContent = htmlContent.replace( /\${toEmail}/g, toEmail);


    let message = JSON.stringify({
            toEmail: toEmail,
            subject: subject,
            content: htmlContent
        });
    

    let success = await CacheUtils.rpush(QUEUE_EMAIL,message);

    if(success){
        
        return true;
    }

    return false;
}

const sendResetPwdEmail = async function(toEmail, key){
    
    let subject = await SettingTable.getByKey(RESET_PWD_TITTLE);
    let resetUrl = `http://localhost/account/reset_pwd?email=${toEmail}&key=${key}`;
    let template = await SettingTable.getByKey(RESET_PWD_TEMPLATE);
    let htmlContent = template.replace(/\${resetUrl}/g, resetUrl);

    let message = JSON.stringify({
        toEmail:toEmail,
        subject:subject,
        content:htmlContent
    });

    let success = await CacheUtils.rpush(QUEUE_EMAIL,message);
    
    if(success){

        return true;
    }

    return false;
}


router.post('/signin', signin);

router.post('/signup', signup);
router.post('/signup/confirm/sendemail', sendEmail);
router.post('/signup/confirm', confirm);

router.post('/resetpwd/check', resetPwdCheck);
router.post('/resetpwd', resetPassword);
router.post('/reset_pwd', renderReset);
module.exports = router;
















