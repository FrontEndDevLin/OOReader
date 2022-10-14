<template>
	<view class="page">
		<!-- <view class="header">
			<uni-search-bar @confirm="search" @input="input" cancelButton="none" placeholder="搜索已有书本"></uni-search-bar>
		</view> -->
		<view class="container">
			<view class="btn-list">
				<button type="default" @click="showImportWin">
					<text class="iconfont icon-add"></text>
					导入电子书
				</button>
			</view>
			<view class="bookshelf">
				<view class="book-list">
					<view class="book-item" v-for="oBook, index of bookList" :key="index" @longpress="showBtns(index)">
						<view class="book-content" @click="toReader(oBook)">
							<view class="book-name">
								{{ oBook.book }}
							</view>
						</view>
						<view class="book-shadow"></view>
						<view class="book-line">
							<view class="line line1"></view>
							<view class="line line2"></view>
							<view class="line line3"></view>
							<view class="line line4"></view>
						</view>
						<view class="btns-warpper" v-if="oBook.showBtns">
							<view class="mask" @click="hideBtns"></view>
							<view class="btns">
								<view class="small-btn" @click="delBook(oBook)">删除</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<fileManager ref="fileManager" @onCheckFile="importFile"/>
		
		<update ref="updateComp"/>
		
		<view class="select-box" v-if="showSelectBox">
			<view class="select-box-mask" @click="hideImportWin()"></view>
			<view class="select-box-warpper">
				<view class="tips">选择一种导入方式<text class="tips2">（仅支持.txt后缀的文件）</text></view>
				<view class="select-list">
					<view class="select-item" @click="openImportWin">
						<view class="iconfont icon-file"></view>
						<view class="label">本地导入</view>
					</view>
					<view class="select-item">
						<view class="iconfont icon-src"></view>
						<view class="label">链接导入</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import fileManager from "../../components/file-manager/file-manager.vue";
	import update from "../../components/update/update.vue";
	import { FileImporter, FileManager } from "../../utils/fileManager.js";
	import { getDeviceMac } from "../../utils/utils.js";
	
	export default {
		data() {
			return {
				bookList: [],
				oBookList: [],
				fManager: null,
				fileImporter: null,
				
				showSelectBox: false,
				
				// key: "",
				// selectList: [
				// 	{
				// 		key: "del",
				// 		text: "删除"
				// 	}
				// ]
			}
		},
		components: {
			fileManager
		},
		onBackPress(e) {
			if (this.$refs.fileManager.show) {
				this.$refs.fileManager.close();
				return true;
			}
		},
		async created() {
			this.checkUser();
			
			// 获取隐私政策url
			const cloudUser = uniCloud.importObject('user') // 导入云对象
			try {
				let privacyInfo = await cloudUser.privacyInfo();
				if (privacyInfo) {
					getApp().globalData.privacyUrl = privacyInfo.url;
					getApp().globalData.privacyVer = privacyInfo.version;
				}
			} catch (e) {
			}
			
			// 隐私政策确认
			let isAccessPrivacyPolicy = uni.getStorageSync("accessPrivacyPolicy");
			let privacyPolicyVer = uni.getStorageSync("privacyPolicyVer");
			// 隐私政策版本更新时，也会就行弹窗
			if (!isAccessPrivacyPolicy || getApp().globalData.privacyVer != privacyPolicyVer) {
				uni.redirectTo({
					url: "../privacy-confirm/privacy-confirm"
				})
				return;
			}
			
			plus.android.requestPermissions(['android.permission.WRITE_EXTERNAL_STORAGE'], (e) => {
				if (e.deniedAlways.length > 0) { //权限被永久拒绝
					// 弹出提示框解释为何需要读写手机储存权限，引导用户打开设置页面开启
					console.log('Always Denied!!! ' + e.deniedAlways.toString());
					
					uni.showModal({
						title: "提示",
						content: "当前未授权读写文件权限，会导致无法导入和阅读，请到设置->应用中手动开启权限",
						showCancel: false
					});
				}
				if (e.deniedPresent.length > 0) { //权限被临时拒绝
					// 弹出提示框解释为何需要读写手机储存权限，可再次调用plus.android.requestPermissions申请权限
					uni.showModal({
						title: "提示",
						content: "当前未授权读写文件权限，会导致无法导入和阅读文件，是否重新授权？",
						success(e) {
							if (e.confirm) {
								plus.android.requestPermissions(['android.permission.WRITE_EXTERNAL_STORAGE'])
							}
						}
					});
					
					console.log('Present Denied!!! ' + e.deniedPresent.toString());
				}
				if (e.granted.length > 0) { //权限被允许
					//调用依赖获取读写手机储存权限的代码
					let fManager = new FileManager();
					this.fManager = fManager;
					fManager.init();
					this.bookList = fManager.getBookList();
					
					this.fileImporter = new FileImporter();
					
					this.fileImporter.statusChange = async (e, data) => {
						switch (e){
							case "importing": {
								console.log("导入中")
							} break;
							case "preloaded": {
								uni.showToast({
									icon: "none",
									title: "预载完成"
								});
								let file = data.file;
								this.fManager.addBook(file);
								this.bookList = this.fManager.getBookList();
								
								this.fileImporter.importing = false;
							} break;
							case "complete": {
								let file = data.file;
								if (!this.fManager.exists(file)) {
									this.fManager.addBook(file);
									this.bookList = this.fManager.getBookList();
									
									this.fileImporter.importing = false;
								}
							}
						}
					}
					
					this.loadInitFile();
				}
			}, function(e) {
				console.log('Request Permissions error:' + JSON.stringify(e));
			});
			
			
		},
		mounted() {
			this.$refs.updateComp.checkUpdate(true, (version) => {
				if (uni.getStorageSync("skip_" + version)) {
					return false;
				}
			});
		},
		methods: {
			async checkUser() { // 注意异步
				let macAddr = getDeviceMac();
			
				const cloudUser = uniCloud.importObject('user') // 导入云对象
				try {
					let userData = await cloudUser.checkUser(macAddr);
					if (userData) {
						getApp().globalData.uid = userData.uid;
					}
				} catch (e) {
				}
			},
			
			loadInitFile() {
				uni.setStorageSync("initFileDownloaded", false); 
				let initFileDownloaded = uni.getStorageSync("initFileDownloaded");
				if (initFileDownloaded) {
					return;
				}
				// return console.log("下载使用说明")
				
				const db = uniCloud.database();
				db.collection('file').where({ type: "initFile" }).get({
					getOne: true
				}).then(res => {
					res = res.result;
					if (res.data) {
						// 获取文件名
						let link = res.data.link;
						let fileName = res.data.fileName + ".txt";
						
						let File = plus.android.importClass("java.io.File");
						
						let fileSaveUrl = plus.io.convertLocalFileSystemURL("_downloads/" + fileName);
						let file = new File(fileSaveUrl);
						if (file.exists()) {
							plus.io.resolveLocalFileSystemURL(fileSaveUrl, entry => {
								this.importFile(entry);
								uni.setStorageSync("initFileDownloaded", true);
							});
						} else {
							let dtask = plus.downloader.createDownload(link, {
								timeout: 10,
								retry: 1,
								filename: "_downloads/" + fileName
							}, (d, status) => {
								// d为下载的文件对象
								if (status == 200) {
									plus.io.resolveLocalFileSystemURL(fileSaveUrl, entry => {
										this.importFile(entry);
										uni.setStorageSync("initFileDownloaded", true);
									})
								} else {
									//下载失败
									plus.downloader.clear(); //清除下载任务
								}
							});
							dtask.start(); 
						}
						
					}
				})
			},
			
			// search() {
				
			// },
			
			// input() {
				
			// },
			showImportWin() {
				this.showSelectBox = true;
			},
			hideImportWin() {
				this.showSelectBox = false;
			},
			
			openImportWin() {
				this.hideImportWin();
				this.$nextTick(() => {
					this.$refs.fileManager.open();
				})
			},
			
			importFile(file) {
				if (this.fileImporter.importing) {
					this.fileImporter.importing = false;
					this.fileImporter.afterStop = () => {
						this.fileImporter.importFile(file);
					}
					return;
				}
				this.fileImporter.afterStop = null;
				this.$nextTick(() => {
					this.fileImporter.importFile(file);
				});
			},
			
			toReader(oBook) {
				uni.navigateTo({
					url: "../reader/reader?book=" + oBook.book + "&path=" + oBook.path
				})
			},
			
			showBtns(index) {
				// console.log(119)
				let bookList = JSON.parse(JSON.stringify(this.bookList));
				// oBook.showBtns = true;
				bookList[index].showBtns = true;
				this.bookList = bookList;
			},
			hideBtns() {
				let bookList = JSON.parse(JSON.stringify(this.bookList));
				for (let oBook of bookList) {
					oBook.showBtns = false;
				}
				this.bookList = bookList;
			},
			delBook(oBook) {
				uni.showModal({
					title: "提示",
					content: "确认要删除" + oBook.book + "?",
					complete: (e) => {
						if (e.confirm) {
							uni.showLoading({
								title: "请稍等",
								mask: true
							});
							this.$nextTick(() => {
								this.fManager.delBook(oBook.book);
								this.bookList = this.fManager.getBookList();
								uni.hideLoading();
							})
						}
					}
				})
			}
		}
	}
