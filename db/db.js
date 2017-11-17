const pg =require ('pg');
const config =require('../config');

const pool = new pg.Pool(config.db);

pool.on('error', function(err,client){
    console.error('GeoHey Cloud连接数据出错',err);
});

pool.on('connect', cl =>{
    console.log('GeoHey Cloud服务已经连接数据库');
});

const query = async function (sql , params ){
    let result = await pool.query(sql , params);
   
    if(result){
        
        return result;
    }
    return false;
}

exports.runSql = query;