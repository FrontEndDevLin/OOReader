<template>
	<view class="container">
		<view class="message">一元即可，您的支持是我最大的动力</view>
		
		<view class="qrcode-list" v-if="showCode">
			<view class="qrcode-warpper">
				<image class="qrcode" :src="alipayCode" mode="widthFix"></image>
			</view>
			<view class="qrcode-warpper">
				<image class="qrcode" :src="wechatCode" mode="widthFix"></image>
			</view>
		</view>
		<view v-else>
			<button type="default" @click="showQrcode">展示二维码</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				alipayCode: "",
				wechatCode: "",
				
				showCode: false
			}
		},
		created() {
			this.alipayCode = getApp().globalData.alipayCode;
			this.wechatCode = getApp().globalData.wechatCode;
		},
		methods: {
			showQrcode() {
				this.showCode = true;
			}
		}
	}
</script>

<style lang="less" scoped>
	.container {
		padding: 20rpx 40rpx;
		
		.message {
			margin-bottom: 20rpx;
			color: #999;
		}
		
		.qrcode-list {
			text-align: center;
			
			.qrcode-warpper {
				margin-bottom: 20rpx;
				.qrcode {
					width: 360rpx;
				}
			}
		}
	}
</style>
