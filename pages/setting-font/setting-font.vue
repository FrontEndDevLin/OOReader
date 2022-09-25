<template>
	<view>
		<view class="list">
			<view class="item" v-for="font of fontList" :key="font" @click="setFont(font)">
				<view class="label">
					<text>{{ font }}</text>
				</view>
				<text class="iconfont icon-check" v-if="font == currentFont"></text>
			</view>
		</view>
	</view>
</template>

<script>
	import { FileManager } from "../../utils/fileManager.js";
	
	export default {
		data() {
			return {
				currentFont: "",
				fontList: [14, 16, 18, 20, 22, 24, 26, 28, 30],
				
				fManager: null
			}
		},
		created() {
			this.fManager = new FileManager();
			this.fManager.init();
		},
		onLoad() {
			this.getCurrnetFont();
		},
		methods: {
			getCurrnetFont() {
				this.currentFont = uni.getStorageSync("font") || 18;
			},
			
			setFont(font) {
				let bookList = this.fManager.getBookList();
				for (let oBook of bookList) {
					let bookName = oBook.book;
					let storageKey = "book_" + bookName;
					let bookStorage = uni.getStorageSync(storageKey);
					try {
						bookStorage = JSON.parse(bookStorage);
						if (bookStorage.current.page != 1) {
							bookStorage.current.page = 1;
							uni.setStorageSync(storageKey, JSON.stringify(bookStorage));
						}
					} catch(e){
						
					}
				}
				
				uni.setStorageSync("font", font);
				this.getCurrnetFont();
			}
		}
	}
</script>

<style lang="less" scoped>
	.list {
		.item {
			display: flex;
			justify-content: space-between;
			padding: 30rpx 40rpx;
			border-bottom: 1px solid #d9d9d9;
			align-items: center;
			
			.label {
				display: flex;
				align-items: center;
				.iconfont {
					margin-right: 20rpx;
					font-size: 40rpx;
				}
			}
		}
	}
</style>
