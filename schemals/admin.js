var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var adminSchema =new mongoose.Schema({
	adminname:String,
	password:String,
	sex:String,
	addr:String,
	tel:Number,
	photo:String,
	available:Boolean,
})

var Admin = mongoose.model('Admin',adminSchema);
module.exports = Admin;