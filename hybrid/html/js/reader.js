function $(id) {
	return document.getElementById(id);
}
function nextTick(cb) {
	setTimeout(cb);
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


function getData(viewArr) {
	viewArr = JSON.parse(viewArr);
	
	let txtHtml = "";
	for (let txt of viewArr) {
		txtHtml += `<div style='font-size: ${layout.fontSize}; line-height: ${layout.lineHeight}; padding: 0 8px'>
			${txt}
		</div>`
	}
	$("page").innerHTML = txtHtml;
	
	nextTick(() => {
		let el = $("page");
		let totalW = el.scrollWidth;
		let pageW = Number(getComputedStyle(el).width.replace("px", ""));
		Object.assign(pageOptions, {
			current: 1,
			total: Math.round(totalW / pageW)
		});
	})
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
			el.style.transform = "translateX(-" + current * 100 + "vw)";
			pageOptions.current++;
		}
		// 右滑 上一页
		else if (startX < endX) {
			if (pageOptions.current <= 1) {
				return;
			}
			pageOptions.current--;
			el.style.transform = "translateX(-" + (pageOptions.current - 1) * 100 + "vw)";
		}
		else {
			console.log("不动");
		}
	})
})();