
/**
 * Module dependencies.
 */

var express = require('express');
var flash = require('connect-flash');
var ejs_locals = require('ejs-locals')
var RedisStore = require ( 'connect-redis' ) ( express );
var sessionStore = new RedisStore ();

var routes = require('./routes');
var home = require("./routes/index")
var user = require('./routes/user');
var event = require('./routes/event');
var http = require('http');
var path = require('path');
var UserClass = require('./user_class').UserClass;
var EventClass = require('./event_class').EventClass;
var DriverClass = require('./driver_class').DriverClass;
var RiderClass = require('./rider_class').RiderClass;

var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var app = express();

// all environments
app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views'));
	app.engine('ejs',ejs_locals);
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	//app.use(express.bodyParser());
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));

	//from passport
	// app.use(express.session({ secret: 'secret', store: sessionStore}));
	app.use(express.session({ secret: 'secret'}));
	app.use(passport.initialize());
	app.use(passport.session());


	app.use(flash());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}




var userClass = new UserClass('localhost', 27017);//assignment12
var eventClass = new EventClass('localhost', 27017);//assignment12
var driverClass = new DriverClass('localhost', 27017);//assignment12
var riderClass = new RiderClass('localhost', 27017);//assignment12


//session management
passport.serializeUser(function(user, done) {
		done(null, user._id);
		//done(null, user);
});

//does this work?
passport.deserializeUser(function(id, done) {
		userClass.findById(id, function (err, user) {
	done(err, user);
		});
});


//NEED TO VALIDATE 1 EMAIL or USERNAME=1 USER
// Need to implement a FBuser collection, or alter USERS to search fpr facebook user ids
// passport.deserializeUser(function(id, done) {
//     FbUsers.findById(id, function (err,user){
//         if(err) done(err);
//         if(user){
//             done(null,user);
//         }else{
//             userClass.findById(id, function(err,user){
//                 if(err) done(err);
//                 done(null,user);
//             });
//         }
//     });
// });



passport.use(new LocalStrategy(
  function(usernameORemail, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      userClass.findByUsernameOrEmail(usernameORemail, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown username or email: ' + usernameORemail }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: "417957444996823",
    clientSecret: "5b5e5ee11224c085c512b6d581a64d0f",
    callbackURL: "http://lwatanab.jit.su/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
  	//make this a function in userClass, and call it here
    process.nextTick(function () {
	    userClass.findByUsernameOrEmail(profile.emails[0].value, function(err, oldUser){
	        if(oldUser){
	            done(null,oldUser);
	        }else{
	            userClass.save({
	                username: profile.displayName,
	                email : profile.emails[0].value,
	                first_name : profile["name"].givenName,
	                last_name : profile["name"].familyName,
	                access : accessToken,
	                fb_id : profile.id
	            }, function(err,newUser){
	                if(err) throw err;
	                done(null, newUser);
	            });
	        }
	    })
	});
  }
));





//ROUTES
app.get('/', home.index);


//for passport-local
app.get('/login', function(req, res){
  res.render('login.ejs', { user: req.user, message: req.flash('error') });
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
    //effed up
  });

//for passport-facebook
	// Redirect the user to Facebook for authentication.  When complete,
	// Facebook will redirect the user back to the application at
	//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }), function(req,res){});

// 	// Facebook will redirect the user to this URL after approval.  Finish the
// 	// authentication process by attempting to obtain an access token.  If
// 	// access was granted, the user will be logged in.  Otherwise,
// 	// authentication has failed.
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }), function(req,res){});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
  //effed up
});


//routes for user CRUD

app.get('/users', user.list);//should be deleted in final
//create a user
app.get('/register', user.new);
app.post('/register', user.create);

app.get('/user/:id', user.get);

//update a user
// app.get('/user/:id/edit', ensureAuthenticated, function(req, res) {
app.get('/user/:id/edit', user.edit);

//app.post('/user/:id/save', ensureAuthenticated,  function(req, res) {
app.post('/user/:id/save', user.update);

//delete a user
// app.post('/user/:id/delete', ensureAuthenticated,  function(req, res) {
app.post('/user/:id/delete', user.delete);






//CRUD for events

app.get('/events', event.list);

//new event
// app.get('/event/new', ensureAuthenticated, function(req,res){
app.get('/event/new', event.new);

// app.post('/event/new', ensureAuthenticated, function(req,res){
app.post('/event/new', event.create);


