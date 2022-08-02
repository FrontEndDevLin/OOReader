<template>
	<view class="reader" id="reader" :style="{ paddingTop: layout.paddingTop + 'px', paddingBottom: layout.paddingBottom + 'px' }">
		<view class="inner" id="content">
			<view 
				:class="idx == 0 ? 'item title' : 'item'" 
				v-for="txt, idx of viewArr"
				:style="{
					fontSize: layout.fontSize,
					height: layout.height,
					lineHeight: layout.lineHeight
				}"
			>
				{{ txt }}
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
				
				viewArr: []
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
			}).exec();
		},
		methods: {
			
		}
	}
</script>

<style lang="less">
	.reader {
		width: 100%;
		height: 100vh;
		background-color: #ddd;
		
		.inner {
			background-color: #fff;
			width: 100%;
			height: 100%;
			overflow: auto;
			
			.item {
				// font-size: 14px;
				// line-height: 21px;
				&.title {
					// font-size: 16px;
				}
			}
		}
		
	}
</style>
