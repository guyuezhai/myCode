var db = require( '../db/db' );

const tableName = 'core.setting';

var getByKey = async function (key) {

    var sql = `select * from ${ tableName } WHERE key = $1`;

    try {
        var result = await db.runSql( sql, [key]);
        
        if ( result ) {

            return result.rows[0].value;

        }
        
    } catch ( e ) {

        console.log( '查询系统设置信息出错', e );

    }

    return null;

}

exports.getByKey = getByKey;
