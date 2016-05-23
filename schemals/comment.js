var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var commentSchema = mongoose.Schema({
	topic:{type:Schema.Types.ObjectId,ref:'topic'},
	publisher:{type:Schema.Types.ObjectId,ref:'user'},
	launchTime:Date,
	content:String,
	reply:[{
		content:String,
		from:{type:Schema.Types.ObjectId,ref:'user'},
		to:{type:Schema.Types.ObjectId,ref:'user'},
		rpTime:Date,
	}],
	available:Boolean,
})

var Comment = mongoose.model('comment',commentSchema);
module.exports = Comment;