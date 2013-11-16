
/**
 * Module dependencies.
 */

var express = require('express');
var flash = require('connect-flash');
var routes = require('./routes');
var home = require("./routes/index")
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var UserClass = require('./user_class').UserClass;//assignment12
var EventClass = require('./event_class').EventClass;//assignment12

var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var app = express();

// all environments
app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(flash());
	//app.use(express.json());
	//app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());

	//from passport
	app.use(express.session({ secret: 'secret' }));
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


//session management
passport.serializeUser(function(user, done) {
		done(null, user._id);
});

passport.deserializeUser(function(id, done) {
		userClass.findById(id, function (err, user) {
	done(err, user);
		});
});



passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      userClass.findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));






//ROUTES
app.get('/', home.index);
app.get('/users', function(req,res){
	userClass.findAll(function(error, docs){
			res.render('user_list.ejs', {locals:{
				title: 'Users',
				collection: docs,
				user:req.user
				}
			});
		})
	});


//for passport-local
app.get('/login', function(req, res){
  res.render('login.ejs', { user: req.user, message: req.flash('error') });
});

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });
  
// POST /login
//   This is an alternative implementation that uses a custom callback to
//   acheive the same functionality.
/*
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/users/' + user.username);
    });
  })(req, res, next);
});
*/

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
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
// app.get('/user/:id/edit', ensureAuthenticated, function(req, res) {
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

//app.post('/user/:id/save', ensureAuthenticated,  function(req, res) {
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
// app.post('/user/:id/delete', ensureAuthenticated,  function(req, res) {
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
// app.get('/event/new', ensureAuthenticated, function(req,res){
app.get('/event/new', function(req,res){
		res.render('event_new.ejs', {locals: {title:'Create Event'}});
	});

// app.post('/event/new', ensureAuthenticated, function(req,res){
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
// app.get('/event/:id/edit', ensureAuthenticated, function(req, res) {
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

// app.post('/event/:id/save', ensureAuthenticated, function(req, res) {
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
// app.post('/event/:id/delete', ensureAuthenticated, function(req, res) {
app.post('/event/:id/delete', function(req, res) {
		eventClass.delete(req.param('_id'), function(error, docs) {
			res.redirect('/events')
		});
});








app.listen(44444);
console.log("Express server listening on port 44444");


// Simple route middleware to ensure user is authenticated.
//   If the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}