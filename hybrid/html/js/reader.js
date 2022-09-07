function $(id) {
	return document.getElementById(id);
}
function nextTick(cb) {
	setTimeout(cb, 50);
}

let el = {
	prevContentEl: null,
	prevPageEl: null,
	contentEl: null,
	pageEl: null,
	nextContentEl: null,
	nextPageEl: null
};

let fontList = [14, 16, 18, 20, 22, 24, 26, 28, 30];

let layout = {
	font: 0,
	fontSize: "18px",
	lineHeight: "36px",
	paddingTop: "",
	paddingBottom: ""
};

let pageOptions = {
	current: 0,
	total: 0,
	file: ""
};

(function (){
	let queryStr = location.search.replace("?", "");
	let queryStrAry = queryStr.split("&");
	let query = {};
	for (let str of queryStrAry) {
		let strAry = str.split("=");
		query[strAry[0]] = strAry[1];
	}
	let theme = query.theme;
	if (theme == "dark") {
		$("container").className = "container dark";
		$("moonBtn").style.display = "none";
		$("sunBtn").style.display = "block";
	}
	
	let fontSize = parseInt(query.font) || 18;
	initFont(fontSize);
})();

(function () {
	let contentEl = $("content");
	let styleSheet = getComputedStyle(contentEl);
	let height = Number(styleSheet.height.replace("px", ""));
	let intHeight = parseInt(height);
	let dblHeight = height - intHeight;
	
	let paddingTop = dblHeight;
	let paddingBottom = 10;
	
	let contentHeight = height - paddingTop - paddingBottom;
	let lineCnt = contentHeight / parseInt(layout.lineHeight);
	lineCnt = parseInt(lineCnt) - 1;
	let newContentHeight = lineCnt * parseInt(layout.lineHeight);
	let offset = contentHeight - newContentHeight;
	paddingTop += offset / 2;
	paddingBottom += offset / 2;
	layout.paddingTop = paddingTop + "px";
	layout.paddingBottom = paddingBottom + "px";
	
	let pageEl = $("page");
	Object.assign(pageEl.style, {
		paddingTop: layout.paddingTop,
		paddingBottom: layout.paddingBottom
	});
})();

function initFont(fontSize) {
	layout.font = fontSize;
	layout.fontSize = fontSize + "px";
	layout.lineHeight = fontSize * 2 + "px";
	
	loadFontSelectList();
}

function initView(viewArr, page) {
	viewArr = JSON.parse(viewArr);
	
	let txtHtml = "";
	for (let txt of viewArr) {
		txtHtml += `<div class='item' style='font-size: ${layout.fontSize}; line-height: ${layout.lineHeight};'>
			${txt.trim()}
		</div>`
	}
	
	el.contentEl = $("content");
	el.pageEl = $("page");
	
	el.pageEl.innerHTML = txtHtml;
	
	nextTick(() => {
		let totalW = el.pageEl.scrollWidth;
		let pageW = Number(getComputedStyle(el.pageEl).width.replace("px", ""));
		Object.assign(pageOptions, {
			current: page,
			total: Math.round(totalW / pageW)
		});
		// console.log(JSON.stringify(pageOptions))
		move({ animation: false });
		loadSessionPager();
		
		if (pageOptions.total < 3) {
			// 预加载
			uni.postMessage({
				data: {
					action: "E_PRELOAD",
					type: "next"
				}
			});
		} else {
			if (pageOptions.total - page <= 1) {
				// 预加载下一章
				uni.postMessage({
					data: {
						action: "E_PRELOAD",
						type: "next"
					}
				});
			}
		}
		
		// 预加载上一章
		uni.postMessage({
			data: {
				action: "E_PRELOAD",
				type: "prev"
			}
		});
	})
}

