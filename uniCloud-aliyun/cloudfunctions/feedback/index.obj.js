// 开发文档: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
module.exports = {
	submitFeedback: async function(uid, { fn, txt }) {
		if (!fn || !txt || !uid) return;
		
		const dbJQL = uniCloud.databaseForJQL({ // 获取JQL database引用，此处需要传入云对象的clientInfo
			clientInfo: this.getClientInfo()
		});
		dbJQL.setUser({ // 指定后续执行操作的用户信息，此虚拟用户将同时拥有传入的uid、role、permission
			uid: 'user-id', // 建议此处使用真实uid
			role: ['admin'], // 指定当前执行用户的角色为admin。如果只希望指定为admin身份，可以删除uid和permission节点
			permission: []
		});
		
		let today = new Date();
		let dateStr = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
		// 校验uid和dateStr的长度是否大于5，限制单个用户一天只能提交5次
		let fields = await dbJQL.collection("feedback").where("uid==" + uid + "&&submit_date=='" + dateStr + "'").get();
		if (fields && fields.data.length < 5) {
			// 插入数据库
			// 获取当前版本，获取日期
			let oVersion = await dbJQL.collection("version").where("active==true").get();
			if (oVersion.data.length) {
				let version = oVersion.data[0].version;
				if (version) {
					let res = await dbJQL.collection('feedback').add({
						uid,
						version,
						fn,
						submit_date: dateStr,
						txt
					});
					if (res.code == 0) {
						return {
							code: 200,
							message: "提交成功，感谢您的反馈"
						}
					}
				} else {
					return {
						code: 200,
						message: "提交成功，感谢您的反馈"
					}
				}
			} else {
				return {
					code: 200,
					message: "提交成功，感谢您的反馈"
				}
			}
		} else {
			return {
				code: 400,
				message: "当天提交次数过多，请明天再来"
			}
		}
		
	}
}
