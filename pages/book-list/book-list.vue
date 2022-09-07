<template>
	<view class="page">
		<view class="header">
			<uni-search-bar @confirm="search" @input="input" cancelButton="none" placeholder="搜索已有书本"></uni-search-bar>
		</view>
		<view class="container">
			<view class="btn-list">
				<button type="default" @click="openImportWin">导入书籍</button>
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
		
		<!-- <picker :range="selectList" :value="key">
			<view class="uni-input">{{ selectList[index].text }}</view>
		</picker> -->
	</view>
</template>

<script>
	import fileManager from "../../components/file-manager/file-manager.vue";
	import { FileImporter, FileManager } from "../../utils/fileManager.js";
	
	export default {
		data() {
			return {
				bookList: [],
				fManager: null,
				fileImporter: null,
				
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
			// console.log(e)
			if (this.$refs.fileManager.show) {
				this.$refs.fileManager.close();
				return true;
			}
		},
		created() {
			let fManager = new FileManager();
			this.fManager = fManager;
			fManager.init();
			this.bookList = fManager.getBookList();
			// fManager.delBook("全职艺术家.txt");
			// fManager.delBook("将夜");
			
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
				}
			}
		},
		methods: {
			search() {
				
			},
			
			input() {
				
			},
			
			openImportWin() {
				this.$refs.fileManager.open();
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
		position: absolute;
		width: 100%;
		
		.btn-list {
			margin-bottom: 40rpx;
		}
		
		.book-list {
			padding-right: 10rpx;
			padding-bottom: 20rpx;
			border-bottom: 1px solid #d9d9d9;
			margin-bottom: 20rpx;
			
			.book-item {
				display: inline-block;
				width: 200rpx;
				height: 300rpx;
				position: relative;
				margin-right: 30rpx;
				
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
				
				
				&:last-child {
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
	
		
		.container2 {
			left: 100%;
		}
	}
</style>
