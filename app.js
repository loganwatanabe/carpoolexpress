
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
var forEach = require('async-foreach');
var googlemaps = require('googlemaps');
googlemaps.config('key', 'AIzaSyAnhJ9slS6FaJpwogrvb5SJtEGohVY7cns');
var util = require('util');

//routes
var routes = require('./routes');
var home = require("./routes/index")
var user = require('./routes/user');
var event = require('./routes/event');
var http = require('http');
var path = require('path');

//model stuff
var UserClass = require('./user_class').UserClass;
var EventClass = require('./event_class').EventClass;
var DriverClass = require('./driver_class').DriverClass;
var RiderClass = require('./rider_class').RiderClass;
var CarpoolClass = require('./carpool_class').CarpoolClass;
var ObjectID = require('mongodb').ObjectID;

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




var userClass = new UserClass('localhost', 27017);
var eventClass = new EventClass('localhost', 27017);
var driverClass = new DriverClass('localhost', 27017);
var riderClass = new RiderClass('localhost', 27017);
var carpoolClass = new CarpoolClass('localhost', 27017);


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


//NEED TO VALIDATE 1 EMAIL and USERNAME=1 USER
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
//googlemaps pass in or ajax request on that page


//for passport-local
app.get('/login', ensureNotAuthenticated, function(req, res){
  res.render('login.ejs', { user: req.user, message: req.flash('error') });
});

app.post('/login', ensureNotAuthenticated,
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
    //effed up
  });

//for passport-facebook
	// Redirect the user to Facebook for authentication.  When complete,
	// Facebook will redirect the user back to the application at
	//     /auth/facebook/callback
app.get('/auth/facebook', ensureNotAuthenticated, passport.authenticate('facebook', { scope: ['email'] }), function(req,res){});

// 	// Facebook will redirect the user to this URL after approval.  Finish the
// 	// authentication process by attempting to obtain an access token.  If
// 	// access was granted, the user will be logged in.  Otherwise,
// 	// authentication has failed.
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }), function(req,res){});

app.get('/logout', ensureAuthenticated, function(req, res){
  req.logout();
  res.redirect('/');
  //effed up
});


//routes for user CRUD

app.get('/users', ensureAuthenticated, user.list);
//create a user
app.get('/register', ensureNotAuthenticated, user.new);
app.post('/register', ensureNotAuthenticated, user.create);

app.get('/user/:id', user.get);//include variable to tell if user is the one logged in

//update a user
app.get('/user/:id/edit', ensureAuthenticated, user.edit);//further authorize in route


app.post('/user/:id/save', ensureAuthenticated, user.update);//further authorize in route

//delete a user
app.post('/user/:id/delete', ensureAuthenticated, user.delete);//further authorize in route

app.get('/user/:id/events', ensureAuthenticated, function(req,res){
	if(req.user._id == req.params.id){
	  	driverClass.findByUser(req.params.id, function(err, drivers){
	  		riderClass.findByUser(req.params.id, function(error, riders){
	  			res.render('user_events',
			        { locals: {
						drivers: drivers,
						riders: riders,
						user:req.user,
						title:"My Events"
			        	}
					});



	  		});
	    });
	}else{
		res.redirect('/');
	}

});



app.get('/user/:id/drivers', ensureAuthenticated, function(req,res){			//authorize?
  	driverClass.findByUser(req.params.id, function(err, drivers){
  		res.send(drivers);
    });
});


app.get('/user/:id/riders', ensureAuthenticated, function(req,res){
  	riderClass.findByUser(req.params.id, function(err, riders){
  		res.send(riders);
    });
});



//CRUD for events

app.get('/events', event.list);
//google maps request, pass in location  of all events

//new event
// app.get('/event/new', ensureAuthenticated, function(req,res){
app.get('/event/new', ensureAuthenticated, event.new);

// app.post('/event/new', ensureAuthenticated, function(req,res){
app.post('/event/new', ensureAuthenticated, event.create);


app.get('/event/:id', function(req,res){
	//pass in/ajax a google maps -- would need to get location of each rider and driver, then routes of those connected
	//weird how it doesn't always load on page
    eventClass.findById(req.params.id, function(error, event_obj) {


    	//console.log(event_obj.created_by_id.toString());

    	 userClass.findById(event_obj.created_by_id, function(error, creator) {
    	 	//console.log(creator);
    	 	var authorized = false;
    	 	if(req.user && req.user._id.toString()==event_obj.created_by_id){
    	 		authorized=true;
    	 	}

			res.render('event_show',
	        { locals: {
				name: event_obj.name,
				date: event_obj.date,
				location: event_obj.location,
				start_time: event_obj.start_time,
				end_time: event_obj.end_time,
				description: event_obj.description,
				id:event_obj._id,
				created_by: creator,
				user:req.user,
				authorized:authorized,
				title:event_obj.name
	        	}
			});
		 });

    });

});

