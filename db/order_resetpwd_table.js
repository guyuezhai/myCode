const db = require( './db' );
const util = require( 'util' );

const tableName = 'core.order_resetpwd';

//创建用户

exports.add = async function( params ) {

    let sql = `INSERT INTO ${tableName}(email, key, created_at, expire_at ) VALUES ($1,$2, now(),$3+now() )`;
    let paramsArray = [params.email, params.key, params.expireAt];

    try{

        await db.runSql(sql , paramsArray);

        return true;

    } catch ( e ){

        console.log('添加失败', e);

        return false;

    }

}

exports.getByEmail = async function ( email ) {
    
    let sql = `SELECT * FROM ${tableName} WHERE email=$1 AND success_at IS NULL AND expire_at>now() LIMIT 1`;

    let paramsArray = [email];

    try{

        let result = await db.runSql(sql, paramsArray);
        
        if( result && result.rows[0] ){
            
            return result.rows[0];
        }

    } catch( e ){

        console.error('查询出错', e);

    }
        
    return null;

}



exports.get = async function (email, key) {
    
    let sql = `SELECT * FROM ${tableName} WHERE email=$1 AND key=$2 AND success_at IS NULL AND expire_at>now() LIMIT 1`;

    let paramsArray = [email, key];

    try {

        let result = await db.runSql(sql, paramsArray);
        
        if( result && result.rows[0]){
            
            return true;
        }

    } catch( e ){

        console.error('查询出错', e);
       
    }

    return null;

}

exports.update = async function (params){
    
    let sql = `UPDATE ${ tableName } SET success_at=now() WHERE email=$1 AND key = $2`;
    let paramsArray = [params.email, params.key];

    try {

        let result = await db.runSql( sql, paramsArray);
        
        if(result){

            return true;

        }
        
    } catch ( e ) {

        console.error("更新用户错误", e);
        
    }

    return false;

}