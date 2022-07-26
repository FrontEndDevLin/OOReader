<template>
	<view class="reader" id="reader">
		<!-- 
			总百分比，章节名称，当前页/章节总页，
			导入文件的处理:
			epubjs
		 -->
	</view>
</template>

<script>
	import Epub from "epubjs";
	
	export default {
		data() {
			return {
				path: "",
				book: null,
				rendition: null
			}
		},
		onLoad(option) {
			this.path = option.path;
			// console.log(this.path)
			this.book = new Epub({ restore: true }); 
			this.book.open(this.path);
			
			this.rendition = this.book.renderTo('reader', {
				//滚动翻页
				// flow: "paginated",
				flow: 'scrolled-doc',
				method: 'default',
				restore: false
			});
			this.rendition.display();
		},
		created() {
			// console.log()
		},
		methods: {
			
		}
	}
</script>

<style lang="less">
	.reader {
		width: 100%;
		height: 100vh;
	}
</style>
