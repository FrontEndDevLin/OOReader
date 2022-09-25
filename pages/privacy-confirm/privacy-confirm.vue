<template>
	<view>
		<uni-popup ref="popup" type="center" :is-mask-click="false">
			<view class="container">
				<view class="modal-title">
					隐私政策概要
				</view>
				<view class="detail">
					<view class="content">
						感谢您选择欧欧阅读！为保障您的权利，在使用本软件前，请通过{{ bName }}了解我们对于个人信息的使用情况和您享有的相关权利。
					</view>
					<view class="content">
						您可以通过阅读完整版的<text class="link" @click="toPrivacyPage">{{ bName }}</text>了解详细信息。
					</view>
					<view class="content">如您同意，请点击“同意”开始使用本应用</view>
				</view>
				<view class="footer">
					<view class="access" @click="access">同意</view>
					<view class="no-access" @click="noAccess">不同意</view>
				</view>
			</view>
		</uni-popup>
		
		<uni-popup ref="popup2" type="center" :is-mask-click="false">
			<view class="container">
				<view class="modal-title">
					隐私政策概要
				</view>
				<view class="detail">
					<view class="content">
						您需要同意隐私保护指引才能使用本应用。如您不同意，很遗憾将无法使用。
					</view>
					<view class="content">
						您可以通过阅读完整版的<text class="link" @click="toPrivacyPage">{{ bName }}</text>了解详细信息。
					</view>
				</view>
				<view class="footer">
					<view class="access" @click="access">同意</view>
					<view class="no-access" @click="exit">不同意并退出</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				bName: "《欧欧阅读隐私保护指引》"
			}
		},
		methods: {
			toPrivacyPage() {
				uni.navigateTo({
					url: "../privacy-policy/privacy-policy"
				})
			},
			
			access() {
				uni.setStorageSync("accessPrivacyPolicy", true);
				uni.setStorageSync("privacyPolicyVer", getApp().globalData.privacyVer);
				uni.switchTab({
					url: "../book-list/book-list"
				})
			},
			
			noAccess() {
				this.$refs.popup.close();
				
				this.$refs.popup2.open("center");
			},
			
			exit() {
				plus.runtime.quit();
			}
		},
		mounted() {
			this.$refs.popup.open("center")
		}
	}
</script>

<style lang="less" scoped>
	.container {
		width: 550rpx;
		border-radius: 10px;
		background-color: #fff;
		position: relative;
		padding: 20rpx 0;
		
		.modal-title {
			border-bottom: 1px solid #e8e8e8;
			padding: 22rpx 34rpx;
			font-size: 32rpx;
		}
		
		.detail {
			padding: 22rpx 34rpx;
			font-size: 32rpx;
			
			.content {
				margin-bottom: 22rpx;
				color: #666;
				
				.link {
					color: #465D93;
				}
			}
		}
		
		.footer {
			font-size: 32rpx;
			padding: 22rpx 34rpx;
			padding-top: 0;
			text-align: center;
			
			.access {
				padding: 8rpx 0;
				color: #fff;
				background-color: #465D93;
				border-radius: 10px;
				margin-bottom: 14rpx;
			}
			
			.no-access {
				padding: 8rpx 0;
				color: #999;
			}
		}
	}
</style>
