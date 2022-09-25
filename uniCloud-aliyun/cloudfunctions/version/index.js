'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	const dbJQL = uniCloud.databaseForJQL({ // 获取JQL database引用，此处需要传入云函数的event和context，必传
		event,
		context 
	})
	return {
		dbJQL.collection('version').get() // 直接执行数据库操作
	}
};