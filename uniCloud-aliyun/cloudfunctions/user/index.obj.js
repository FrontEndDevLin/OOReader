// 开发文档: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
const crypto = require('crypto')

module.exports = {
	checkUser: async function(macAddr) {
		if (!macAddr) return;
		
		const dbJQL = uniCloud.databaseForJQL({ // 获取JQL database引用，此处需要传入云对象的clientInfo
			clientInfo: this.getClientInfo()
		});
		dbJQL.setUser({ // 指定后续执行操作的用户信息，此虚拟用户将同时拥有传入的uid、role、permission
			uid: 'user-id', // 建议此处使用真实uid
			role: ['admin'], // 指定当前执行用户的角色为admin。如果只希望指定为admin身份，可以删除uid和permission节点
			permission: []
		});
		
		let userData = await dbJQL.collection('user').where("mac=='" + macAddr + "'").get();
		
		if (userData.data.length) {
			return userData.data[0];
		}
		
		let data = await dbJQL.collection('user').groupBy('uid').groupField('max(uid) as maxId').get({
			getOne: true
		});
		data = data.data;
		if (data) {
			let maxId = data.maxId;
			
			let res = await dbJQL.collection('user').add({
				mac: macAddr,
				uid: ++maxId
			});
			
			if (res.code == 0) {
				let userData = await dbJQL.collection('user').where("mac=='" + macAddr + "'").get();
				
				if (userData.data.length) {
					return userData.data[0];
				}
			} else {
				return null;
			}
		}
	},
	
	devInfo: async function () {
		const dbJQL = uniCloud.databaseForJQL({ // 获取JQL database引用，此处需要传入云对象的clientInfo
			clientInfo: this.getClientInfo()
		});
		dbJQL.setUser({ // 指定后续执行操作的用户信息，此虚拟用户将同时拥有传入的uid、role、permission
			uid: 'user-id', // 建议此处使用真实uid
			role: ['admin'], // 指定当前执行用户的角色为admin。如果只希望指定为admin身份，可以删除uid和permission节点
			permission: []
		});
		
		let data = await dbJQL.collection('devinfo').get();
		data = data.data[0];
		
		return data;
	},
	
	privacyInfo: async function () {
		const dbJQL = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		});
		dbJQL.setUser({ // 指定后续执行操作的用户信息，此虚拟用户将同时拥有传入的uid、role、permission
			uid: 'user-id', // 建议此处使用真实uid
			role: ['admin'], // 指定当前执行用户的角色为admin。如果只希望指定为admin身份，可以删除uid和permission节点
			permission: []
		});
		
		let data = await dbJQL.collection('privacy').where("active==true").get();
		data = data.data[0];
		return data;
	}
}
