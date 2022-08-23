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
					<view class="book-item" @click="toReader">
						<view class="book-content">
							<view class="book-name">
								太平要术
							</view>
						</view>
						<view class="book-shadow"></view>
						<view class="book-line">
							<view class="line line1"></view>
							<view class="line line2"></view>
							<view class="line line3"></view>
							<view class="line line4"></view>
						</view>
					</view>
				</view>
				
			</view>
		</view>
		
		<fileManager ref="fileManager" @onCheckFile="importFile"/>
	</view>
</template>

<script>
	import fileManager from "../../components/file-manager/file-manager.vue";
	import { FileImporter } from "../../utils/fileManager.js";
	
	export default {
		data() {
			return {
				path: ""
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
		methods: {
			search() {
				
			},
			
			input() {
				
			},
			
			openImportWin() {
				this.$refs.fileManager.open();
			},
			
			importFile(file) {
				let fileImporter = new FileImporter();
				fileImporter.importFile(file);
			},
			
			toReader() {
				uni.navigateTo({
					url: "../reader/reader?path=" + this.path
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
