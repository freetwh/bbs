var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var replySchema = mongoose.Schema({
	publisher:{type:String,ref:'User'},
	topic:{type:Schema.Types.ObjectId,ref:'Topic'},
	comment:{type:Schema.Types.ObjectId,ref:'Comment'},
	content:String,
	from:String,
	to:String,
	available:Boolean,
})

var Reply = mongoose.model('reply',replySchema);
module.exports = Reply;