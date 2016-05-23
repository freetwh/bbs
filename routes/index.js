// 首页
app.get('/',function(req,res){

	topic.find({available:true}, function(err, topics){
		var context = {
			basic:{
				"title":"首页",
			},
			topics: topics.map(function(topic){
				return {
					publisher: topic.publisher,
					launchTime: topic.launchTime,
					content: topic.content,
					say:"hah"
				}
			})
		}
		res.render('home',context);
	})
})
// 发表话题
app.get('/publish',function(req,res){
	var context = {
			basic:{
				"title":"发表话题",
			},
		}
	res.render('publish',context)
})
// 提交评论
app.get('/comment',function(req,res){
	var context = {
			basic:{
				"title":"发表评论",
			}
		}
	res.render('comment',context)
})
// 个人主页
app.get('/homepage',function(req,res){

	topic.find({available:true}, function(err, topics){
		var context = {
			basic:{
				"title":"个人主页",
				"username":"kisscloud",
				"nickname":"唐文豪",
				"addr":"上海",
				"sex":"male",
				"age":"20",
				"tel":"18335101878",
				"sign":"天上白云一朵朵，都住着angel",
				"photo":"photo.jpg",
			},
			topics: topics.map(function(topic){
				return {
					publisher: topic.publisher,
					launchTime: topic.launchTime,
					content: topic.content,
					say:"hah"
				}
			})
		}
		res.render('homepage',context);
	})
})
// 修改信息
app.get('/editinfo',function(req,res){
	var context = {
		basic:{
			"title":"修改资料",
		},
		info:{
			username:"kisscloud",
			nickname:"唐文豪",
			sex:"male",
			age:"20",
			tel:"18335101878",
			addr:"上海",
		}
	}
	res.render('editinfo',context);
})
// 修改密码
app.get('/editpwd',function(req,res){
	var context = {
		basic:{
			"title":"修改密码",
		},
		info:{
		}
	}
	res.render('editpwd',context);
})
// 注册
app.get('/register',function(req,res){
	var context = {
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
		basic:{
			"site":"太原科技大学 移动论坛",
			"title":"登录",
			"csrf":"隐身术，涨姿势",
		}
	}
	res.render('login',context)
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



topic.find(function(err, topics){
    if(topics.length) return;
    new topic({
    	publisher:'唐文豪',
    	launchTime:getDate(),
    	content:'mongodb好奇怪的东西啊，原谅小白不会用',
    	available:true,
    }).save();
});
function getDate(){
	var date = new Date();
	return date;
}
app.get('/topic',function(req,res){
	 topic.find({available:true}, function(err, topics){
        var context = {
            topics: topics.map(function(topic){
                 return {
                     publisher: topic.publisher,
                     launchTime: topic.launchTime,
                     content: topic.content,
                     say:"hah"
                 }
            })
        }
        res.render('topic',context);
    })
})

// ajax请求处理
app.post('/process',function(req,res){
	if(req.xhr || req.accepts('json,html')==='json'){
			        	new user({
			        		username:req.body.username,
			        		password:req.body.password,
			        		available:true,
			        	}).save();
			        	res.send({success:true})
			        }else{
					        // req.session.error = "User Exist"
					        res.redirect("/register");
						}
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
// 页面表单提交重定向
// app.post('/process',function(req,res){
// 	console.log("表单："+req.query.form);
// 	console.log("CSRF:"+req.body._csrf);
// 	console.log("姓名："+req.body.name);
// 	console.log("邮箱："+req.body.email);
// 	res.redirect(303,'/thank-you');
// })
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
