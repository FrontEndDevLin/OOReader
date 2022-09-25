<template>
	<view class="container">
		<view class="feedback-item">
			<view class="title">反馈功能</view>
			<view class="list">
				<view class="item" v-for="option of selectList" :key="option.key" @click="selectFn(option.key)">
					<view class="label">
						{{ option.txt }}
					</view>
					<text class="iconfont icon-check" v-if="selectFnName == option.key"></text>
				</view>
			</view>
		</view>
		<view class="feedback-item">
			<view class="title">问题或建议</view>
			<view class="user-input-warpper">
				<textarea v-model="detailTxt" placeholder="为了便于定位问题和改进，请尽量详细描述你的问题或建议。（必填）" maxlength="200" class="textarea" >123cv</textarea>
			</view>
		</view>
		<view class="footer">
			<button type="default" class="submit-btn" @click="submit">
				提交
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				selectList: [
					{
						txt: "功能异常",
						key: "abnormal"
					},
					{
						txt: "产品建议",
						key: "advice"
					},
					{
						txt: "其他问题",
						key: "other"
					}
				],
				selectFnName: "",
				
				detailTxt: ""
			}
		},
		methods: {
			selectFn(key) {
				this.selectFnName = key;
			},
			
			submit() {
				if (!this.selectFnName) {
					uni.showModal({
						title: "提示",
						content: "请选择反馈功能",
						showCancel: false
					});
					return;
				}
				if (!(this.detailTxt && typeof this.detailTxt == "string" && this.detailTxt.length >= 10)) {
					uni.showModal({
						title: "提示",
						content: "请填写问题或建议（至少10个字）",
						showCancel: false
					});
					return;
				}
				uni.showModal({
					title: "提示",
					content: "确定要提交吗？",
					success: async (e) => {
						if (e.confirm) {
							// 提交接口
							const cloudFeedback = uniCloud.importObject('feedback'); // 导入云对象
							try {
								let res = await cloudFeedback.submitFeedback(getApp().globalData.uid, { fn: this.selectFnName, txt: this.detailTxt });
								if (res.code == 200) {
									uni.showModal({
										title: "提示",
										content: res.message
									});
									this.selectFnName = "";
									this.detailTxt = "";
								} else {
									uni.showModal({
										title: "提示",
										content: res.message
									});
								}
							} catch (e) {
							}
						}
					}
				})
			}
		}
	}
</script>

<style lang="less" scoped>
	.container {
		padding-top: 20rpx;
		height: 100vh;
	}
	
	.feedback-item {
		background-color: #fff;
		padding: 20rpx 40rpx;
		margin-bottom: 20rpx;
		
		.title {
			margin-bottom: 20rpx;
		}
		
		
		.list {
			.item {
				display: flex;
				justify-content: space-between;
				padding: 20rpx;
				border-bottom: 1px solid #d9d9d9;
				align-items: center;
				color: #666;
				
				&:last-child {
					border-bottom: 0;
				}
				
				.label {
					display: flex;
					align-items: center;
					font-size: 28rpx;
				}
			}
		}
		
		.user-input-warpper {
			background-color: #f5f5f5;
			
			.textarea {
				padding: 20rpx;
				box-sizing: border-box;
				font-size: 28rpx;
				width: 100%;
			}
		}
	}
	
	.footer {
		position: absolute;
		bottom: 40rpx;
		width: 100%;
		padding: 0 40rpx;
		
		.submit-btn {
			background-color: #fff;
		}
	}
</style>