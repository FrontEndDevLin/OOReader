<template>
	<view class="container">
		<view class="header">
			<view class="version">
				<text>版本：</text>
				<text class="value">{{ version }}</text>
			</view>
			<view class="time">
				<text>更新时间：</text>
				<text class="value">{{ upd_date }}</text>
			</view>
		</view>
		<view class="detail">
			{{ upd_log }}
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				version: "",
				upd_date: "",
				upd_log: ""
			}
		},
		onLoad(options) {
			let logId = options.logId;
			
			const db = uniCloud.database();
			
			uni.showLoading({
				title: "请稍等",
				mask: true
			});
			db.collection('version').where({ _id: logId }).get().then(res => {
				res = res.result;
				if (res.errCode == 0) {
					let data = res.data;
					if (data.length) {
						data = data[0];
						this.version = data.version;
						this.upd_date = data.upd_date;
						this.upd_log = data.upd_log;
					}
					
					uni.hideLoading();
				}
			}).catch(err => {
				uni.hideLoading();
				uni.showToast({
					icon: "error",
					title: "网络错误"
				});
			})
		},
		methods: {
			
		}
	}
</script>

<style lang="less" scoped>
	.container {
		padding: 40rpx;
		
		.header {
			display: flex;
			margin-bottom: 20rpx;
			
			.version {
				margin-right: 20rpx;
			}
			
			.value {
				color: #666;
			}
		}
	}
</style>
