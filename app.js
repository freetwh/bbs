var http = require('http')
var express = require('express')
var path = require('path')
var cheerio = require('cheerio')
var $ = cheerio.load('<html></html>')
var app = express()
var port = process.env.port || 1995
var formidable = require('formidable')
var secret = require('./modules/secret.js')
var mongoose = require('mongoose')
var Topic = require('./schemals/topic.js')
var Comment = require('./schemals/comment.js')
var User = require('./schemals/user.js')
var Admin = require('./schemals/admin.js')
var crypto = require('crypto')
var session = require('express-session')
var mongoStore = require('connect-mongo')(session)
app.use(require('cookie-parser')(secret.cookieSecret))
app.use(session({
	secret:secret.cookieSecret,
    store: new mongoStore({
      url:secret.mongo.development.connectionString,
      collection:'sessions',
    })
}));
app.use(require('body-parser')())
app.set('view engine','jade')
app.set('views','./views')
app.locals.pretty = true;
app.use(express.static(path.join(__dirname,'bower_components')))
// 环境选择及数据库连接
var opts = {
    server: {
       socketOptions: { keepAlive: 1 }
    }
};
switch(app.get('env')){
	case 'development':
		console.log(secret.mongo.development.connectionString)
		mongoose.connect(secret.mongo.development.connectionString,opts);
		break;
	case 'product':
		console.log(secret.mongo.development.connectionString)
		mongoose.connect(secret.mongo.development.connectionString,opts);
		break;
	default:
		throw new Error("未知运行环境" + app.get('nev'));
}
// 首页
app.get('/',function(req,res){
	if(req.session.user) {
		var status = true;
	}
	Topic.find({available:true})
	.populate('publisher')
	.exec(function(err, topics){
		var context = {
			title:"首页",
			isLogin:status,
			username:req.session.user,
			userId:req.session.userId,
			topics: topics.reverse(),
		}
		res.render('home',context);
	})
})
// 话题详情
app.get('/topics/:id',function(req,res){
	var _id = req.params.id;
	if(req.session.user) {
		var status = true;
	}
	Topic.findOne({available:true,_id:_id})
			.populate('publisher comment')
			.exec(function(err,topic){
				Comment.find({topic:topic._id},function(err,comments){
					if (err) {console.log(err)}
					if(comments.length === 0){
						new Comment({
							topic:topic._id,
							content:topic.content,
							publisher:topic.publisher._id,
							launchTime:topic.launchTime,
							available:true,
						}).save(function(err,cmt){
							if (err) console.log(err)
						})
					}
				})
		})
	Topic.findOne({available:true,_id:_id})
			.populate('publisher comment')
			.exec(function(err,topic){
				if (err) {console.log(err)}
				res.locals.topic = topic;
				// console.log(res.locals.topic)
	})
	Comment.find({available:true,topic:_id})
			.populate('publisher comment reply.from reply.to')
			.exec(function(err,comments){
				res.locals.comments=comments;
				// console.log(res.locals.comments)
				res.render('topic',{
						title:"话题详情",
						isLogin:status,
						userId:req.session.userId,
						username:req.session.user,
				})
			})
})
// 搜索
app.get('/search',function(req,res){
	res.render('search',{
		title:"搜索",})
})
app.post('/search',function(req,res){
	Topic.find({title:new RegExp(req.body.searchText)})
		.populate('publisher')
		.exec(function(err,topics){
			res.send(topics)
		})
})
// 发表话题
app.get('/publish',function(req,res){
	if (req.session.user) {
		var context = {
			title:"发表话题",
			}
		res.render('publish',context)
	}else {
		res.redirect(303,'/login')
	}
})
// 话题发表
app.post('/publish',function(req,res){
	if (req.session.user) {
		var _topic = req.body.topic;
			var newTopic = new Topic(_topic);
			newTopic.publisher = req.session.userId;
			newTopic.available = true;
			newTopic.launchTime = new Date();
			newTopic.save(function(err,topic){
				if (err){
					console.log(err)
				}
			});
			res.redirect(303,'/');
	}else {
		res.redirect(303,'/login')
	}
})
// 提交回复
app.get('/reply',function(req,res){
	if (req.session.user) {
		var context = {
				basic:{
					"title":"发表回复",
				},
				topic:req.query.topic,
				floor:req.query.floor,
			}
		// res.locals.topic = req.query.topic;
		// res.locals.floor = req.query.floor;
		res.render('comment',context)
	}else {
		res.redirect(303,'/login')
	}
})

