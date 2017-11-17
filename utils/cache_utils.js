const redisUtils = require('../utils/redis_utils');

//向Redis添加用户注册手机号以及注册验证码，并设置过期时间
async function set(key, value, sends){

    let result = await redisUtils.set(key, value);

    if(result){

        let expired = await redisUtils.expire(key, sends);
        if(expired){
            return true;
        }

    }

    console.log('缓存失败！');

    return false;
    
}

//从Redis获取用户注册的验证码信息
async function get(key){

    let result = await redisUtils.get(key);

    if(result){

        return result;

    }

    return false;
    //await redisUtils.quit(); 
}

async function rpush(key, value){
    
    let result = await redisUtils.rpush(key, value);

    if(result){

        return true;

    }

    return false;

}

async function rpop(key){
    
    let result = await redisUtils.rpop(key);

    if(result){

        return result;

    }

    return false;

}

exports.set = set;
exports.get = get;
exports.rpush = rpush;
exports.rpop = rpop;