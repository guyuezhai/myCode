const redis = require('redis');
const util = require('util');
const redisWrapper = require('co-redis');
const config = require('../config');

const redisConf = config.cache;

let client;

const initClient = () => {

    let redisClient = redis.createClient( redisConf.port, redisConf.host );
    client = redisWrapper( redisClient );
    redisClient.on( 'error', err => {
        return console.log( 'redis创建失败' );
    })
}

const set = async function ( key, value, callback ){

    if(!client) initClient();

    return await client.set( key, value );
}

const del = async function ( key, callback ) {

    if( !client ) initClient();

    return await client.del( key );

}

const get = async function ( key, callback ){

    if( !client ) initClient();
    return await client.get( key );
}

const PEXPIREAT = async function ( key ,time ,callback ){

    if( !client ) initClient();

    return await client.PEXPIREAT( key ,time );
}

const expire = async function ( key ,sends ,callback ){

    if( !client ) initClient();

    return await client.expire( key ,sends );
}

const quit = async function (){

    if( !client ) initClient();

    return await client.quit();
}

const rpush = async function(key, value, callback){

    if(!client) initClient();

    return await client.rpush(key, value);

}

const rpop = async function(key, callback){
    
    if(!client) initClient();

    return await client.rpop(key);

}

exports.set = set;
exports.get = get;
exports.del = del;
exports.PEXPIREAT = PEXPIREAT;
exports.expire = expire;
exports.quit = quit;
exports.rpush = rpush;
exports.rpop = rpop;


































