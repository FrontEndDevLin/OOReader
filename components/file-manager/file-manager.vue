<template>
	<view :class="showAnimate ? 'file-manager show' : 'file-manager'" v-if="show">
		<view class="path">
			<view class="folder-name" v-for="oPath, index of currentPath" :key="index">
				<view @click="openFolder(oPath)">{{ oPath.name }}</view>
				<view class="right-icon">
					<text class="iconfont icon-right"></text>
				</view>
			</view>
		</view>
		<view class="list">
			<view class="item" v-for="item of folderList" :key="item.index" @click="openFolder(item)">
				<view class="icon">
					<text class="iconfont icon-folder"></text>
				</view>
				{{ item.name }}
			</view>
			<view class="item" v-for="item of fileList" :key="item.index">
				<view class="icon">
					<text class="iconfont icon-file"></text>
				</view>
				
				{{ item.name }}
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "file-manager",
		data() {
			return {
				show: false,
				showAnimate: false,
				
				folderList: [],
				fileList: [],
				
				currentPath: []
			};
		},
		
		mounted() {
			// #ifdef APP-PLUS
			let environment = plus.android.importClass("android.os.Environment");
			
			let sdRoot = environment.getExternalStorageDirectory() + "/";
			
			this.loadFileManage(sdRoot);
			// #endif
		},
		
		methods: {
			// api
			open() {
				this.show = true;
				setTimeout(() => {
					this.showAnimate = true;
				}, 30)
			},
			
			openFolder(item) {
				// console.log(item.fullPath)
				this.loadFileManage(item.fullPath);
				// for (let k in item) {
				// 	console.log(k)
				// }
			},
			
			loadFileManage(path) {
				// #ifdef APP-PLUS
				let environment = plus.android.importClass("android.os.Environment");
				let sdRoot = environment.getExternalStorageDirectory() + "/";
				this.currentPath = [
					{
						fullPath: sdRoot,
						name: "内部存储"
					}
				];
				let tempPath = path.replace(sdRoot, "");
				if (tempPath[tempPath.length - 1] == "/") {
					tempPath = tempPath.substring(0, tempPath.length - 1);
				}
				let sAyPath = tempPath ? tempPath.split("/") : [];
				let index = 0;
				for (let fName of sAyPath) {
					let fullPath = sdRoot;
					for (let i = 0; i <= index; i++) {
						fullPath += sAyPath[i] + "/"
					}
					// console.log(fullPath)
					this.currentPath.push({
						name: fName,
						fullPath
					});
					index++;
				}
				
				plus.io.resolveLocalFileSystemURL(path, (entry) => {
					var directoryReader = entry.createReader();
					directoryReader.readEntries(
						entries => {
							// for (let k in entries[0]) {
							// 	console.log(k)
							// 	console.log(entries[0][k])
							// 	console.log("+++++++")
							// }
							// for (var i = 0; i < entries.length; i++) {
							// 	console.log("文件信息：" + entries[i].name);
							// }
							this.folderList = [];
							this.fileList = [];
							let index = 0;
							for (let item of entries) {
								if (/^\./.test(item.name)) {
									continue;
								}
								item.index = index++;
								if (item.isFile) {
									this.fileList.push(item);
								}
								if (item.isDirectory) {
									this.folderList.push(item);
								}
							}
						}, 
						err => {
							
						}
					);
				}, (err) => {
					console.log(err)
				})
				// #endif
			}
		}
	}
</script>

<style lang="less">
	.file-manager {
		width: 100%;
		height: 100%;
		overflow: auto;
		z-index: 10;
		position: absolute;
		top: 0;
		transform: translateX(100%);
		transition: transform .2s;
		background: #fff;
		
		&.show {
			transform: translateX(0);
		}
		
		.path {
			padding: 40rpx;
			display: flex;
			flex-wrap: wrap;
			font-size: 24rpx;
			
			.folder-name {
				display: flex;
				
				.right-icon {
					margin: 0 6rpx;
				}
			}
		}
		
		.list {
			padding: 0 40rpx;
			
			.item {
				padding: 20rpx 0;
				display: flex;
				align-items: center;
				border-bottom: 1px solid #d9d9d9;
				
				.icon {
					width: 80rpx;
					text-align: center;
					.iconfont {
						font-size: 60rpx;
						
						&.icon-folder {
							color: #FFCA28;
						}
						
						&.icon-file {
							color: #72CAF9;
						}
					}
					margin-right: 20rpx;
				}
			}
		}
	}
</style>