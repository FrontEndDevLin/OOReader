function $(id) {
	return document.getElementById(id);
}
function nextTick(cb) {
	setTimeout(cb, 50);
}

let el = {
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
}

function preload(viewArr) {
	let contentEl = document.createElement("div");
	contentEl.className = "content next";
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
	
	$("reader").appendChild(contentEl);
	
	el.nextContentEl = contentEl;
	el.nextPageEl = pageEl;
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
			move({ animation: false });
			
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