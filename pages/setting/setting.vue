<template>
	<view>
		<view class="list">
			<view class="item" @click="toSetFontPage">
				<view class="label">
					<text class="iconfont icon-font-size"></text>
					<text>阅读器字号</text>
				</view>
				<view>{{ font }}</view>
			</view>
			<view class="item" @click="toSetThemePage">
				<view class="label">
					<text class="iconfont icon-theme"></text>
					<text>阅读器主题</text>
				</view>
				<view>{{ theme }}</view>
			</view>
			<view class="item">
				<view class="label">
					<text class="iconfont icon-update"></text>
					<text>更新设置</text>
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
				font: 0,
				theme: ""
			}
		},
		
		onShow() {
			this.getThemeCN();
			this.getFont();
		},
		methods: {
			getFont() {
				this.font = uni.getStorageSync("font") || 18;
			},
			
			getThemeCN() {
				let theme = "";
				let storageTheme = uni.getStorageSync("theme") || "sun";
				theme = storageTheme == "dark" ? "夜间" : "日间";
				this.theme = theme;
			},
			
			toSetFontPage() {
				uni.navigateTo({
					url: "../setting-font/setting-font"
				})
			},
			
			toSetThemePage() {
				uni.navigateTo({
					url: "../setting-theme/setting-theme"
				})
			}
		}
	}
</script>

<style lang="less" scoped>
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
