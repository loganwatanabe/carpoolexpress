var EventClass = require('../event_class').EventClass;
var eventClass = new EventClass('localhost', 27017);
var UserClass = require('../user_class').UserClass;
var userClass = new UserClass('localhost', 27017);

var DriverClass = require('../driver_class').DriverClass;
var RiderClass = require('../rider_class').RiderClass;
var driverClass = new DriverClass('localhost', 27017);
var riderClass = new RiderClass('localhost', 27017);

var CarpoolClass = require('../carpool_class').CarpoolClass;
var carpoolClass = new CarpoolClass('localhost', 27017);

var googlemaps = require('googlemaps');
googlemaps.config('key', 'AIzaSyAnhJ9slS6FaJpwogrvb5SJtEGohVY7cns');
var util = require('util');
var moment = require('moment');


exports.list = function(req,res){
	driverClass.findAll(function(error, docs){
		res.render('driver_list.ejs', {locals:{
			title: 'driver',
			collection: docs,
			message: req.flash('info'),
			user:req.user
			}
		});
	});
};

exports.create = function(req,res){
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
		req.flash('info', 'Succesfully RSVPd to event');
		res.redirect('/event/'+req.params.id);
		
	});

};

exports.car = function(req, res) {
	driverClass.findById(req.params.driver_id, function(error, driver) {
		eventClass.findById(driver.event_id, function(error, event_obj) {
	        riderClass.findByCarpoolDriver(req.params.driver_id, function(error, riders) {

	    	 	var date=moment(event_obj.date).format("MMMM Do, YYYY");
	    	 	var start=moment(event_obj.start_time, "HH:mm").format("h:mm A");
	    	 	var end=moment(event_obj.end_time, "HH:mm").format("h:mm A");

	        	res.render('event_ride.ejs', {locals:{
					title: driver.first_name+"'s car for "+event_obj.name,
					event: event_obj,
					date: date,
					start: start,
					end: end,
					driver: driver,
					riders: riders,
					message: req.flash('info'),
					user:req.user
					}
	   			});
	   		});
	    });
	});
};

exports.coords = function(req,res){
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
};

exports.route = function(req,res){
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
		    	}
		    	//needs valid addresses
		    	res.send(goog_req);

		    });
		});
	});
};


exports.rides = function(req, res) {
    riderClass.findByCarpoolDriver(req.params.id, function(error, riders) {
        res.send(riders);
    });
};

exports.get = function(req, res) {

    driverClass.findById(req.params.id, function(error, driver) {
    	res.send(driver);
    });
}

exports.update = function(req, res) {
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
					req.flash('info', 'Succesfully updated information');
					res.redirect('/event/'+driver.event_id);
			});
		}
		else
		{
			req.flash('info', 'You are not authorized to edit that');
			res.redirect('/event/'+driver.event_id);
		}
	});
};

exports.delete = function(req, res) {
	driverClass.findById(req.params.id, function(err, driver){
		if(req.user._id.toString()==driver.user_id){

			driverClass.delete(req.params.id, function(error, docs) {
				req.flash('info', 'Succesfully deleted RSVP');
				res.redirect('/event/'+driver.event_id);
			});
		}
		else
		{
			req.flash('info', 'You are not authorized to delete RSVP');
			res.redirect('/event/'+driver.event_id);
		}
	});
};