function preloadNext(viewArr) {
	let contentEl = document.createElement("div");
	contentEl.className = "content next";
	let pageEl = document.createElement("div");
	pageEl.className = "page";
	Object.assign(pageEl.style, {
		paddingTop: layout.paddingTop,
		paddingBottom: layout.paddingBottom
	});
	contentEl.appendChild(pageEl);
	pageEl.style.transition = "transform .2s";
	
	viewArr = JSON.parse(viewArr);
	
	let txtHtml = "";
	for (let txt of viewArr) {
		txtHtml += `<div class='item' style='font-size: ${layout.fontSize}; line-height: ${layout.lineHeight};'>
			${txt.trim()}
		</div>`
	}
	pageEl.innerHTML = txtHtml;
	
	$("reader").appendChild(contentEl);
	
	el.nextContentEl = contentEl;
	el.nextPageEl = pageEl;
}

function preloadPrev(viewArr) {
	let contentEl = document.createElement("div");
	contentEl.className = "content prev";
	let pageEl = document.createElement("div");
	pageEl.className = "page";
	Object.assign(pageEl.style, {
		paddingTop: layout.paddingTop,
		paddingBottom: layout.paddingBottom
	});
	contentEl.appendChild(pageEl);
	
	viewArr = JSON.parse(viewArr);
	
	let txtHtml = "";
	for (let txt of viewArr) {
		txtHtml += `<div class='item' style='font-size: ${layout.fontSize}; line-height: ${layout.lineHeight};'>
			${txt}
		</div>`
	}
	pageEl.innerHTML = txtHtml;
	
	$("reader").insertBefore(contentEl, el.contentEl);
	
	// 计算页数，翻到最后一页
	nextTick(() => {
		let totalW = pageEl.scrollWidth;
		let pageW = Number(getComputedStyle(pageEl).width.replace("px", ""));
		let total = Math.round(totalW / pageW);
		pageEl.style.transition = "none";
		pageEl.style.transform = "translateX(-" + (total - 1) * 100 + "vw)";
		nextTick(() => {
			pageEl.style.transition = "transform .2s";
		})
	})
	
	el.prevContentEl = contentEl;
	el.prevPageEl = pageEl;
}

function move({ animation = true } = {}) {
	let pageEl = el.pageEl;
	let current = pageOptions.current;
	if (animation) {
		pageEl.style.transform = "translateX(-" + (current - 1) * 100 + "vw)";
	} else {
		pageEl.style.transition = "none";
		pageEl.style.transform = "translateX(-" + (current - 1) * 100 + "vw)";
		nextTick(() => {
			pageEl.style.transition = "transform .2s";
		})
	}
}

function loadNextSession() {
	if (!el.nextContentEl) {
		return;
	}
	el.nextContentEl.className = "content next move";
	el.contentEl.id = "";
	el.contentEl.className = "content prev";
	el.pageEl.id = "";
	
	uni.postMessage({
		data: {
			action: "E_NEXT_SESSION"
		}
	});
	
	setTimeout(() => {
		// 移除上上个
		if (el.prevContentEl) {
			$("reader").removeChild(el.prevContentEl);
		}
		el.prevContentEl = el.contentEl;
		el.prevPageEl = el.pageEl;
		el.prevContentEl.className = "content prev";
		el.prevContentEl.id = "";
		el.prevPageEl.id = "";
		
		el.contentEl = el.nextContentEl;
		el.pageEl = el.nextPageEl;
		el.contentEl.id = "content";
		el.pageEl.id = "page";
		el.nextContentEl = null;
		el.nextPageEl = null;
		
		nextTick(() => {
			let totalW = el.pageEl.scrollWidth;
			let pageW = Number(getComputedStyle(el.pageEl).width.replace("px", ""));
			let page = 1;
			Object.assign(pageOptions, {
				current: page,
				total: Math.round(totalW / pageW)
			});
			loadSessionPager();
			
			if (pageOptions.total < 3) {
				// 预加载
				uni.postMessage({
					data: {
						action: "E_PRELOAD",
						type: "next"
					}
				});
			} else {
				if (pageOptions.total - page <= 1) {
					// 预加载下一章
					uni.postMessage({
						data: {
							action: "E_PRELOAD",
							type: "next"
						}
					});
				}
			}
		})
	}, 200)
}

