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
			let sessionName = "";
			let cacheCnt = 0;
			while ((txt = reader.readLine()) != null) {
				if (titleReg.test(txt)) {
					if (!arr.length) {
						sessionName = txt;
						arr = [sessionName];
						continue;
					}
					
					let fName = "session_" + cacheCnt;
					if (!sessionName) {
						// arr里为序章内容
						sessionName = arr[0];
					} else {
						// arr里为上一章内容
					}
					if (this.storageManager.exists(sessionName, fName)) {
						console.log(`存在: ${sessionName}`);
					} else {
						let data = JSON.stringify(arr);
						
						let f = new File(txtCachePath + "/" + fName);
						if (!f.exists()) {
							f.createNewFile(); //创建文件
							let fReader = new FileWriter(txtCachePath + "/" + fName, true);
							fReader.write(data);
							fReader.close();
							this.storageManager.write(sessionName, fName);
						}
					}
					cacheCnt++;
					console.log(`导入${cacheCnt}个文件`);
					sessionName = txt;
					arr = [sessionName];
				} else {
					arr.push(txt)
				}
			}
			// 最后一个文件
			if (arr.length) {
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
						this.storageManager.write(sessionName, fName);
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
					page: 1
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
		console.log(this.storage);
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

class BookReader {
	constructor() {
		this.bookName = "";
		this.sessionName = "";
		
		this.sessionMap = {};
		
		this.storage = null;
		
		this.storageKey = "";
		
		this.prev = null;
		this.next = null;
	}
	
	init(bookName) {
		this.bookName = bookName;
		
		let storageKey = "book_" + bookName;
		this.storageKey = storageKey;
		
		// uni.removeStorageSync(storageKey);
		let bookStorage = uni.getStorageSync(storageKey);
		
		if (!bookStorage) {
			return { message: "初始化失败，找不到指定书籍", code: 401 }
		}
		
		try {
			this.storage = JSON.parse(bookStorage);
			let sessionList = this.storage.sessionList;
			for (let i = 0; i < sessionList.length; i++) {
				let item = sessionList[i];
				this.sessionMap[item.sessionName] = {
					prev: i > 0 ? sessionList[i - 1] : null,
					file: item.file,
					next: i < sessionList.length ? sessionList[i + 1] : null
				};
			}
			
			if (!this.storage.current.sessionName) {
				this.storage.current.session = sessionList[1].sessionName;
				// TODO: 写缓存
			}
			
			return { message: "初始化成功", code: 200 }
		} catch(e) {
			return { message: "数据错误，请重新导入", code: 402 }
		}
	}
	
	// write(sessionName, fileName) {
	// 	if (!this.storage) {
	// 		return;
	// 	}
	// 	this.storage.sessionList.push({
	// 		sessionName,
	// 		file: fileName
	// 	});
	// 	this.sessionMap[sessionName] = fileName;
	// 	console.log(this.storage);
	// 	uni.setStorageSync(this.storageKey, JSON.stringify(this.storage));
	// }
	
	preloadData(type) {
		if (type == "next") {
			if (this.next) {
				let targetFile = this.next.file;
				let filePath = sdRoot + "/OOReader/" + this.bookName.replace(".txt", "") + "/" + targetFile;
				let txtFile = new File(filePath);
				try {
					let reader = new BufferedReader(new FileReader(txtFile));
					let txt = reader.readLine();
					
					let arr = null;
					try {
						arr = JSON.parse(txt);
						return { message: "获取成功", code: 200, data: { content: arr, page: 1 } }
					} catch (e) {
						return { message: "获取失败", code: 403 }
					}
				} catch (e) {
					return { message: "获取失败", code: 402 }
				}
			}
		}
	}
	
	initData() {
		let { session, page } = this.storage.current;
		let targetFile = null;
		let txtData = "";
		if (!session) {
			try {
				let current = this.storage.sessionList[1];
				targetFile = current.file;
				session = current.sessionName;
				
				this.next = this.storage.sessionList[2];
			} catch(e) {
				return { message: "无数据", code: 401 };
			}
		} else {
			targetFile = this.sessionMap[session].file;
			this.prev = this.sessionMap[session].prev;
			this.next = this.sessionMap[session].next;
			
			// console.log(this.prev)
			// console.log(targetFile)
			// console.log(this.next)
		}
		
		let filePath = sdRoot + "/OOReader/" + this.bookName.replace(".txt", "") + "/" + targetFile;
		let txtFile = new File(filePath);
		try {
			let reader = new BufferedReader(new FileReader(txtFile));
			let txt = reader.readLine();
			
			let arr = null;
			try {
				arr = JSON.parse(txt);
				// this.storage.current.session = 
				return { message: "获取成功", code: 200, data: { content: arr, page } }
			} catch (e) {
				return { message: "获取失败", code: 403 }
			}
		} catch (e) {
			return { message: "获取失败", code: 402 }
		}
	}
	
	nextPage() {
		this.storage.current.page++;
		uni.setStorageSync(this.storageKey, JSON.stringify(this.storage));
		console.log(this.storage.current);
	}
	
	prevPage() {
		this.storage.current.page--;
		uni.setStorageSync(this.storageKey, JSON.stringify(this.storage));
		console.log(this.storage.current);
	}
}

export { FileImporter, BookReader };