<template>
	<view>
		<view class="banner">
			<view class="logo-content">
				<image src="../../static/logo.png" mode="widthFix" class="logo"></image>
			</view>
			<view class="version-info">
				<text>当前版本：</text>
				<text>{{ currentVersion }}</text>
			</view>
		</view>
		<view class="list">
			<view class="item" @click="toUpdateLogPage">
				<view class="label">
					<text class="iconfont icon-rizhi"></text>
					<text>更新日志</text>
				</view>
				<text class="iconfont icon-right"></text>
			</view>
			<view class="item" @click="checkUpdate">
				<view class="label">
					<text class="iconfont icon-update"></text>
					<text>检查更新</text>
				</view>
			</view>
			<view class="item" @click="toPrivacyPage">
				<view class="label">
					<text class="iconfont icon-Privacy"></text>
					<text>隐私政策</text>
				</view>
				<text class="iconfont icon-right"></text>
			</view>
			<view class="item" @click="toDevInfoPage">
				<view class="label">
					<text class="iconfont icon-dev"></text>
					<text>开发者信息</text>
				</view>
				<text class="iconfont icon-right"></text>
			</view>
		</view>
		<update ref="updateComp"/>
	</view>
</template>

<script>
	import update from "../../components/update/update.vue";
	
	export default {
		data() {
			return {
				currentVersion: "",
			}
		},
		created() {
			plus.runtime.getProperty(plus.runtime.appid, (info) => {
				this.currentVersion = "V" + info.version;
			})
		},
		methods: {
			toDevInfoPage() {
				uni.navigateTo({
					url: "../dev-info/dev-info"
				})
			},
			
			checkUpdate() {
				this.$refs.updateComp.checkUpdate(false);
			},
			
			toUpdateLogPage() {
				uni.navigateTo({
					url: "../update-log/update-log"
				})
			},
			
			toPrivacyPage() {
				uni.navigateTo({
					url: "../privacy-policy/privacy-policy"
				})
			}
		}
	}
</script>

<style lang="less" scoped>
	.banner {
		// height: 300rpx;
		background-color: #eee;
		padding: 40rpx 0;
		
		.logo-content {
			text-align: center;
			// padding: ;
			margin-bottom: 10rpx;
			
			.logo {
				width: 100rpx;
				height: 100rpx;
			}
		}
		
		.version-info {
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