app.get('/event/:id', function(req,res){
    eventClass.findById(req.params.id, function(error, event_obj) {
    	var creator;
    	console.log(event_obj.created_by_id);

    	// userClass.findById(event_obj.created_by_id, function(error, user) {
     //    creator=user;
    	// });


    	//console.log(creator);

		driverClass.findByEvent(req.params.id, function(error,driver_arr){
			riderClass.findByEvent(req.params.id, function(error,rider_arr){
				//one more for carpools
				res.render('event_show',
		        { locals: {
					name: event_obj.name,
					date: event_obj.date,
					location: event_obj.location,
					start_time: event_obj.start_time,
					end_time: event_obj.end_time,
					description: event_obj.description,
					id:event_obj._id,
					created_by: null,
					drivers: driver_arr,
					riders:rider_arr,
					user:req.user,
					title:event_obj.name
		        	}
		        });
		      });

		});

    });
});

//update a event
// app.get('/event/:id/edit', ensureAuthenticated, function(req, res) {
app.get('/event/:id/edit', event.edit);

// app.post('/event/:id/save', ensureAuthenticated, function(req, res) {
app.post('/event/:id/save', event.update);

//delete an event
// app.post('/event/:id/delete', ensureAuthenticated, function(req, res) {
app.post('/event/:id/delete', event.delete);




//CRUD for Driver/Rider

app.get('/drivers', function(req,res){//to be deleted later
	driverClass.findAll(function(error, docs){
			res.render('driver_list.ejs', {locals:{
				title: 'driver',
				collection: docs,
				user:req.user
				}
			});
		})
	});

app.get('/riders', function(req,res){//to be deleted later
	riderClass.findAll(function(error, docs){
			res.render('driver_list.ejs', {locals:{
				title: 'rider',
				collection: docs,
				user:req.user
				}
			});
		})
	});





// app.post('/event/:id/driver/new', ensureAuthenticated, function(req,res){
app.post('/event/:id/driver/new', function(req,res){
		driverClass.save({
			user_id: req.user.id,
			event_id: req.params.id,
			location: req.param('location'),
			time: req.param('time'),
			cap: req.param('ride_cap'),
			notes: req.param('notes')
		}, function(err, docs){
			res.redirect('/event/'+req.params.id);
			//effed up
		});
		//});
	});

// app.post('/event/:id/rider/new', ensureAuthenticated, function(req,res){
app.post('/event/:id/rider/new', function(req,res){
			//var ev;
			//eventClass.findById(req.params.id, function(err,result){ev=result;});
		riderClass.save({
			user_id: req.user._id,
			event_id: req.params.id,
			location: req.param('location'),
			time: req.param('time'),
			notes: req.param('notes'),
			ride: false
		}, function(err, docs){
			res.redirect('/event/'+req.params.id);
			//effed up
		});
});


// app.get('/event/:event_id/carpool/:driver_id', function(req, res) {

//     driverClass.findById(req.params.driver_id, function(error, driver) {
//         res.render('event_show',
//         { locals: {
// 			user: driver.user,
// 			event: driver.event,
// 			location: driver.location,
// 			time: driver.time,
// 			cap: driver.cap,
// 			notes: driver.notes,
// 			user:req.user,
// 			title: 
//         }
//         });
//     });
// });




// //update a driver
// app.get('/event/:ev_id/driver/:dr_id/edit', function(req, res) {
// 	//load in all carpools, riders, and driver (and event?) related with this 
// 	driverClass.findById(req.params.dr_id, function(err,driver){
// 		res.render('event_edit',
// 		{ locals: {
// 			user: driver.user,
// 			event: driver.event,
// 			location: event.location,
// 			start_time: event.start_time,
// 			end_time: event.end_time,
// 			description: event.description,
// 			id:event._id,
// 			user:req.user,
// 			title:event.name
//         }
// 		});
// 	});
// });

// app.post('/event/:id/save', function(req, res) {
// 	eventClass.update(req.param('_id'),{
// 			name: req.param('name'),
// 			date: req.param('date'),
// 			location: req.param('location'),
// 			start_time: req.param('start_time'),
// 			end_time: req.param('end_time'),
// 			description: req.param('description'),
// 			id:req.param('_id'),
// 			created_by:req.user
// 	}, function(error, docs) {
// 		res.redirect('/event/'+req.param('_id'));
// 		//effed up
// 	});
// });


app.post('/driver/:id/delete', function(req, res) {
		driverClass.delete(req.param('_id'), function(error, docs) {
			res.redirect('/drivers');
			//effed up
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