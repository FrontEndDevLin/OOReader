// #ifdef APP-PLUS

let environment = plus.android.importClass("android.os.Environment");
let sdRoot = environment.getExternalStorageDirectory();

let File = plus.android.importClass("java.io.File");
let FileReader = plus.android.importClass("java.io.FileReader");
let FileWriter = plus.android.importClass("java.io.FileWriter");
let BufferedReader = plus.android.importClass("java.io.BufferedReader");
// #endif

let titleReg = /(正文){0,1}(第)([零〇一二三四五六七八九十百千万a-zA-Z0-9]{1,7})[章节卷集部篇回]((?! {4}).)((?!\t{1,4}).){0,30}/g;

class FileImporter {
	constructor() {
		this.statusChange = null;
		
		this.importing = false;
		
	}
	
	importFile(file) {
		console.log("导入中");
		this.importing = true;
		
		let path = file.fullPath;
		let name = file.name;
		
		if (this.statusChange) {
			this.statusChange("importing");
		}
		
		let txtCachePath = sdRoot + "/OOReader/" + name.replace(".txt", "");
		let directory = new File(txtCachePath);
		if (!directory.exists()) {
			directory.mkdirs();
			let configFile = new File(txtCachePath + "/book.json");
			if (!configFile.exists()) {
				configFile.createNewFile(); //创建文件
				// let fos = new FileWriter(sdRoot + pathUrl, true);
			}
		}
		
		let txtFile = new File(path);
		try {
			let reader = new BufferedReader(new FileReader(txtFile));
			let arr = [];
			let txt;
			let cacheCnt = 0;
			while ((txt = reader.readLine()) != null) {
				if (titleReg.test(txt)) {
					let txt2 = reader.readLine();
					// 下一行是空的
					if (!txt2) {
						let data = JSON.stringify(arr);
						let fName = "session_" + cacheCnt;
						let f = new File(txtCachePath + "/" + fName);
						if (!f.exists()) {
							f.createNewFile(); //创建文件
							let fReader = new FileWriter(txtCachePath + "/" + fName, true);
							fReader.write(data);
							fReader.close();
						}
						cacheCnt++;
						console.log(`导入${cacheCnt}个文件`);
						arr = [txt, txt2];
					} else {
						arr.push(txt);
						arr.push(txt2);
					}
				} else {
					arr.push(txt)
				}
				// 校验该数据是否为标题，如果不是标题，放入数组；否则存入文件，再新建一个文件
			}
		} catch(e) {
			console.log(e)
		}
		
		console.log(`导入完成`);
	}
}

export default FileImporter;