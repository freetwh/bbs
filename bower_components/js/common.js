if (self==top) {
	document.documentElement.style.fontSize=Math.round(document.documentElement.clientWidth/37.5,5)+'px';
};
function is_weixin(){
		var ua = navigator.userAgent.toLowerCase();
		if(ua.match(/MicroMessenger/i)=="micromessenger") {
			return true;
	 	} else {
			return false;
		}
	}

function getSex(){
	var sex = $('#sex-key').val()
	switch(sex){
		case 'male':
			sex = '男'
			break;
		case 'female':
			sex = '女'
			break;
		default:
			sex = '保密'
			break;
	}
	return sex
}

Date.prototype.output = function(){
	var now = new Date();
	var out = this;
	var outString = '';
	if (out.getFullYear()!=now.getFullYear()) {
		outString+=out.getFullYear()+" ";
	}
	var outMonth = checkIt(out.getMonth()+1),
		outDay = checkIt(out.getDate()),
		outHour = checkIt(out.getHours()),
		outMin = out.getMinutes();
	outString += outMonth+" "+outDay+" "+outHour+":"+outMin;
	return outString;
	function checkIt(t){
		if(t<10){
			t="0"+t;
		}
		return t;
	}
}
function checkText(){
	$('.form').submit(function(){
			if(!check()){
				return false;
			}
		})
		function check(){
			var feedback = document.getElementById('content');
			fb = feedback.value;
			var sum = 0;
			for (var i = 0; i < fb.length; i++) {
				var c = fb[i];
				if (isChineseChar(c)) {
					sum++;
				};
			};
			if (sum<2) {
				alert("至少输入2个汉字");
				return false;

			};
			if(sum>120){
				alert('最多输入120个汉字');
				return false;
			}
			if(sum>2&&sum<120){
				return true;
			}
			function isChineseChar(c){
				var reg = /[\u4E00-\u9FA5]/;
				return reg.test(c);
			}
		}
}
