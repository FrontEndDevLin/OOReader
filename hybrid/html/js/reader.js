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
		txtHtml += `<div style='font-size: ${layout.fontSize}; line-height: ${layout.lineHeight}'>
			${txt}
		</div>`
	}
	$("page").innerHTML = txtHtml;
	
	nextTick(() => {
		console.log($("page").scrollWidth)
	})
}