// 回复提交处理
app.post('/reply',function(req,res){
	var content = req.body.content;
	var topicId = req.body.topic;
	// reply找到对应的comment就行，comment会绑定topic
	var fromId = req.session.userId;
	var toId = req.body.toId;
	var floorId = req.body.floor;
	Comment.findOne({_id:floorId})
		.populate('publisher')
		.exec(function(err,comment){
			if(err){
				console.log(err)
			}
			var reply = {
				content:content,
				from:fromId,
				to:toId||comment.publisher,
				rpTime:new Date,
			}
			comment.reply.push(reply);
			comment.save(function (err) {
				if (err) console.log(err)
			res.redirect(303,'/topics/'+topicId);
				// 重定向url多出#号
			});
	})
	//日志：push之后需要save()才可以保存数据
})
// 提交评论
app.get('/comment',function(req,res){
	if (req.session.user) {
		var context = {
				basic:{
					"title":"发表评论",
				},
				topic:req.query.topic,
			}
		// res.locals.topic = req.query.topic;
		res.render('comment',context)
	}else {
		res.redirect(303,'/login')
	}
})
// 评论提交处理
app.post('/comment',function(req,res){
	var content = req.body.content;
	var topicId = req.body.topic;
	new Comment({
		topic:topicId,
		publisher:req.session.userId,
		launchTime:new Date(),
		content:content,
		available:true,
	}).save(function(err,comment){
		if (err) console.log(err)
		res.redirect(303,'/topics/'+topicId);
	});
})
// 个人主页
app.get('/homepage/:userId',function(req,res){
	var homepageId = req.params.userId;
	// 如果登陆，则允许查看
	if (req.session.user) {
		Topic.find({available:true,publisher:homepageId}, function(err, topics){
			if(err) console.log(err)
			res.locals.topics = topics.reverse();
		})
		User.findOne({_id:homepageId}, function(err, user){
			if(err){
				console.log(err)
			}
			res.locals._user=user;

			// 如果登陆且查看的主页为自己的，则显示最近回复
			Comment.find({available:true})
				.populate('topic reply.to reply.from')
				.exec(
					function(err,comments){
						if(err) console.log(err)
						// 将复合条件的映射至新数组
						var rpArr = comments.map(function(cmt){
							for (var i = 0; i < cmt.reply.length; i++) {
								// console.log(cmt.reply[i].to._id)
								// console.log(homepageId)
								if(cmt.reply[i].to._id == homepageId){
									return {reply:cmt.reply[i],topic:cmt.topic}
								}
							};
						})
						// 过滤掉不符合条件的（undefined）
						rpArr = rpArr.filter(function(value,index){
								return value!=undefined;
							})
						res.locals.reply = rpArr.reverse();
						var title = res.locals._user.username+'的个人主页';
						res.render('homepage',{
							title:title,
							userId:req.session.userId,
						});
					})
		})
	}else{
		res.redirect(303,'/login')
	}
})
// 修改信息
app.get('/editinfo',function(req,res){
	var userId = req.query.user||req.session.userId;
	User.findOne({_id:userId},function(err,user){
		var context = {
			title:"修改资料",
			user:user,
		}
		res.render('editinfo',context);
	})
})
app.post('/editinfo',function(req,res){
	var _user = req.body.user;
	User.findOne({_id:req.session.userId},function(err,user){
		user.nickname = _user.nickname;
		user.sex = _user.sex;
		user.age = _user.age;
		user.addr = _user.addr;
		user.tel = _user.tel;
		user.save(function(err,user){
			if (err) {console.log(err)}
		})
		res.redirect('/homepage/'+req.session.userId)
	})
})
// 修改密码
app.get('/editpwd',function(req,res){
	var context = {
		title:"修改密码",
		info:{
		}
	}
	res.render('editpwd',context);
})
app.post('/editpwd',function(req,res){
	User.findOne({_id:req.session.userId},function(err,user){
		if(user.password == req.body.oldpwd){
			user.password = req.body.newpwd;
			user.save(function(err,user){
				if (err) {console.log(err)}
			})
			res.redirect('/homepage/'+req.session.user)
		}
	})
})
// 删除功能(话题及相关回复)
app.get('/delete',function(req,res){
	Topic.remove({_id:req.query.topic},function(err,topic){
			if (err) console.log(err)
		})
	Topic.remove({publisher:req.query.user},function(err,topic){
			if (err) console.log(err)
		})
	Comment.remove({topic:req.query.topic},function(err,comment){
			if (err) console.log(err)
		})
	Comment.remove({_id:req.query.comment},function(err,comment){
			if (err) console.log(err)
	})
	Comment.remove({publisher:req.query.user},function(err,comment){
			if (err) console.log(err)
	})
	// Comment.reply.remove({_id:req.query.reply},function(err,reply){
	// 		if (err) console.log(err)
	// })
	User.remove({_id:req.query.user},function(err,reply){
			if (err) console.log(err)
			res.send('success')
	})
})
// 注册
app.get('/register',function(req,res){
	var context = {
		title:"注册",
		basic:{
			"site":"太原科技大学 移动论坛",
			"title":"注册",
			"csrf":"隐身术，涨姿势",
		}
	}
	res.render('register',context)
})
// 登录
app.get('/login',function(req,res){
	var context = {
		title:"登录",
		basic:{
			"site":"太原科技大学 移动论坛",
			"csrf":"隐身术，涨姿势",
		}
	}
	res.render('login',context)
})
app.get('/logout',function(req,res){
	req.session.user = '';
	res.redirect(303,'/')
})
app.get('/thank-you',function(req,res){
	res.render('thank-you',{
		"title":"感谢注册"
	})
})
app.get('/about',function(req,res){
	res.render('about',{
		"title":"关于我们",
		"name":"唐文豪",
		"tel":"18335101878",
		"age":21
	})
})
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
// 注册表单处理
app.post('/register',function(req,res){
		var _user = req.body.user;
		User.findOne({username:_user.username},function(err,user){
			if(err) {
				console.log(err)
			}
			if(user) {
				if(!req.session.admin){
					res.redirect(303,'/register')
				}else {
					// res.locals.err = "用户已存在！";
					res.redirect(303,'/admin/');
				}
			}
			else {
				var photoArr = ["1.jpg","2.jpg","3.jpg","4.jpg"];
				var newUser = new User(_user);
				newUser.photo = Math.floor(Math.random()*photoArr.length);
				newUser.save(function(err,user){
					if (err){
						console.log(err)
					}
					if(!req.session.admin){
						req.session.user=newUser.username;
						res.redirect(303,'/thank-you');
					}else {
						res.redirect(303,'/admin/')
					}
					// console.log(req.session.user)
				});
			}
		})
})
// 登陆处理
app.post('/login',function(req,res){
	var _user = req.body.user;
	var username = _user.username;
	var password = _user.password;
	User.findOne({username:username},function(err,user){
		if (err) {
			console.log(err)
		}
		if(!user) {
			return res.redirect(303,'/login')
		}
		else if(password == user.password){
			req.session.user=username;
			req.session.userId = user._id;
			console.log('欢迎'+username)
			res.redirect(303,'/')
		}
		else {
			return res.redirect(303,'/login')
		}
	})
})