function loadPrevSession() {
	if (!el.prevContentEl) {
		return;
	}
	el.contentEl.className = "content next";
	el.contentEl.id = "";
	if (el.nextContentEl) {
		// 通知移除缓存
		// 移除下一个
		$("reader").removeChild(el.nextContentEl);
	} else {
		// console.log("没有下一个");
	}
	el.nextContentEl = el.contentEl;
	el.nextPageEl = el.pageEl;
	
	setTimeout(() => {
		el.contentEl = el.prevContentEl;
		el.pageEl = el.prevPageEl;
		el.contentEl.className = "content";
		el.contentEl.id = "content";
		el.pageEl.id = "page";
		
		el.prevContentEl = null;
		el.prevPageEl = null;
		
		nextTick(() => {
			let totalW = el.pageEl.scrollWidth;
			let pageW = Number(getComputedStyle(el.pageEl).width.replace("px", ""));
			let total = Math.round(totalW / pageW);
			Object.assign(pageOptions, {
				current: total,
				total: total
			});
			loadSessionPager();
			
			uni.postMessage({
				data: {
					action: "E_PREV_SESSION",
					page: total
				}
			});
			
			// 预加载上一章
			uni.postMessage({
				data: {
					action: "E_PRELOAD",
					type: "prev"
				}
			});
		})
	}, 200)
}

function loadSessionInfo(oSession) {
	try {
		oSession = JSON.parse(oSession);
		$("sessionName").innerHTML = oSession.session;
		
		pageOptions.file = oSession.file;
		setActiveSession();
	} catch(e) {
		//TODO handle the exception
	}
}

function loadSessionPager() {
	$("pager").innerHTML = pageOptions.current + "/" + pageOptions.total;
}

let sessionMap = {};
function loadSessionList(oAySessionList) {
	try {
		oAySessionList = JSON.parse(oAySessionList);
		let html = "";
		for (let oSession of oAySessionList) {
			if (sessionMap[oSession.file]) {
				continue;
			}
			sessionMap[oSession.file] = oSession.sessionName;
			html += "<div class='session-item " + oSession.file + "' data-file='" + oSession.file + "'>" + oSession.sessionName + "</div>";
		}
		// console.log(JSON.stringify(sessionMap))
		$("sessionList").innerHTML = $("sessionList").innerHTML + html;
	} catch(e) {
		//TODO handle the exception
	}
}

function setActiveSession() {
	let oldEl = $("sessionList").getElementsByClassName("active")[0];
	if (oldEl) {
		oldEl.className = oldEl.className.replace(" active", "");
	}
	
	let activeFile = pageOptions.file;
	let target = $("sessionList").getElementsByClassName(activeFile)[0];
	if (target) {
		target.className = target.className + " active";
	}
}

function loadFontSelectList() {
	let html = "";
	for (let font of fontList) {
		let className = "select-item";
		if (font == layout.font) {
			className = "select-item selected";
		}
		html += `<div class="${className}" data-font="${font}">
			${font}
			<span class="iconfont icon-check"></span>
		</div>`;
	}
	
	$("fontOptions").innerHTML = html;
}

function updateFontSelectList() {
	let selectElList = $("fontOptions").getElementsByClassName("select-item");
	for (let el of selectElList) {
		if (el.className.indexOf("selected") != -1) {
			el.className = "select-item";
		}
		if (parseInt(el.getAttribute("data-font")) == layout.font) {
			el.className = "select-item selected";
		}
	}
}

