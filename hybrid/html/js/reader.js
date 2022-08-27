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

let layout = {
	fontSize: "18px",
	lineHeight: "36px",
	paddingTop: "",
	paddingBottom: ""
};

let pageOptions = {
	current: 0,
	total: 0
};

let preloadOptions = {
	next: false,
	prev: false
};

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


function initView(viewArr, page) {
	viewArr = JSON.parse(viewArr);
	
	let txtHtml = "";
	for (let txt of viewArr) {
		txtHtml += `<div style='font-size: ${layout.fontSize}; line-height: ${layout.lineHeight}; padding: 0 8px'>
			${txt}
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
		txtHtml += `<div style='font-size: ${layout.fontSize}; line-height: ${layout.lineHeight}; padding: 0 8px'>
			${txt}
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
		txtHtml += `<div style='font-size: ${layout.fontSize}; line-height: ${layout.lineHeight}; padding: 0 8px'>
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
	} catch(e) {
		//TODO handle the exception
	}
}

function loadSessionPager() {
	$("pager").innerHTML = pageOptions.current + "/" + pageOptions.total;
}

(() => {
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