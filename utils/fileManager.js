// #ifdef APP-PLUS

let environment = plus.android.importClass("android.os.Environment");
let sdRoot = environment.getExternalStorageDirectory();

let File = plus.android.importClass("java.io.File");
let FileReader = plus.android.importClass("java.io.FileReader");
let FileWriter = plus.android.importClass("java.io.FileWriter");
let BufferedReader = plus.android.importClass("java.io.BufferedReader");

let InputStreamReader = plus.android.importClass("java.io.InputStreamReader");
let FileInputStream = plus.android.importClass("java.io.FileInputStream");

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

async function wait(sec = 1) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, sec)
	})
}

function getBookCharset(path) {
	let reader = new BufferedReader(new InputStreamReader(new FileInputStream(path)));
	let str = "";
	let badCode = 65533;
	let badCnt = 0;
	
	for (let i = 0; i < 8; i++) {
		str = reader.readLine();
		for (let s of str) {
			if (s.charCodeAt() == badCode) {
				badCnt++;
			}
		}
	}
	
	if (badCnt > 0) {
		return "GBK";
	} else {
		return "UTF-8";
	}
}

class FileImporter {
	constructor() {
		this.statusChange = null;
		
		this.importing = false;
		
		this.storageManager = new StorageManager();
		
		this.afterStop = null;
	}
	
	async importFile(file) {
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
			// let reader = new BufferedReader(new FileReader(txtFile));
			let charset = getBookCharset(path);
			let reader = new BufferedReader(new InputStreamReader(new FileInputStream(path), charset));
			let arr = [];
			let txt;
			let sessionName = "";
			let cacheCnt = 0;
			let sessionNameMap = {};
			
			while ((txt = reader.readLine()) != null) {
				if (!this.importing) {
					if (this.afterStop) {
						this.afterStop();
					}
					return console.log("停止导入");
				}
				
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
						await wait();
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
					// console.log(`导入${cacheCnt}个文件`);
					if (cacheCnt == 3) {
						if (this.statusChange) {
							this.statusChange("preloaded", { file });
							// break;
						}
					}
					
					// 每导入20个文件触发一次
					if (cacheCnt % 20 == 0) {
						if (this.statusChange) {
							this.statusChange("loadChunk");
						}
					}
					
					sessionName = txt;
					for (; sessionNameMap[sessionName]; sessionName += " ") { }
					
					arr = [sessionName];
					
					sessionNameMap[sessionName] = 1;
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
		
		if (this.statusChange) {
			this.statusChange("complete");
		}
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
		bookName = bookName.replace(".txt", "");
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
					file: "",
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
		// console.log(uni.getStorageSync(this.storageKey))
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
		
		this.onPageChange = null;
	}
	
	init(bookName) {
		bookName = bookName.replace(".txt", "");
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
					arr: null,
					next: i < sessionList.length ? sessionList[i + 1] : null
				};
			}
			
			if (!this.storage.current.session) {
				this.storage.current.session = sessionList[1].sessionName;
				this.storage.current.file = sessionList[1].file;
				// TODO: 写缓存
			}
			
