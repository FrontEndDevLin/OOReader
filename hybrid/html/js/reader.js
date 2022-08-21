function $(id) {
	return document.getElementById(id);
}
function nextTick(cb) {
	setTimeout(cb, 50);
}

let layout = {
	fontSize: "18px",
	lineHeight: "36px"
};

let pageOptions = {
	current: 0,
	total: 0
};

(function () {
	let styleSheet = getComputedStyle($("content"));
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
	
	let pageEl = $("page");
	Object.assign(pageEl.style, {
		paddingTop: paddingTop + "px",
		paddingBottom: paddingBottom + "px"
	});
})();


function getData(viewArr, page) {
	viewArr = JSON.parse(viewArr);
	let el = $("page");
	
	let txtHtml = "";
	for (let txt of viewArr) {
		txtHtml += `<div style='font-size: ${layout.fontSize}; line-height: ${layout.lineHeight}; padding: 0 8px'>
			${txt}
		</div>`
	}
	el.innerHTML = txtHtml;
	
	nextTick(() => {
		let totalW = el.scrollWidth;
		let pageW = Number(getComputedStyle(el).width.replace("px", ""));
		Object.assign(pageOptions, {
			current: page,
			total: Math.round(totalW / pageW)
		});
		move({ animation: false });
	})
}

function move({ animation = true } = {}) {
	let el = $("page");
	let current = pageOptions.current;
	if (animation) {
		el.style.transform = "translateX(-" + (current - 1) * 100 + "vw)";
	} else {
		el.style.transition = "none";
		el.style.transform = "translateX(-" + (current - 1) * 100 + "vw)";
		nextTick(() => {
			el.style.transition = "transform .2s";
		})
	}
}

(() => {
	let startX = null;
	let endX = null;
	
	let readerEl = $("reader");
	let el = $("page");
	readerEl.addEventListener("touchstart", event => {
		startX = event.touches[0].clientX;
	});
	
	readerEl.addEventListener("touchend", event => {
		endX = event.changedTouches[0].clientX;
		
		// 左滑, 下一页
		if (startX > endX) {
			let current = pageOptions.current;
			if (current >= pageOptions.total) {
				return;
			}
			pageOptions.current++;
			move();
			uni.postMessage({
				data: {
					action: "E_NEXT_PAGE"
				}
			});
		}
		// 右滑 上一页
		else if (startX < endX) {
			if (pageOptions.current <= 1) {
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