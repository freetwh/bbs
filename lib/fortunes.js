var fortunes = [
			'云儿',
			'如花',
			'如花',
			'本兮',
			'如花',
			'如花'
]
exports.getFortune = function(){
	var idx = Math.floor(Math.random()*fortunes.length);
	return fortunes[idx];
};