			return { message: "初始化成功", code: 200 }
		} catch(e) {
			return { message: "数据错误，请重新导入", code: 402 }
		}
	}
	
	updateStorage() {
		let bookStorage = uni.getStorageSync(this.storageKey);
		this.storage = JSON.parse(bookStorage);
		let sessionList = this.storage.sessionList;
		for (let i = 0; i < sessionList.length; i++) {
			let item = sessionList[i];
			this.sessionMap[item.sessionName] = {
				prev: i > 0 ? sessionList[i - 1] : null,
				file: item.file,
				arr: null,
				next: i < sessionList.length ? sessionList[i + 1] : null
			};
		}
	}
	
	getSessionList() {
		return this.storage.sessionList;
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
		let targetFile,
			session,
			arr;
		if (type == "next") {
			if (this.next) {
				targetFile = this.next.file;
				session = this.next.sessionName;
			} else {
				return;
			}
		} else if (type == "prev") {
			if (this.prev) {
				targetFile = this.prev.file;
				session = this.prev.sessionName;
			} else {
				return;
			}
		}
		
		arr = this.sessionMap[session].arr;
		if (arr) {
			return { message: "获取成功", code: 304, data: { content: arr, page: 1 } };
		}
		
		let filePath = sdRoot + "/OOReader/" + this.bookName.replace(".txt", "") + "/" + targetFile;
		let txtFile = new File(filePath);
		try {
			let reader = new BufferedReader(new FileReader(txtFile));
			let txt = reader.readLine();
			
			try {
				arr = JSON.parse(txt);
				this.sessionMap[session].arr = arr;
				
				return { message: "获取成功", code: 200, data: { content: arr, page: 1 } }
			} catch (e) {
				return { message: "获取失败", code: 403 }
			}
		} catch (e) {
			return { message: "获取失败", code: 402 }
		}
	}
	
	initData() {
		let { session, page } = this.storage.current;
		// let file = this.sessionMap[session].file;
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
		
		if (this.onPageChange) {
			this.onPageChange(this.storage.current)
		}
	}
	
	prevPage() {
		this.storage.current.page--;
		uni.setStorageSync(this.storageKey, JSON.stringify(this.storage));
		
		if (this.onPageChange) {
			this.onPageChange(this.storage.current)
		}
	}
	
	skipSession(file) {
		let sessionName = "";
		for (let oSession of this.storage.sessionList) {
			if (oSession.file == file) {
				sessionName = oSession.sessionName;
				break;
			}
		}
		if (sessionName) {
			this.storage.current = {
				session: sessionName,
				file,
				page: 1
			};
			uni.setStorageSync(this.storageKey, JSON.stringify(this.storage));
		}
	}
	
	resetSession() {
		if (this.storage.current.page != 1) {
			this.storage.current.page = 1;
			uni.setStorageSync(this.storageKey, JSON.stringify(this.storage));
		}
		let session = this.storage.current.session;
		
		// 清除缓存
		let prevSession = this.sessionMap[session].prev;
		if (prevSession) {
			let oPrevSession = this.sessionMap[prevSession.sessionName];
			if (oPrevSession) {
				oPrevSession.arr = null;
			}
		}
		let nextSession = this.sessionMap[session].next;
		if (nextSession) {
			let oNextSession = this.sessionMap[nextSession.sessionName];
			if (oNextSession) {
				oNextSession.arr = null;
			}
		}
		
		return true;
	}
	
	nextSession() {
		(() => {
			let prevPrev = null;
			if (!this.prev) {
				return;
			}
			prevPrev = this.sessionMap[this.prev.sessionName];
			if (prevPrev) {
				prevPrev.arr = null;
			}
		})();
		
		let sessionName = this.next.sessionName;
		let file = this.next.file;
		this.storage.current.session = sessionName;
		this.storage.current.page = 1;
		this.storage.current.file = file;
		
		if (this.onPageChange) {
			this.onPageChange(this.storage.current)
		}
		
		this.next = this.sessionMap[sessionName].next;
		this.prev = this.sessionMap[sessionName].prev;
		
		uni.setStorageSync(this.storageKey, JSON.stringify(this.storage));
	}
	
	prevSession(page) {
		// 清除缓存
		(() => {
			let nextNext = null;
			if (!this.next) {
				return;
			}
			nextNext = this.sessionMap[this.next.sessionName];
			if (nextNext) {
				nextNext.arr = null;
			}
		})();
		
		let sessionName = this.prev.sessionName;
		let file = this.prev.file;
		this.storage.current.session = sessionName;
		this.storage.current.page = page;
		this.storage.current.file = file;
		
		if (this.onPageChange) {
			this.onPageChange(this.storage.current)
		}
		
		this.next = this.sessionMap[sessionName].next;
		this.prev = this.sessionMap[sessionName].prev;
		
		uni.setStorageSync(this.storageKey, JSON.stringify(this.storage));
	}
}

class FileManager {
	constructor() {
		this.storage = null;
	}
	
	init() {
		let jsonBookList = uni.getStorageSync("bookList");
		if (jsonBookList) {
			try {
				this.storage = JSON.parse(jsonBookList);
			} catch(e) {
				this.storage = [];
			}
		} else {
			this.storage = [];
		}
	}
	
	addBook(file) {
		let bookName = file.name;
		bookName = bookName.replace(".txt", "");
		this.storage.push({
			book: bookName,
			path: file.fullPath
		});
		this.write();
	}
	
	delBook(bookName) {
		bookName = bookName.replace(".txt", "");
		let txtCachePath = sdRoot + "/OOReader/" + bookName.replace(".txt", "");
		let directory = new File(txtCachePath);
		if (directory.exists()) {
			// 删除目录下所有子文件
			let fList = directory.listFiles();
			for (let file of fList) {
				file.delete();
			}
			directory.delete();
		} else {
			console.log("不存在")
		}
		
		let storageKey = "book_" + bookName;
		uni.removeStorageSync(storageKey);
		
		let i;
		for (i = 0; i < this.storage.length; i++) {
			if (this.storage[i].book == bookName) {
				break;
			}
		}
		this.storage.splice(i, 1);
		
		this.write();
		
		return true;
	}
	
	write() {
		uni.setStorageSync("bookList", JSON.stringify(this.storage));
		return true;
	}
	
	getBookList() {
		return this.storage;
	}
}

export { FileImporter, BookReader, FileManager };