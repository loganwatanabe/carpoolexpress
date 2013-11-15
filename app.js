
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var home = require("./routes/index")
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var UserClass = require('./user_class').UserClass;//assignment12
var EventClass = require('./event_class').EventClass;//assignment12
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

// all environments
app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	//app.use(express.json());
	//app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());

	//from passport-local
	app.use(express.session({ secret: 'keyboard cat' }));
	app.use(passport.initialize());
	app.use(passport.session());

	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}




var userClass = new UserClass('localhost', 27017);//assignment12
var eventClass = new EventClass('localhost', 27017);//assignment12


//ROUTES
app.get('/', home.index);
app.get('/users', function(req,res){
	userClass.findAll(function(error, docs){
			res.render('user_list.ejs', {locals:{
				title: 'Users',
				collection: docs
				}
			});
		})
	});


//for passport-local

//only here for assignment 12 functionality
app.get('/login', function(req,res){
	res.render('login.ejs', {locals:{}});
});

// app.get('/login', home.login);
// app.post('/login',
//   passport.authenticate('local', { successRedirect: '/',
//                                    failureRedirect: '/login',
//                                    failureFlash: true })
// );

// //for passport-facebook
// 	// Redirect the user to Facebook for authentication.  When complete,
// 	// Facebook will redirect the user back to the application at
// 	//     /auth/facebook/callback
// app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// 	// Facebook will redirect the user to this URL after approval.  Finish the
// 	// authentication process by attempting to obtain an access token.  If
// 	// access was granted, the user will be logged in.  Otherwise,
// 	// authentication has failed.
// app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));




//routes for user CRUD

//create a user
app.get('/register', function(req,res){
		res.render('register.ejs', {locals: {title:'register'}});
	});
app.post('/register', function(req,res){
		userClass.save({
			username: req.param('username'),
			password: req.param('password'),
			first_name: req.param('first_name'),
			last_name: req.param('last_name'),
			email: req.param('email'),
			contact: req.param('contact')
		}, function(err, docs){
			res.redirect('/users')
		});
	});

app.get('/user/:id', function(req, res) {
    userClass.findById(req.params.id, function(error, user) {
        res.render('user_show',
        { locals: {
			username: user.username,
			password: user.password,
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			contact: user.contact,
			id:user._id
        }
        });
    });
});

//update a user
app.get('/user/:id/edit', function(req, res) {
	userClass.findById(req.params.id, function(error, user) {
		res.render('user_edit',
		{ locals: {
			id: user._id,
			username: user.username,
			password: user.password,
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			contact: user.contact
		}
		});
	});
});

app.post('/user/:id/save', function(req, res) {
	userClass.update(req.param('_id'),{
		username: req.param('username'),
		password: req.param('password'),
		first_name: req.param('first_name'),
		last_name: req.param('last_name'),
		email: req.param('email'),
		contact: req.param('contact')
	}, function(error, docs) {
		res.redirect('/user/'+req.param('_id'))
	});
});

//delete a user
app.post('/user/:id/delete', function(req, res) {
		userClass.delete(req.param('_id'), function(error, docs) {
			res.redirect('/users')
		});
});






//CRUD for events

app.get('/events', function(req,res){
	eventClass.findAll(function(error, docs){
			res.render('event_list.ejs', {locals:{
				title: 'Events',
				collection: docs
				}
			});
		})
	});

//new event
app.get('/event/new', function(req,res){
		res.render('event_new.ejs', {locals: {title:'Create Event'}});
	});

app.post('/event/new', function(req,res){
		eventClass.save({
			name: req.param('name'),
			location: req.param('location'),
			date: req.param('date'),
			start_time: req.param('start_time'),
			end_time: req.param('end_time'),
			description: req.param('description')
		}, function(err, docs){
			res.redirect('/events')
		});
	});

app.get('/event/:id', function(req, res) {
    eventClass.findById(req.params.id, function(error, event) {
        res.render('event_show',
        { locals: {
			name: event.name,
			date: event.date,
			location: event.location,
			start_time: event.start_time,
			end_time: event.end_time,
			description: event.description,
			id:event._id
        }
        });
    });
});

//update a event
app.get('/event/:id/edit', function(req, res) {
	eventClass.findById(req.params.id, function(error, event) {
		res.render('event_edit',
		{ locals: {
			name: event.name,
			date: event.date,
			location: event.location,
			start_time: event.start_time,
			end_time: event.end_time,
			description: event.description,
			id:event._id
        }
		});
	});
});

app.post('/event/:id/save', function(req, res) {
	eventClass.update(req.param('_id'),{
			name: req.param('name'),
			date: req.param('date'),
			location: req.param('location'),
			start_time: req.param('start_time'),
			end_time: req.param('end_time'),
			description: req.param('description'),
			id:req.param('_id')
	}, function(error, docs) {
		res.redirect('/event/'+req.param('_id'))
	});
});

//delete an event
app.post('/event/:id/delete', function(req, res) {
		eventClass.delete(req.param('_id'), function(error, docs) {
			res.redirect('/events')
		});
});








app.listen(44444);
console.log("Express server listening on port 44444");