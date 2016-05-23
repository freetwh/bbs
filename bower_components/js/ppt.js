// 幻灯片
function addSlide(vars){
	var index = 0;
	if (vars.wrapper) {var wrapper = vars.wrapper;}
	if (vars.ppts) {var ppts = vars.ppts;}
	if (vars.pptW) {var singleW=vars.pptW;}
	if (vars.ctrls) {var ctrls = vars.ctrls;}
	if (vars.max) {var max = vars.max;}
	if (vars.switchtime) {var switchtime = vars.switchtime;}
	if (vars.autoSwitch) {var autoSwitch = vars.autoSwitch;}
	if (vars.control) {var isControl = vars.control;}
	if (vars.evt) {var evt = vars.evt;}
	var timer= autoSwitch&&setInterval(slide,switchtime|3000);
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

