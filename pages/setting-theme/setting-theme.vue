<template>
	<view>
		<view class="list">
			<view class="item" v-for="oTheme of themeList" :key="oTheme.key" @click="setTheme(oTheme.key)">
				<view class="label">
					<text>{{ oTheme.txt }}</text>
				</view>
				<text class="iconfont icon-check" v-if="oTheme.key == currentTheme"></text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentTheme: "",
				themeList: [
					{
						txt: "日间",
						key: "sun"
					},
					{
						txt: "夜间",
						key: "dark"
					}
				]
			}
		},
		onLoad() {
			this.getCurrnetTheme();
		},
		methods: {
			getCurrnetTheme() {
				this.currentTheme = uni.getStorageSync("theme") || "sun";
			},
			
			setTheme(theme) {
				uni.setStorageSync("theme", theme);
				this.getCurrnetTheme();
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
				.iconfont {
					margin-right: 20rpx;
					font-size: 40rpx;
				}
			}
		}
	}
</style>