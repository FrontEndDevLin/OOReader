<template>
	<view>
		<web-view :src="url"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				url: ""
			}
		},
		created() {
			this.url = getApp().globalData.privacyUrl;
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
