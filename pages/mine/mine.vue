<template>
	<view>
		<view class="header">
			<view class="avatar-content">
				<image class="avatar" :src="require('../../static/image/avatar.jpg')" mode=""></image>
			</view>
			<view class="info">
				用户<text>{{ uid }}</text>
			</view>
		</view>
		<view class="list">
			<!-- <view class="item">
				<view class="label">
					<text class="iconfont icon-clear"></text>
					<text>清除缓存</text>
				</view>
				<text class="iconfont icon-right"></text>
			</view> -->
			<view class="item" @click="toAboutPage">
				<view class="label">
					<text class="iconfont icon-about"></text>
					<text>关于欧欧阅读</text>
				</view>
				<text class="iconfont icon-right"></text>
			</view>
			<view class="item" @click="toFeedbackPage">
				<view class="label">
					<text class="iconfont icon-Chat"></text>
					<text>问题反馈</text>
				</view>
				<text class="iconfont icon-right"></text>
			</view>
			<view class="item" @click="toSettingPage">
				<view class="label">
					<text class="iconfont icon-setting"></text>
					<text>设置</text>
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
				uid: ''
			}
		},
		onShow() {
			this.uid = getApp().globalData.uid
		},
		methods: {
			toAboutPage() {
				uni.navigateTo({
					url: "../about/about"
				})
			},
			
			toFeedbackPage() {
				uni.navigateTo({
					url: "../feedback/feedback"
				})
			},
			
			toSettingPage() {
				uni.navigateTo({
					url: "../setting/setting"
				})
			},
		}
	}
</script>

<style lang="less">
	.header {
		height: 400rpx;
		background-image: url("~@/static/image/user.png");
		background-size: cover;
		padding-top: 100rpx;
		
		.avatar-content {
			text-align: center;
			margin-bottom: 40rpx;
			.avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				border: 6rpx solid #fff;
			}
		}
		
		.info {
			text-align: center;
			color: #fff;
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
