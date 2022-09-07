<template>
	<web-view :src="'/hybrid/html/reader.html?theme=' + theme + '&font=' + font" ref="webView" @message="onMessage"></web-view>
</template>

<script>
	import { BookReader, FileImporter } from "../../utils/fileManager";
	
	/**
	 * 标题占两个行高，字号为一个行高
	 * 字号与行高
	 * 14 -> 28
	 * 16 -> 32
	 * 18 -> 36
	 * 20 -> 40
	 * 22 -> 44
	 * 24 -> 48
	 * 
	 * 初始化使用屏幕高度 / 行高，得到最多可显示的行数，
	 * 
	 */
	
	export default {
		data() {
			return {
				wv: null,
				bookReader: null,
				
				theme: uni.getStorageSync("theme") || "sun",
				font: uni.getStorageSync("font") || 18,
				
				path: "", 
				
				fileImporter: null,
				
				viewArr: [],
				page: 0,
				file: "",
				
				pageList: [],
				pageOptions: {
					prev: {
						top: "",
					},
					current: {
						top: ""
					},
					next: {
						top: ""
					}
				},
				
				bookName: "",
				path: "",
				
				timer: null
			}
		},
		onLoad(option) {
			// return;
			// let sysInfo = uni.getSystemInfoSync();
			// let screenHeight = sysInfo.screenHeight;
			// console.log(screenHeight);
			this.bookName = option.book;
			this.path = option.path;
			
			let bookReader = new BookReader();
			this.bookReader = bookReader;
			let initRes = bookReader.init(this.bookName);
			let data = bookReader.initData();
			
			if (data.code == 200) {
				data = data.data;
				this.viewArr = data.content;
				this.page = data.page;
				this.file = data.file;
			}
		},
		created() {
			// console.log() 
		},
		mounted() {
			let currentWebview = this.$scope.$getAppWebview();
			this.wv = currentWebview.children()[0];
			
			this.wv.evalJS("initView('" + JSON.stringify(this.viewArr) + "', " + this.page + ")");
			
			let sessionList = this.bookReader.getSessionList();
			this.wv.evalJS("loadSessionList('" + JSON.stringify(sessionList) + "')");
			
			this.wv.evalJS("loadSessionInfo('" + JSON.stringify(this.bookReader.storage.current) + "')");
			this.bookReader.onPageChange = (oSession) => {
				this.wv.evalJS("loadSessionInfo('" + JSON.stringify(oSession) + "')");
			}
			
			this.timer = setTimeout(() => {
				// 如果没全导入，继续导入
				if (!this.bookReader.storage.allImport) {
					this.fileImporter = new FileImporter();
					this.$nextTick(() => {
						this.fileImporter.importFile({
							name: this.bookName,
							fullPath: this.path
						});
					});
					
					this.fileImporter.statusChange = (e) => {
						switch (e){
							case "loadChunk": {
								console.log("加载20个");
								this.bookReader.updateStorage();
								let sessionList = this.bookReader.getSessionList();
								this.wv.evalJS("loadSessionList('" + JSON.stringify(sessionList) + "')");
								// console.log(this.bookReader.sessionMap)
								// this.fileImporter.importing = false;
							} break;
							case "complete": {
								console.log("加载完成")
								this.bookReader.updateStorage();
								let sessionList = this.bookReader.getSessionList();
								this.wv.evalJS("loadSessionList('" + JSON.stringify(sessionList) + "')");
							} break;
						}
					}
				} else {
					console.log("已全部")
				}
			}, 2000)
		},
		beforeDestroy() {
			// console.log(138)
			// 如果还未导入完成，停止导入
			clearTimeout(this.timer);
			if (!this.bookReader.storage.allImport) {
				this.fileImporter.importing = false;
			}
		},
		methods: {
			onMessage(e) {
				let oMsg = e.detail.data[0];
				switch (oMsg.action){
					case "E_SET_THEME": {
						uni.setStorageSync("theme", oMsg.type);
					} break;
					case "E_NEXT_PAGE": {
						this.bookReader.nextPage();
					} break;
					case "E_PREV_PAGE": {
						this.bookReader.prevPage();
					} break;
					case "E_PRELOAD": {
						if (oMsg.type == "next") {
							// 预载下一章
							let data = this.bookReader.preloadData("next");
							if (!data) {
								return;
							}
							
							if (data.code == 200) {
								data = data.data;
								let viewArr = data.content;
								// let page = data.page;
								this.wv.evalJS("preloadNext('" + JSON.stringify(viewArr) + "')");
							} else {
								console.log(data.code) 
							}
						} else if (oMsg.type == "prev") {
							let data = this.bookReader.preloadData("prev");
							if (!data) {
								return;
							}
							if (data.code == 200) {
								data = data.data;
								let viewArr = data.content;
								this.wv.evalJS("preloadPrev('" + JSON.stringify(viewArr) + "')");
							} else {
								console.log(data.code)
							} 
						}
					} break;
					case "E_NEXT_SESSION": {
						this.bookReader.nextSession();
					} break;
					case "E_PREV_SESSION": {
						let page = oMsg.page;
						this.bookReader.prevSession(page);
					} break;
					case "E_READ_SESSION": {
						let file = oMsg.file;
						
						this.bookReader.skipSession(file);
						
						let data = this.bookReader.initData();
						
						if (data.code == 200) {
							data = data.data;
							this.viewArr = data.content;
							this.page = data.page;
							this.wv.evalJS("initView('" + JSON.stringify(this.viewArr) + "', " + this.page + ")");
							this.wv.evalJS("loadSessionInfo('" + JSON.stringify(this.bookReader.storage.current) + "')");
						}
					} break;
					case "E_SET_FONT": {
						let fontSize = oMsg.fontSize;
						uni.setStorageSync("font", fontSize);
						this.bookReader.resetSession();
						
						let data = this.bookReader.initData();
						if (data.code == 200) {
							data = data.data;
							this.viewArr = data.content;
							this.page = data.page;
							this.wv.evalJS("initView('" + JSON.stringify(this.viewArr) + "', " + this.page + ")");
							this.wv.evalJS("loadSessionInfo('" + JSON.stringify(this.bookReader.storage.current) + "')");
						}
					}
				}
			}
		}
	}
</script>

<style lang="less">
	.reader {
		width: 100%;
		height: 100vh;
		// background-color: #ddd;
		
		.inner {
			width: 100%;
			height: 100%;
			
			position: relative;
			
			.page {
				// width: 100%;
				height: 100%;
				background-color: #fff;
				box-sizing: border-box;
			}
			
			.item {
				// font-size: 14px;
				// line-height: 21px;
				// border: 1px solid #000;
				padding: 0 10px;
				box-sizing: border-box;
				&.title {
					// font-size: 16px;
				}
			}
		}
		
	}
</style>
