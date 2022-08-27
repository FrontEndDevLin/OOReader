<template>
	<web-view src="/hybrid/html/reader.html" ref="webView" @message="onMessage"></web-view>
	<!-- <view class="reader" id="reader" style="display: none;">
		<view class="inner" id="content">
			<scroll-view 
				class="page current" 
				id="page" 
				ref="page"
				:style="{
					paddingTop: layout.paddingTop + 'px', 
					paddingBottom: layout.paddingBottom + 'px',
					columns: layout.pageWidth + ' 1'
				}"
			>
				<view 
					:class="idx == 0 ? 'item title' : 'item'" 
					v-for="txt, idx of viewArr"
					:style="{
						fontSize: layout.fontSize,
						lineHeight: layout.lineHeight
					}"
				>
					{{ txt }}
				</view>
			</scroll-view>
		</view>
	</view> -->
</template>

<script>
	import { BookReader } from "../../utils/fileManager";
	
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
				
				path: "",
				
				layout: {
					pageWidth: "",
					
					paddingTop: 0,
					paddingBottom: 0,
					
					fontSize: "18px",
					lineHeight: "36px",
				},
				
				viewArr: [],
				page: 0,
				
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
				}
			}
		},
		onLoad(option) {
			// return;
			// let sysInfo = uni.getSystemInfoSync();
			// let screenHeight = sysInfo.screenHeight;
			// console.log(screenHeight);
			// console.log(option.path);
			let bookName = "全职艺术家.txt";
			let bookReader = new BookReader();
			this.bookReader = bookReader;
			let initRes = bookReader.init(bookName);
			
			let data = bookReader.initData();
			
			if (data.code == 200) {
				data = data.data;
				this.viewArr = data.content;
				this.page = data.page;
			}
			
		},
		created() {
			// console.log() 
		},
		mounted() {
			let currentWebview = this.$scope.$getAppWebview();
			this.wv = currentWebview.children()[0];
			
			this.wv.evalJS("initView('" + JSON.stringify(this.viewArr) + "', " + this.page + ")");
			
			this.wv.evalJS("loadSessionInfo('" + JSON.stringify(this.bookReader.storage.current) + "')");
			this.bookReader.onPageChange = (oSession) => {
				this.wv.evalJS("loadSessionInfo('" + JSON.stringify(oSession) + "')");
			}
		},
		methods: {
			onMessage(e) {
				let oMsg = e.detail.data[0];
				switch (oMsg.action){
					case "E_NEXT_PAGE": {
						this.bookReader.nextPage();
					} break;
					case "E_PREV_PAGE": {
						this.bookReader.prevPage();
					} break;
					case "E_PRELOAD": {
						if (oMsg.type == "next") {
							// 预载下一章
							console.log("预加载");
							let data = this.bookReader.preloadData("next");
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
