const db = require( './db' );
const util = require( 'util' );

const tableName = 'core.account_confirm';

//创建用户

exports.add = async function( params ) {

    let sql = `INSERT INTO ${tableName}(user_id,key,created_at,updated_at) VALUES ($1,$2, now(), now())`;
  
    let paramsArray = [params.userId ,params.key];

    try{

        await db.runSql(sql , paramsArray);

        return true;

    } catch ( e ){

        console.log('添加用户失败', e);

        return false;
    }

}

exports.getById = async function (id) {
    
    let sql = `SELECT * FROM ${tableName} WHERE user_id = $1`;

    try{

        let result = await db.runSql(sql, [id]);
        
        if( result && result.rows[0] ){
            
            return result.rows[0];
        }

    } catch ( e ){

        console.error('查询用户出错', e);

    }
        
    return null;

}

exports.getByKey = async function (key) {
    
    let sql = `SELECT * FROM ${tableName} WHERE key = $1 limit 1`;
    let params = [key];

    try{

        let result = await db.runSql(sql, params);
        
        if( result && result.rows[0]){
            
            return result.rows[0];
        }
      
    } catch ( e ){

        console.error('查询用户出错', e);
        
    }

    return null;
 
}

exports.update = async function (key, confirmed){
    
    let sql = `UPDATE ${ tableName } SET confirmed=$2, updated_at=now() WHERE key=$1`;
    let paramsArray = [key, confirmed];

    try {

        let result = await db.runSql( sql, paramsArray);
        
        if(result){

            return result.rows;

        }

    } catch ( e ) {

        console.error("更新邮箱确认信息出错", e);
        
    }

    return false;

}