app.get('/contest/photo',function(req,res){
	var now = new Date();
	res.render('contest/photo',{
		year:now.getFullYear(),month:now.getMonth()
	})
})
// 通过formidable中间件来接受复合类型表单。
app.post('/contest/photo/:year/:month',function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		if(err) return res.redirect(303,'/error')
		console.log('received fields:')
		console.log(fields)
		console.log('received files')
		console.log(files)
		res.redirect(303,'/thank-you')
	})
})
// 管理员
app.get('/admin/',function(req,res){
	if (req.session.admin) {
		User.find(function(err,users){
			res.locals.users = users;
		})

		Topic.find({available:true})
			.populate('publisher')
			.exec(
				function(err,topics){
					res.locals.topics = topics;
				})

		Comment.find({available:true})
				.populate('publisher topic reply.to reply.from')
				.exec(
					function(err,comments){
						if(err) console.log(err)
						// 将回复映射至新数组
						var rpArr = comments.map(function(cmt){
							for (var i = 0; i < cmt.reply.length; i++) {
								return {reply:cmt.reply[i],topic:cmt.topic}
							};
						})
						// 过滤掉不符合条件的（undefined）
						rpArr = rpArr.filter(function(value,index){
								return value!=undefined;
							})
						res.locals.reply = rpArr.reverse();
						res.locals.comments = comments;
						res.render('admin/admin',{
							title:'太原科技大学移动论坛',
							admin:req.session.admin,
						})
						// render须在最后一次查寻中，且关联查询放最后一次，res.locals才能成功
					})
	}else{
		res.redirect(303,'/admin/login')
	}
})
app.get('/admin/login',function(req,res){
	res.render('admin/login',{
		title:'移动论坛——管理员登陆'
	})
})

app.post('/admin/login',function(req,res){
	var admin = req.body.admin;
	Admin.findOne({available:true,adminname:admin.adminname},function(err,am){
		if(err) console.log(err)
		if (admin.password == am.password) {
			req.session.adminId = am._id;
			req.session.admin = am.adminname;
			res.redirect(303,'/admin/')
		} else {
			res.redirect(303,'/admin/login')
		}
	})
})
// 定制404s
app.use(function(req,res,next){
	res.status(404)
	// .send('找不到此页面')
	.render(404)
})

// 定制500
app.use(function(err,req,res,next){
	console.error(err.stack)
	res.type('text/plain')
	res.status(500)
	// .send("服务器出错")
	render(505)
})

app.listen(port,
	function(){
		console.log("启动啦~~~~"+port)
	})
