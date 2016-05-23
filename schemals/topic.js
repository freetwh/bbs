var mongoose = require('mongoose'),
	ObjectId = mongoose.Schema.Types.ObjectId;
var topicSchema = mongoose.Schema({
	publisher:{type:ObjectId,ref:'user'},
	launchTime:Date,
	title:String,
	content:String,
	comment:[{type:ObjectId,ref:'comment'}],
	available:Boolean,
})
var Topic = mongoose.model('topic',topicSchema);
module.exports = Topic;