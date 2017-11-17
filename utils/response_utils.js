
let util = require('util');

/**
* 生成正常结果
*/

function genResult( data,callback){

    let result = {
        code: 0,
        data: data
    };

    if(!callback){
        return result;
    }

    return util.format('%s(%s)', callback, JSON.stringify(result));

}


/**
* 生成错误结果
*/

function genError(result, callback){

    if(!callback){
        return result;
    }

    return util.format('%s(%s)', callback, JSON.stringify(result));

}

module.exports = {
    genResult,
    genError
}