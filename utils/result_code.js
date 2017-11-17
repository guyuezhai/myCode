
/**
* API为正常返回的状态码及提示信息
*/

module.exports = {

	NO_AUTH: {

		code: 601,
		msg: '未通过访问认证',

	},

	NO_PERMISSION: {

		code: 602,
		msg: '没有操作权限',

	},         

	REACH_QUOTA: {

		code: 603,
		msg: 'API调用达到限额'

	},

	IP_FORBIDDEN: {

		code: 604,
		msg: 'IP被禁用'

	},

	AK_FORBIDDEN: {

		code: 605,
		msg: 'Access Key被禁用'

	},


	REACH_STORE_QUOTA: {

		code: 606,
		msg: '存储已达到限额'

	},

	NO_REQUIRED_PARAMS: {
		
		code: 611,
		msg: '必要参数缺失'

	},

	ILLEGAL_PARAMS: {

		code: 612,
		msg: '参数不合法'

	},

	NOT_EXIST: {

		code: 701,
		msg: '对象不存在'

	},

	FIELD_NOT_EXIST: {

		code: 703,
		msg: '数据属性不存在'

	},

	FAILED: {

		code: 706,
		msg: '操作失败'

	},

	ALREADY_EXIST: {

		code: 101,
		msg: '用户已存在,请登录！'

	},

	ERROR_VERIFY_CODE: {

		code: 102,
		msg: '验证码错误！'

	},

	DIFFERENT_PASSWORD: {

		code: 103,
		msg: '前后密码不一致！'

	},

	NO_USER_EXIST: {

		code: 104,
		msg: '用户不存在，请注册！'
	},

	ERROR_PASSWORD: {

		code: 105,
		msg: '用户名或密码错误！'

	},

	NO_USER_SALT: {

		code:106,
		msg: '获取用户salt失败'
		
	},

	NO_USER_PWD: {

		code:107,
		msg: '获取用户密码失败'

	},

	NO_CONFIRMED:{

		code:108,
		msg:'邮箱未激活，请激活！'
		
	},

	ADD_FAILED:{
		code:109,
		msg:'添加用户失败'
	},
	
	UPDATE_FAILED:{
		code:110,
		msg:'更新用户失败'
	},
	ALREADY_ACTIVE:{
        code:111,
        msg:'您的账户已激活请登录！'
	},
	REQUEST_RESET_FAILED:{
		code:112,
		msg:'重置失败！'
	}
	
}

