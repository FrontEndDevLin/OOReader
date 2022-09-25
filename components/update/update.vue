<template>
	<view class="container" v-if="downloading">
		<view class="download-warpper">
			<view class="title">
				正在更新，请勿退出应用
			</view>
			<view class="update-progress">
				<progress :percent="downloadPercent" show-info />
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "update",
		data() {
			return {
				currentVersion: "",
				
				downloading: false,
				
				downloadPercent: 0,
				
				filename: ""
			};
		},
		created() {
			plus.runtime.getProperty(plus.runtime.appid, (info) => {
				this.currentVersion = "V" + info.version;
			})
		},
		methods: {
			checkUpdate(silent = true, callback) {
				const db = uniCloud.database();
				
				if (!silent) {
					uni.showLoading({
						title: "请稍等",
						mask: true
					});
				}
				db.collection('version').where({ active: true }).get().then(res => {
					res = res.result;
					if (res.errCode == 0) {
						let data = res.data;
						if (data.length) {
							data = data[0];
							
							// console.log(data)
							if (data.version && data.version == this.currentVersion) {
								if (!silent) {
									uni.showToast({
										icon: "none",
										title: "已是最新版本"
									});
								}
							} else {
								let options = {
									title: "发现新版本" + data.version + " 请更新",
									content: data.upd_log,
									showCancel: false,
									success: (e) => {
										// 点击了确定
										if (e.confirm) {
											console.log("下载更新");
											uni.getNetworkType({
												success: (res) => {
													if (res.networkType == "wifi") {
														this.doUpdate(data.link);
													} else {
														uni.showModal({
															title: "提示",
															content: "检测到您目前使用的是移动网络数据，是否继续更新？",
															success: (e) => {
																if (e.confirm) {
																	this.doUpdate(data.link);
																}
															}
														})
													}
												}
											});
										} else {
											console.log("退出app");
										}
									}
								};
								// 非必须更新
								if (!data.force) {
									if (callback) {
										if (callback(data.version) == false) {
											return;
										}
									}
									
									options.title = "发现新版本" + data.version + " 点击确定更新";
									options.showCancel = true;
									options.success = (e) => {
										if (e.confirm) {
											// console.log("下载更新");
											uni.getNetworkType({
												success: (res) => {
													if (res.networkType == "wifi") {
														this.doUpdate(data.link);
													} else {
														uni.showModal({
															title: "提示",
															content: "检测到您目前使用的是移动网络数据，是否继续更新？",
															success: (e) => {
																if (e.confirm) {
																	this.doUpdate(data.link);
																}
															}
														})
													}
												}
											});
										} else {
											uni.setStorageSync("skip_" + data.version, true);
										}
									}
								}
								
								uni.showModal(options);
							}
						}
						if (!silent) { 
							uni.hideLoading();
						}
					}
				}).catch(err => {
					if (!silent) { 
						uni.hideLoading();
						uni.showToast({
							icon: "error",
							title: "网络错误"
						});
					}
				})
			},
			
			doUpdate(link) {
				if (this.filename) {
					plus.runtime.openFile(this.filename);
					return;
				}
				
				if (!link) {
					uni.showToast({
						icon: "error",
						title: "更新失败"
					});
					return;
				};
				
				this.downloading = true;
				let dtask = plus.downloader.createDownload(link, {
					timeout: 10,
					retry: 1
				}, (d, status) => {
					// d为下载的文件对象
					if (status == 200) {
						this.filename = d.filename;
						// let fileSaveUrl = plus.io.convertLocalFileSystemURL(d.filename);
						plus.runtime.openFile(d.filename); //选择软件打开文件
					} else {
						//下载失败
						plus.downloader.clear(); //清除下载任务
						// if (callback2) {
						// 	callback2({ code: -1, message: "下载失败" });
						// }
						uni.showToast({
							icon: "error",
							title: "更新失败"
						});
					}
					this.downloading = false;
				});
				dtask.addEventListener('statechanged', (task) => {
					if (!dtask) {
						return;
					}
					switch (task.state) {
						case 1:
							console.log('开始下载');
							break;
						case 2:
							console.log('连接到服务器...');
							break;
						case 3: {
							let progressVal = parseInt(this.changeTwoDecimal_f(task.downloadedSize / task.totalSize) * 100);
							// if (callback1) callback1(progressVal)
							this.downloadPercent = progressVal;
						} break;
						case 4: {
							this.downloadPercent = 100;
						} break;
					}
				});
				dtask.start(); 
			},
			
			changeTwoDecimal_f(x) {
				var f_x = parseFloat(x);
				if (isNaN(f_x)) {
					return 0;
				}
				var f_x = Math.round(x * 100) / 100;
				var s_x = f_x.toString();
				var pos_decimal = s_x.indexOf('.');
				if (pos_decimal < 0) {
					pos_decimal = s_x.length;
					s_x += '.';
				}
				while (s_x.length <= pos_decimal + 2) {
					s_x += '0';
				}
				return s_x;
			}
		}
	}
</script>

<style lang="less" scoped>
	.container {
		width: 100%;
		height: 100vh;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 20;
		display: flex;
		justify-content: center;
		align-items: center;
		
		.download-warpper {
			width: 460rpx;
			background-color: #aaa;
			border-radius: 10px;
			padding: 32rpx 24rpx;
			
			.title {
				font-size: 24rpx;
				margin-bottom: 16rpx;
			}
		}
	}
</style>