<template>
	<view class="reader" id="reader" :style="{ paddingTop: layout.paddingTop + 'px', paddingBottom: layout.paddingBottom + 'px' }">
		<view class="inner" id="content">
			<view class="page prev"></view>
			<view class="page current" id="page" :style="{ top: '-' + pageOptions.current.top }">
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
			</view>
			<view class="page next">
				
			</view>
		</view>
	</view>
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
				path: "",
				
				layout: {
					paddingTop: 0,
					paddingBottom: 0,
					
					fontSize: "18px",
					lineHeight: "36px",
				},
				
				viewArr: [],
				
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
			let initRes = bookReader.init(bookName);
			
			let data = bookReader.getData();
			
			if (data.code == 200) {
				this.viewArr = data.data;
			}
		},
		created() {
			// console.log() 
		},
		mounted() {
			const query = uni.createSelectorQuery().in(this);
			query.select('#content').boundingClientRect(data => {
				let height = data.height;
				let intHeight = parseInt(height);
				let dblHeight = height - intHeight;
				// console.log(dblHeight)
				this.layout.paddingTop = dblHeight;
				this.layout.paddingBottom = 10;
				
				let contentHeight = height - this.layout.paddingTop - this.layout.paddingBottom;
				// console.log(contentHeight);
				let lineCnt = contentHeight / parseInt(this.layout.lineHeight);
				lineCnt = parseInt(lineCnt) - 1;
				let newContentHeight = lineCnt * parseInt(this.layout.lineHeight);
				console.log(newContentHeight);
				let offset = contentHeight - newContentHeight;
				this.layout.paddingTop += offset / 2;
				this.layout.paddingBottom += offset / 2;
				
				this.$nextTick(() => {
					let query2 = uni.createSelectorQuery().in(this);
					query2.select("#page").boundingClientRect(data => {
						let totalHeight = data.height;
						let pageCnt = Math.ceil(totalHeight / newContentHeight);
						for (let page = 1; page <= pageCnt; page++) {
							this.pageList.push({
								page: page,
								top: (page - 1) * newContentHeight
							});
						}
						
						// temp
						this.pageOptions.prev.top = this.pageList[0].top + "px";
						this.pageOptions.current.top = this.pageList[1].top + "px";
						this.pageOptions.next.top = this.pageList[2].top + "px";
					}).exec();
					
					let query3 = uni.createSelectorQuery().in(this);
					query3.select(".item").boundingClientRect(data => {
						console.log(data)
					}).exec()
				});
				
			}).exec();
		},
		methods: {
			getRandomColor() {
				let color = "#";
				for (let i = 0; i < 3; i++) {
					let n = parseInt(Math.random() * 10);
					color += n;
				}
				return color;
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
			overflow: hidden;
			position: relative;
			
			.page {
				width: 100%;
				// height: 100%;
				background-color: #fff;
			}
			
			.page.current {
				position: absolute;
				top: 0;
				left: 0;
				z-index: 2;
			}
			.page.prev {
				position: absolute;
				top: 0;
				left: -100%;
				z-index: 3;
			}
			.page.next {
				position: absolute;
				top: 0;
				left: 0;
				z-index: 1;
			}
			
			.item {
				// font-size: 14px;
				// line-height: 21px;
				// border: 1px solid #000;
				box-sizing: border-box;
				&.title {
					// font-size: 16px;
				}
			}
		}
		
	}
</style>
