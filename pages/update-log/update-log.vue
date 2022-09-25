<template>
	<view>
		<view class="list">
			<view class="item" v-for="oVersion of versionList" :key="oVersion._id" @click="toUpdateLogDetailPage(oVersion._id)">
				<view class="label">
					<text>版本</text>
					<text>{{ oVersion.version }}</text>
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
				versionList: []
			}
		},
		created() {
			const db = uniCloud.database();
			
			uni.showLoading({
				title: "请稍等",
				mask: true
			});
			db.collection('version').field("version", "_id").get().then(res => {
				res = res.result;
				if (res.errCode == 0) {
					let data = res.data;
					this.versionList = data;
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
			toUpdateLogDetailPage(id) {
				uni.navigateTo({
					url: "../update-log-detail/update-log-detail?logId=" + id
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