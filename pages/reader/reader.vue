<template>
	<view class="reader" id="reader" v-if="path">
		<web-view :src="path"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				path: ""
			}
		},
		onLoad(option) {
			// console.log(option.path);
			this.path = "/hybrid/html/reader.html?bookpath=" + "/storage/emulated/0/Download/全职艺术家.txt";
			// this.path = "http://192.168.88.145:4449/html/reader.html?bookpath=" + "/storage/emulated/0/Download/程序员健康指南.epub";
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
		background-color: #fff;
	}
</style>
