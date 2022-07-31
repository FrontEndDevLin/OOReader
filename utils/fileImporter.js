// #ifdef APP-PLUS

let environment = plus.android.importClass("android.os.Environment");
let sdRoot = environment.getExternalStorageDirectory();

let File = plus.android.importClass("java.io.File");
let FileReader = plus.android.importClass("java.io.FileReader");
let FileWriter = plus.android.importClass("java.io.FileWriter");
let BufferedReader = plus.android.importClass("java.io.BufferedReader");
// #endif

/**
 * storage配置格式
 * - bookname
 * -- allImport boolean
 * -- sessionList array
 * --- sessionName string
 * --- file session_1
 * 
 * 启动应用时，检查有没有全部导入，如果没有
 */

let titleReg = /^(正文){0,1}(第)([零〇一二三四五六七八九十百千万a-zA-Z0-9]{1,7})[章节卷集部篇回]((?! {4}).)((?!\t{1,4}).){0,30}/g;

class FileImporter {
	constructor() {
		this.statusChange = null;
		
		this.importing = false;
		
		this.storageManager = new StorageManager();
	}
	
	importFile(file) {
		console.log("导入中");
		this.importing = true;
		
		let path = file.fullPath;
		let name = file.name;
		
		this.storageManager.init(name);
		// return;
		
		if (this.storageManager.storage.allImport) {
			// 已有导入
			return;
		}
		if (this.statusChange) {
			this.statusChange("importing");
		}
		
		let txtCachePath = sdRoot + "/OOReader/" + name.replace(".txt", "");
		let directory = new File(txtCachePath);
		if (!directory.exists()) {
			directory.mkdirs();
		}
		
		let txtFile = new File(path);
		try {
			let reader = new BufferedReader(new FileReader(txtFile));
			let arr = [];
			let txt;
			let cacheCnt = 0;
			while ((txt = reader.readLine()) != null) {
				if (titleReg.test(txt)) {
					let fName = "session_" + cacheCnt;
					
					if (this.storageManager.exists(txt, fName)) {
						console.log(`存在: ${txt}`);
					} else {
						let data = JSON.stringify(arr);
						
						let f = new File(txtCachePath + "/" + fName);
						if (!f.exists()) {
							f.createNewFile(); //创建文件
							let fReader = new FileWriter(txtCachePath + "/" + fName, true);
							fReader.write(data);
							fReader.close();
							this.storageManager.write(txt, fName);
						}
						
					}
					
					cacheCnt++;
					console.log(`导入${cacheCnt}个文件`);
					arr = [txt];
				} else {
					arr.push(txt)
				}
			}
			// 最后一个文件
			if (arr.length) {
				let sessionName = arr[0];
				let fName = "session_" + cacheCnt;
				if (this.storageManager.exists(sessionName, fName)) {
					
				} else {
					let data = JSON.stringify(arr);
					let f = new File(txtCachePath + "/" + fName);
					if (!f.exists()) {
						f.createNewFile(); //创建文件
						let fReader = new FileWriter(txtCachePath + "/" + fName, true);
						fReader.write(data);
						fReader.close();
						this.storageManager.write(txt, fName);
					}
				}
				
				console.log(`导入${cacheCnt}个文件`);
				arr = [];
			}
		} catch(e) {
			console.log(e)
		}
		
		this.storageManager.complete();
		console.log(`导入完成`);
	}
}

class StorageManager {
	constructor() {
		this.bookName = "";
		this.storage = null;
		
		this.sessionMap = {};
		
		this.storageKey = "";
	}
	
	init(bookName) {
		this.bookName = bookName;
		let storageKey = "book_" + bookName;
		this.storageKey = storageKey;
		let bookStorage = uni.getStorageSync(storageKey);
		// let bookStorage = uni.removeStorageSync(storageKey);
		if (!bookStorage) {
			uni.setStorageSync(storageKey, JSON.stringify({ 
				allImport: false, 
				current: {
					session: "",
					page: 0
				},
				sessionList: [],
			}));
			bookStorage = uni.getStorageSync(storageKey);
		}
		try {
			this.storage = JSON.parse(bookStorage);
			
			for (let item of this.storage.sessionList) {
				this.sessionMap[item.sessionName] = item.file;
			}
		} catch(e) {
			uni.removeStorageSync(storageKey);
			this.init(bookName);
		}
	}
	
	exists(sessionName, fileName) {
		return this.sessionMap[sessionName] == fileName;
	}
	
	write(sessionName, fileName) {
		if (!this.storage) {
			return;
		}
		this.storage.sessionList.push({
			sessionName,
			file: fileName
		});
		this.sessionMap[sessionName] = fileName;
		uni.setStorageSync(this.storageKey, JSON.stringify(this.storage));
	}
	
	complete() {
		this.storage.allImport = true;
		uni.setStorageSync(this.storageKey, JSON.stringify(this.storage));
	}
}

export default FileImporter;