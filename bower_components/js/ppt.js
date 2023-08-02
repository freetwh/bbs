// 幻灯片
function addSlide(vars){
	var index = 0;
	if (vars.wrapper) {var wrapper = vars.wrapper;}
	if (vars.ppts) {var ppts = vars.ppts;}
	if (vars.pptW) {var singleW=vars.pptW;}
	if (vars.ctrls) {var ctrls = vars.ctrls;}
	var max = ctrls.length;
	var switchtime = vars.switchtime||3000;
	var pptW = ppts[0].offsetWidth;
	var autoSwitch = vars.autoSwitch;
	var isControl = vars.control||true;
	var evt = vars.evt||'click';
	var timer= autoSwitch&&setInterval(slide,switchtime|3000);
	// 初始化默认样式
	ctrls[0].className = 'on';
	ppts[0].className = 'ppt cur';
	// 如果接受控制，则添加事件监听
	if(isControl){
		for (var i = 0; i < ctrls.length; i++) {
			ctrls[i].index = i;
			ctrls[i].addEventListener(evt,function(){
				clearInterval(timer);
				for (var j = 0; j < ctrls.length; j++) {
					ctrls[j].className = '';
					ppts[j].className = 'ppt';
				};
				this.className="on";
				ppts[this.index].className="ppt cur";
			},false)
			ctrls[i].onmouseout = function(){
				timer = autoSwitch&&setInterval(slide,switchtime|3000);
			}
		}
	}
	// 自动切换（需定时器）
	function slide(){
		for (var i = 0; i < ctrls.length; i++) {
			ctrls[i].className="";
			ppts[i].className="ppt";
		};
		ctrls[index].className="on";
		ppts[index].className="ppt cur"
		index++;
		if(index>max-1){index=0;}
	}
}

