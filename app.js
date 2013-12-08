
/**
 * Module dependencies.
 */

var express = require('express');
var flash = require('connect-flash');
var ejs_locals = require('ejs-locals')
var RedisStore = require ( 'connect-redis' ) ( express );
var sessionStore = new RedisStore ();
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var googlemaps = require('googlemaps');
googlemaps.config('key', 'AIzaSyAnhJ9slS6FaJpwogrvb5SJtEGohVY7cns');
var util = require('util');
var moment = require('moment');

//routes
var routes = require('./routes');
var home = require("./routes/index")
var user = require('./routes/user');
var event = require('./routes/event');
var driver = require('./routes/driver');
var rider = require('./routes/rider');
var carpool = require('./routes/carpool');
var http = require('http');
var path = require('path');

//model stuff
var UserClass = require('./user_class').UserClass;
var EventClass = require('./event_class').EventClass;
var DriverClass = require('./driver_class').DriverClass;
var RiderClass = require('./rider_class').RiderClass;
var CarpoolClass = require('./carpool_class').CarpoolClass;

var app = express();
var helpers = require('express-helpers');
helpers(app);

// all environments
app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views'));
	app.engine('ejs',ejs_locals);
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	//app.use(express.bodyParser());//obsolete
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));


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


//used to access db
var userClass = new UserClass('localhost', 27017);
var eventClass = new EventClass('localhost', 27017);
var driverClass = new DriverClass('localhost', 27017);
var riderClass = new RiderClass('localhost', 27017);
var carpoolClass = new CarpoolClass('localhost', 27017);


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
  function(email, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      userClass.findByEmail(email, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown email: ' + email }); }
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
    process.nextTick(function () {
	    userClass.findByUsernameOrEmail(profile.emails[0].value, function(err, oldUser){
	        if(oldUser){
	            done(null,oldUser);
	        }else{
	            userClass.save({
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





//********ROUTES************
app.get('/', home.index);


//for passport-local
app.get('/login', ensureNotAuthenticated, function(req, res){
  res.render('login.ejs', { user: req.user, message: req.flash('error') });
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
  	req.flash('info', 'Successfully logged in');
    res.redirect('back');
  });

//for passport-facebook
app.get('/auth/facebook', ensureNotAuthenticated, passport.authenticate('facebook', { scope: ['email'] }), function(req,res){});
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }), function(req,res){});

app.get('/logout', ensureAuthenticated, function(req, res){
  req.logout();
  req.flash('info', 'Successfully logged out');
  res.redirect('/');
});



//********** CRUD for USERS **************

//app.get('/users', ensureAuthenticated, user.list);

//create a user
app.get('/register', ensureNotAuthenticated, user.new);
app.post('/register', ensureNotAuthenticated, user.create);

app.get('/user/:id', user.get);

app.get('/user/:id/info', user.info);

//update a user
app.get('/user/:id/edit', ensureAuthenticated, user.edit);


app.post('/user/:id/save', ensureAuthenticated, user.update);

//delete a user
app.post('/user/:id/delete', ensureAuthenticated, user.delete);

//access user stuff
app.get('/user/:id/events', ensureAuthenticated, user.events);



app.get('/user/:id/drivers', ensureAuthenticated, user.drivers);


app.get('/user/:id/riders', ensureAuthenticated, user.riders);



//******* CRUD for events ***********

app.get('/events', event.list);
app.get('/events/all', event.all);

//new event
app.get('/event/new', ensureAuthenticated, event.new);
app.post('/event/new', ensureAuthenticated, event.create);


app.get('/event/:id', event.get);
app.get('/event/:id/info', event.info);

//update a event
app.get('/event/:id/edit', ensureAuthenticated, event.edit);
app.post('/event/:id/save', ensureAuthenticated, event.update);

//delete an event
app.post('/event/:id/delete', ensureAuthenticated, event.delete);

//access event info
app.get('/event/:id/user', event.user);
app.get('/event/:id/drivers', event.drivers);
app.get('/event/:id/riders', event.riders);
app.get('/event/:id/coords', event.coords);


//******* CRUD for DRIVERS ********
//app.get('/drivers', driver.list);
app.get('/driver/:id', driver.get);
app.post('/event/:id/driver/new', ensureAuthenticated, driver.create);
app.post('/driver/:id/edit', driver.update);
app.post('/driver/:id/delete', ensureAuthenticated, driver.delete);

//info
app.get('/driver/:driver_id/car', driver.car);
app.get('/driver/:id/coords', driver.coords);
app.get('/driver/:id/route_req', driver.route);
app.get('/driver/:id/rides', driver.rides);

//******* CRUD for RIDERS ********
//app.get('/riders', rider.list);
app.get('/rider/:id', rider.get);
app.post('/event/:id/rider/new', ensureAuthenticated, rider.create);
app.post('/rider/:id/edit', rider.update);
app.post('/rider/:id/delete', ensureAuthenticated, rider.delete);

//info
app.get('/rider/:id/coords', rider.coords);
app.get('/rider/:id/has_ride', rider.has_ride);




//*********** CRUD for CARPOOLS ************
app.post('/driver/:driver_id/rider/:rider_id/new', ensureAuthenticated, carpool.create);
app.post('/carpool/rider/:rider_id/delete', ensureAuthenticated, carpool.delete_rider);



app.listen(44444);
console.log("Express server listening on port 44444");



// route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.flash('error', 'Please log in to access that page');
  res.redirect('/login');
}

function ensureNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) { return next(); }
  req.flash('info', 'You are already logged in');
  res.redirect('/');
}
