var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var UserSchema =new mongoose.Schema({
	username:String,
	password:String,
	nickname:String,
	sex:String,
	age:Number,
	addr:String,
	tel:Number,
	photo:String,
	topics:[{type:Schema.Types.ObjectId,ref:'Topic'}],
	comments:[{type:Schema.Types.ObjectId,ref:'Comment'}],
	available:Boolean,
})

var User = mongoose.model('user',UserSchema);
module.exports = User;