</script>

<style lang="less">
	.page {
		position: relative;
		height: 100vh;
	}
	
	.container {
		padding: 0 40rpx;
		padding-top: 40rpx;
		position: absolute;
		width: 100%;
		
		.btn-list {
			margin-bottom: 40rpx;
			
			.iconfont {
				margin-right: 8rpx;
				font-size: 32rpx;
				color: #465D93;
			}
		}
		
		.book-list {
			padding-right: 10rpx;
			// padding-bottom: 20rpx;
			border-bottom: 1px solid #d9d9d9;
			margin-bottom: 20rpx;
			
			.book-item {
				display: inline-block;
				width: 200rpx;
				height: 300rpx;
				position: relative;
				margin-right: 30rpx;
				margin-bottom: 30rpx;
				
				.btns-warpper {
					width: 100%;
					height: 100%;
					position: absolute;
					top: 0;
					left: 0;
					z-index: 99;
					text-align: center;
					display: flex;
					justify-content: center;
					flex-direction: column;
					align-items: center;
					
					.mask {
						width: 100%;
						height: 100%;
						background-color: rgba(255, 255, 255, 0.4);
						position: absolute;
						top: 0;
						left: 0;
					}
					
					.btns {
						width: 80rpx;
						position: relative;
						z-index: 1;
						
						.small-btn {
							width: 100%;
							border: 1px solid #ccc;
							display: inline-block;
							padding: 2rpx 0;
							// color: #333;
							font-size: 24rpx;
							background-color: #fff;
						}
					}
				}
				
				
				&:nth-child(3n+0) {
					margin-right: 0;
				}
				
				.book-content {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					border: 1px solid #d9d9d9;
					background-color: #465D93;
					border-radius: 10rpx;
					z-index: 2;
					
					.book-name {
						height: 240rpx;
						position: absolute;
						left: 30rpx;
						top: 20rpx;
						background-color: #fff;
						padding: 10rpx 4rpx;
						writing-mode: vertical-rl;
						border-radius: 4rpx;
						
						white-space: nowrap;
						overflow: hidden;
						// /*文字超出用省略号*/
						text-overflow: ellipsis;
						// /*盒子模型*/
						// display: -webkit-box;
						// /*显示的文本行数,3行*/
						// -webkit-line-clamp: 2;
						// /*子元素的垂直排列方式*/
						// box-orient: vertical; 
					}
				}
				
				.book-shadow {
					position: absolute;
					top: 10rpx;
					left: 10rpx;
					width: 100%;
					height: 100%;
					border: 1px solid #d9d9d9;
					background-color: #fff;
					border-radius: 10rpx;
					z-index: 1;
				}
				
				.book-line {
					position: absolute;
					width: 20rpx;
					height: 100%;
					top: 0;
					right: 0;
					border-left: 1px solid #d9d9d9;
					z-index: 2;
					
					.line {
						position: absolute;
						height: 1px;
						width: 100%;
						background-color: #fff;
					}
					.line1 {
						top: 12.5%;
					}
					.line2 {
						top: 37.5%;
					}
					.line3 {
						bottom: 37.5%;
					}
					.line4 {
						bottom: 12.5%;
					}
				}
			}
		}
		
	}
	
	.select-box {
		width: 100%;
		height: 100%;
		position: absolute;
		left: 0;
		top: 0;
		z-index: 20;
		
		.select-box-mask {
			width: 100%;
			height: 100%;
			position: absolute;
			left: 0;
			top: 0;
		}
		
		.select-box-warpper {
			width: 580rpx;
			height: 320rpx;
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			margin: auto;
			background-color: #fff;
			padding: 20rpx 30rpx;
			border-radius: 10px;
			border: 1px solid #d9d9d9;
			
			.tips {
				margin-bottom: 40rpx;
				.tips2 {
					color: #999;
					font-size: 20rpx;
				}
			}
			
			
			.select-list {
				display: flex;
				justify-content: space-around;
				
				.select-item {
					text-align: center;
					font-size: 28rpx;
					color: #666;
					
					.iconfont {
						font-size: 100rpx;
						margin-bottom: 14rpx;
						
						&.icon-file {
							color: #72CAF9;
						}
						&.icon-src {
							color: #FFCA28;
						}
					}
				}
			}
		}
	}
</style>