app.get('/event/:id/info', function(req,res){
    eventClass.findById(req.params.id, function(error, event_obj) {
    	res.send(event_obj);

    });

});

//update a event
// app.get('/event/:id/edit', ensureAuthenticated, function(req, res) {
app.get('/event/:id/edit', ensureAuthenticated, event.edit);

// app.post('/event/:id/save', ensureAuthenticated, function(req, res) {
app.post('/event/:id/save', ensureAuthenticated, event.update);

//delete an event
// app.post('/event/:id/delete', ensureAuthenticated, function(req, res) {
app.post('/event/:id/delete', ensureAuthenticated, event.delete);




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


app.get('/event/:id/user', function(req,res){
	var user=req.user;
	if(user){//user object is there

		driverClass.findByEventAndUser(req.params.id, user._id.toString(), function(err, driver){
			if(err){res.send(err);}
			if(driver){//the user is a driver
				res.send(driver);
			}else{//the user is not a driver
				riderClass.findByEventAndUser(req.params.id, user._id.toString(), function(err, rider){
					if(err){res.send(err);}
					if(rider){
						res.send(rider);//user is a rider
					}else{
						//user is neither a rider or a driver
						res.send(null);
					}
				});
			}
		});
	}else{
		res.send(null);
	}

});



app.post('/event/:id/driver/new', ensureAuthenticated, function(req,res){
		driverClass.save({
			user_id: req.user._id.toString(),
			first_name: req.user.first_name,
			last_name: req.user.last_name,
			event_id: req.params.id,
			location: req.param('location'),
			time: req.param('time'),
			cap: req.param('ride_cap'),
			role: "driver",
			notes: req.param('notes')
		}, function(err, docs){
			res.redirect('/event/'+req.params.id);
			//effed up
		});
		//});
	});

// app.post('/event/:id/rider/new', ensureAuthenticated, function(req,res){
app.post('/event/:id/rider/new', ensureAuthenticated, function(req,res){
			//var ev;
			//eventClass.findById(req.params.id, function(err,result){ev=result;});
		riderClass.save({
			user_id: req.user._id.toString(),
			first_name: req.user.first_name,
			last_name: req.user.last_name,
			event_id: req.params.id,
			location: req.param('location'),
			time: req.param('time'),
			notes: req.param('notes'),
			role: "rider",
			ride: false
		}, function(err, docs){
			res.redirect('/event/'+req.params.id);
			//effed up
		});
});


app.get('/event/:id/drivers', function(req, res) {

    driverClass.findByEvent(req.params.id, function(error, drivers) {
        res.send(drivers);//JSON array
    });
});

app.get('/event/:id/riders', function(req, res) {

    riderClass.findByEvent(req.params.id, function(error, riders) {
        res.send(riders);//JSON array
    });
});

app.get('/driver/:driver_id/car', function(req, res) {

    driverClass.findById(req.params.driver_id, function(error, driver) {
    	eventClass.findById(driver.event_id, function(error, event_obj) {
	        riderClass.findByCarpoolDriver(req.params.driver_id, function(error, riders) {
	        	res.render('event_ride.ejs', {locals:{
					title: 'Ride for '+event_obj.name,
					event: event_obj,
					driver: driver,
					riders: riders,
					user:req.user
					}
	   			});
	   		});
	    });
	});
});



app.get('/event/:id/coords', function(req,res){
	eventClass.findById(req.params.id, function(err, event){

		googlemaps.geocode(event.location, function(err, event_geo){
			if(event_geo){
			var coords=event_geo.results[0].geometry.location;
			res.send(coords);
			}else{
				eventClass.update(req.params.id,{$set:{
						location: 'Cannot recognize location: please re-enter'
						// created_by_id:req.user._id.toString()
				}}, function(error, docs) {});
			}
		});

	});
});

app.get('/rider/:id/coords', function(req,res){
	riderClass.findById(req.params.id, function(err, rider){

		googlemaps.geocode(rider.location, function(err, rider_geo){
			if(rider_geo){
			var coords=rider_geo.results[0].geometry.location;
			res.send(coords);
			}else{
				riderClass.update(req.params.id,{$set:{
						location: 'Cannot recognize location: please re-enter'
						// created_by_id:req.user._id.toString()
				}}, function(error, docs) {});
			}
		});
	});
});

app.get('/driver/:id/coords', function(req,res){
	driverClass.findById(req.params.id, function(err, driver){

		googlemaps.geocode(driver.location, function(err, driver_geo){
			if(driver_geo){
			var coords=driver_geo.results[0].geometry.location;
			res.send(coords);
			}else{
				driverClass.update(req.params.id,{$set:{
						location: 'Cannot recognize location: please re-enter'
						// created_by_id:req.user._id.toString()
				}}, function(error, docs) {
					res.send(null);
				});
			}
		});
	});
});