(() => {
	// document.addEventListener("click", (e) => {
	// 	console.log(e.target.className)
	// 	console.log(e.target.id)
	// })
	
	let startX = null;
	let endX = null;
	
	let readerEl = $("reader");
	readerEl.addEventListener("touchstart", event => {
		startX = event.touches[0].clientX;
	});
	
	readerEl.addEventListener("touchend", event => {
		endX = event.changedTouches[0].clientX;
		
		// 左滑, 下一页
		if (startX > endX) {
			let current = pageOptions.current;
			if (current >= pageOptions.total) {
				loadNextSession();
				return;
			}
			pageOptions.current++;
			loadSessionPager();
			move();
			uni.postMessage({
				data: {
					action: "E_NEXT_PAGE"
				}
			});
			
			if (pageOptions.total - pageOptions.current <= 1) {
				// 预加载下一章
				uni.postMessage({
					data: {
						action: "E_PRELOAD",
						type: "next"
					}
				});
			}
		}
		// 右滑 上一页
		else if (startX < endX) {
			if (pageOptions.current <= 1) {
				loadPrevSession();
				return;
			}
			pageOptions.current--;
			loadSessionPager();
			move();
			uni.postMessage({
				data: {
					action: "E_PREV_PAGE"
				}
			});
		}
		else {
			console.log("不动");
		}
	})
})();



(() => {
	$("centerBtn").onclick = function () {
		$("menuContent").className = "menu-content show";
		setTimeout(() => {
			$("menuWarpper").className = "menu-warpper show";
		}, 10);
	}
	
	$("menuMask").onclick = function () {
		$("menuWarpper").className = "menu-warpper";
		setTimeout(() => {
			$("menuContent").className = "menu-content";
		}, 200);
	}
	
	$("moonBtn").onclick = function () {
		$("container").className = "container dark";
		$("moonBtn").style.display = "none";
		$("sunBtn").style.display = "block";
		
		uni.postMessage({
			data: {
				action: "E_SET_THEME",
				type: "dark"
			}
		});
	}
	
	$("sunBtn").onclick = function () {
		$("container").className = "container";
		$("sunBtn").style.display = "none";
		$("moonBtn").style.display = "block";
		
		uni.postMessage({
			data: {
				action: "E_SET_THEME",
				type: "sun"
			}
		});
	}
	
	$("menuBtn").onclick = function () {
		$("menuWarpper").className = "menu-warpper";
		setTimeout(() => {
			$("menuContent").className = "menu-content";
		}, 200);
		
		$("sessionContent").className = "session-list-content show";
		setTimeout(() => {
			$("sessionWarpper").className = "session-warpper show";
		}, 10);
	}
	
	$("contentMask").onclick = function () {
		$("sessionWarpper").className = "session-warpper";
		setTimeout(() => {
			$("sessionContent").className = "session-list-content";
		}, 200);
	}
	
	$("sessionList").onclick = function (e) {
		let target = e.target;
		if (target.className.indexOf("session-item") != -1 && target.className.indexOf("active") == -1) {
			let targetFile = target.getAttribute("data-file");
			if (targetFile) {
				uni.postMessage({
					data: {
						action: "E_READ_SESSION",
						file: targetFile
					}
				});
			}
		}
	}
	
	$("setFont").onclick = function () {
		$("menuMask").onclick();
		setTimeout(() => {
			$("fontSelector").className = "font-selector-popup show";
		}, 200)
	}
	
	$("fontOptions").onclick = function (e) {
		let target = e.target;
		if (target.className.indexOf("select-item") != -1 && target.className.indexOf("selected") == -1) {
			let fontSize = parseInt(target.getAttribute("data-font"));
			if (!fontSize) return;
			
			uni.postMessage({
				data: {
					action: "E_SET_FONT",
					fontSize: fontSize
				}
			});
			layout.font = fontSize;
			layout.fontSize = fontSize + "px";
			layout.lineHeight = fontSize * 2 + "px";
			updateFontSelectList();
		}
	}
	
	$("popupMask").onclick = function () {
		$("fontSelector").className = "font-selector-popup";
	}
	
	
})();