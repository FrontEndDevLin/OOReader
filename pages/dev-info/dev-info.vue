<template>
	<view>
		<view class="banner">
			<view class="logo-content">
				<image src="../../static/logo.png" mode="widthFix" class="logo"></image>
			</view>
			<view class="intro">
				{{ message }}
			</view>
		</view>
		<view class="list">
			<view class="item">
				<view class="label">
					<text class="iconfont icon-dev"></text>
					<text>作者</text>
				</view>
				<view>
					{{ author }}
				</view>
			</view>
			<view class="item">
				<view class="label">
					<text class="iconfont icon-email"></text>
					<text>邮箱</text>
				</view>
				<view>
					{{ email }}
				</view>
			</view>
			<view class="item" @click="toDonatePage">
				<view class="label">
					<text class="iconfont icon-juanzeng"></text>
					<text>捐赠作者</text>
				</view>
				<text class="iconfont icon-right"></text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				message: "-",
				author: "-",
				email: "-"
			}
		},
		created: async function() {
			const cloudUser = uniCloud.importObject('user') // 导入云对象
			try {
				let devInfo = await cloudUser.devInfo();
				if (devInfo) {
					getApp().globalData.alipayCode = devInfo.qrcodeAlipay;
					getApp().globalData.wechatCode = devInfo.qrcodeWechat;
					
					this.message = devInfo.message;
					this.author = devInfo.author;
					this.email = devInfo.email;
				}
			} catch (e) {
			}
		},
		methods: {
			toDonatePage() {
				uni.navigateTo({
					url: "../donate/donate"
				})
			}
		}
	}
</script>

<style lang="less" scoped>
	.banner {
		background-color: #eee;
		padding: 40rpx 0;
		
		.logo-content {
			text-align: center;
			margin-bottom: 10rpx;
			
			.logo {
				width: 100rpx;
				height: 100rpx;
			}
		}
		
		.intro {
			text-align: center;
			color: #666;
			font-size: 20rpx;
		}
	}
	
	.list {
		.item {
			display: flex;
			justify-content: space-between;
			padding: 30rpx 40rpx;
			border-bottom: 1px solid #d9d9d9;
			align-items: center;
			
			.label {
				display: flex;
				align-items: center;
				font-size: 28rpx;
				
				.iconfont {
					margin-right: 20rpx;
					font-size: 36rpx;
					
					color: #465D93;
				}
			}
		}
	}
</style>
