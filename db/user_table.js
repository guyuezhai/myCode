const db = require( './db' );
const util = require( 'util' );

const tableName = 'core.user';

//创建用户

exports.addByPhone = async function( params ) {

    let sql = `INSERT INTO ${tableName}(phone,hash_password,salt,name,created_at,updated_at) VALUES ($1, $2, $3, $4, now(), now())`;
    let paramsArray = [params.account , params.password, params.salt, params.name];

    try{

        await db.runSql(sql , paramsArray);

        return true;

    } catch ( e ){

        console.log('添加用户失败', e);

        return false;
        
    }

}

exports.addByEmail = async function( params ) {
    
    let sql = `INSERT INTO ${tableName}(email,hash_password,salt,name,created_at,updated_at) VALUES ($1, $2, $3, $4, now(), now())`;
    let paramsArray = [params.account , params.password, params.salt, params.name];

    try{

        await db.runSql(sql , paramsArray);

        return true;

    } catch ( e ){

        console.log('添加用户失败', e);

        return false;

    }

}

//获取用户

exports.getById = async function ( id ) {

    let sql = `SELECT * FROM ${tableName} WHERE id = $1`;

    try{

        let result = await db.runSql(sql, [id]);

        if( result && result.rows[0] ){
            
            return result.rows[0];
        }

    }catch( e ){

        console.error('查询用户出错', e);

    }
       
    return null;

}

exports.getByEmail = async function ( email ) {

    let sql = `SELECT * FROM ${tableName} WHERE email = $1`;

    try{

        let result = await db.runSql(sql, [email]);

        if( result && result.rows[0] ){
            
            return result.rows[0];

        }

    }catch( e ){

        console.error('查询用户出错', e);

    }
        

    return null;

}

exports.getByPhone = async function (phone) {
    
    let sql = `SELECT * FROM ${tableName} WHERE phone = $1`;

    try{

        let result = await db.runSql(sql, [phone]);

        if( result && result.rows[0] ){
            
            return result.rows[0];

        }

    }catch( e ){

        console.error('查询用户出错', e);

    }   

    return null;

}

//更新密码

exports.updatePasswordByPhone = async function ( params ){

    let sql = `UPDATE ${ tableName } SET hash_password=$2, salt=$3, updated_at=now() WHERE phone=$1`;
    let paramsArray = [params.account, params.password, params.salt];

    try {

        let result = await db.runSql( sql, paramsArray);
   
        if(result){

            return true;

        }
     
    } catch ( e ) {

        console.error("更新用户密码错误", e);
        
    }

    return false;

}

exports.updatePasswordByEmail = async function ( params ){
    
    let sql = `UPDATE ${ tableName } SET hash_password=$2, salt=$3, updated_at=now() WHERE email=$1`;
    let paramsArray = [params.account, params.password, params.salt];

    try {

        let result = await db.runSql( sql, paramsArray);
        
        if( result ){

            return true;

        }
       
    } catch ( e ) {

        console.error("更新用户密码错误", e);
        
    }

    return false;

}

exports.updateConfirmed = async function (userId, confirmed){
    
    let sql = `UPDATE ${ tableName } SET confirmed=$2 ,updated_at=now() WHERE id=$1`;
    let paramsArray = [userId, confirmed];

    try {
        
        let result = await db.runSql( sql, paramsArray);
        
        if(result){ 

            return result.rows;

        }
        
    } catch ( e ) {

        console.error("更新用户邮箱确认状态出错", e);
       
    }

    return false;

}