//returns google maps route for a driver
app.get('/driver/:id/route_req', function(req,res){
	driverClass.findById(req.params.id, function(err, driver){
		eventClass.findById(driver.event_id, function(error, event_obj){
		    riderClass.findByCarpoolDriver(req.params.id, function(error, riders){

		    	var wayp=[];
		    	for(var ii=0; ii<riders.length;ii++){
		    		var rider=riders[ii];
		    		wayp.push({
		    			location: rider.location,
		    			stopover: true
		    		});
		    	}

		    	var goog_req={
		    	  origin:driver.location,
			      destination:event_obj.location,
			      waypoints: wayp
			      // travelMode: googlemaps.TravelMode.DRIVING
		    	}
		    	//needs valid addresses

		    	res.send(goog_req);

		    });
		});
	});
});






app.get('/rider/:id/has_ride', function(req, res) {
    carpoolClass.findRideForRider(req.params.id, function(error, carpools) {
        res.send(carpools);
    });
});



app.get('/driver/:id/rides', function(req, res) {
    riderClass.findByCarpoolDriver(req.params.id, function(error, riders) {
        res.send(riders);
    });
});


app.get('/rider/:id', function(req, res) {

    riderClass.findById(req.params.id, function(error, rider) {
    	res.send(rider);
    });
});

app.get('/driver/:id', function(req, res) {

    driverClass.findById(req.params.id, function(error, driver) {
    	res.send(driver);
    });
});




//update a driver
app.post('/driver/:id/edit', function(req, res) {
	driverClass.findById(req.params.id, function(err,driver){

		if(req.user._id.toString()==driver.user_id){

			driverClass.update(req.params.id, 
				{$set:{
			      location: req.param('location'),
			      time: req.param('time'),
			      cap: req.param('ride_cap'),
			      notes: req.param('notes')
			    }},
				function(error, docs) {
					res.redirect('/drivers');
				//effed up
			});
		}
		else
		{
			console.log("Not Authorized to edit");
			res.redirect('/');
		}
	});
});

app.post('/rider/:id/edit', function(req, res) {
	riderClass.findById(req.params.id, function(err,rider){

		if(req.user._id.toString()==rider.user_id){

			riderClass.update(req.params.id, 
				{$set:{
			      location: req.param('location'),
			      time: req.param('time'),
			      notes: req.param('notes')
			    }},
				function(error, docs) {
					res.redirect('/riders');
				//effed up
			});
		}
		else
		{
			console.log("Not Authorized to edit");
			res.redirect('/');
		}
	});
});



app.post('/driver/:id/delete', ensureAuthenticated, function(req, res) {
	driverClass.findById(req.params.id, function(err, driver){
		if(req.user._id.toString()==driver.user_id){

			driverClass.delete(req.params.id, function(error, docs) {
				res.redirect('/drivers');
				//effed up
			});
		}
		else
		{
			console.log("Not Authorized to delete");
			res.redirect('/');
		}
	});
});

app.post('/rider/:id/delete', ensureAuthenticated, function(req, res) {
	riderClass.findById(req.params.id, function(err, rider){
		if(req.user._id.toString()==rider.user_id){

			riderClass.delete(req.params.id, function(error, docs) {
				res.redirect('/riders');
				//effed up
			});
		}
		else
		{
			console.log("Not Authorized to delete");
			res.redirect('/');
		}
	});
});


//CRUD for CARPOOLS
app.post('/driver/:driver_id/rider/:rider_id/new', ensureAuthenticated, function(req,res){
		carpoolClass.save({
			driver_id: req.params.driver_id,
			rider_id: req.params.rider_id,
			driver_accept: true,//req.param('driver_accept'),
			rider_accept: true,//req.param('rider_accept'),
			status: "accepted"
		}, function(err, docs){
			res.redirect('back');
			//effed up
		});
		//});
	});

// app.post('/carpool/:id/delete', ensureAuthenticated, function(req, res) {

// 	//authorization?
// 		carpoolClass.delete(req.params.id, function(error, docs) {
// 			res.redirect('/events');
// 			//effed up
// 		});

// });


app.post('/carpool/rider/:rider_id/delete', ensureAuthenticated, function(req, res) {

	//authorization?
	carpoolClass.findRideForRider(req.params.rider_id, function(err, carpool){

		carpoolClass.delete(carpool._id.toString(), function(error, docs) {
			res.redirect('/');
			//effed up
		});

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

function ensureNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

function format_date(date){

}

function format_time(time){
	
}