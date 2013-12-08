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


exports.list = function(req,res){//to be deleted later
	riderClass.findAll(function(error, docs){
		res.render('driver_list.ejs', {locals:{
			title: 'rider',
			collection: docs,
			message: req.flash('info'),
			user:req.user
			}
		});
	})
};

exports.create = function(req,res){
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
		req.flash('info', 'Succesfully RSVPd to event');
		res.redirect('/event/'+req.params.id);
	});
};

exports.get = function(req, res) {

    riderClass.findById(req.params.id, function(error, rider) {
    	res.send(rider);
    });
};

exports.update = function(req, res) {
	riderClass.findById(req.params.id, function(err,rider){

		if(req.user._id.toString()==rider.user_id){

			riderClass.update(req.params.id, 
				{$set:{
			      location: req.param('location'),
			      time: req.param('time'),
			      notes: req.param('notes')
			    }},
				function(error, docs) {
					req.flash('info', 'Succesfully updated information');
					res.redirect('/event/'+rider.event_id);
			});
		}
		else
		{
			req.flash('info', 'You are not authorized to edit that');
			res.redirect('/event/'+rider.event_id);
		}
	});
};

exports.delete = function(req, res) {
	riderClass.findById(req.params.id, function(err, rider){
		if(req.user._id.toString()==rider.user_id){

			riderClass.delete(req.params.id, function(error, docs) {
				
			req.flash('info', 'Succesfully deleted RSVP');
				res.redirect('/event/'+rider.event_id);
			});
		}
		else
		{
			req.flash('info', 'You are not authorized to delete that RSVP');
			res.redirect('/event/'+rider.event_id);
		}
	});
};


exports.coords = function(req,res){
	riderClass.findById(req.params.id, function(err, rider){

		googlemaps.geocode(rider.location, function(err, rider_geo){
			if(rider_geo){
			var coords=rider_geo.results[0].geometry.location;
			res.send(coords);
			}else{
				riderClass.update(req.params.id,{$set:{
						location: 'Cannot recognize location: please re-enter'
				}}, function(error, docs) {});
			}
		});
	});
};

exports.has_ride = function(req, res) {
    carpoolClass.findRideForRider(req.params.id, function(error, carpools) {
        res.send(carpools);
    });
};