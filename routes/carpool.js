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
	carpoolClass.save({
		driver_id: req.params.driver_id,
		rider_id: req.params.rider_id,
		driver_accept: true,//req.param('driver_accept'),
		rider_accept: true,//req.param('rider_accept'),
		status: "accepted"
	}, function(err, docs){

		//update rider status
		riderClass.update(req.params.rider_id, 
			{$set:{
		      ride: true
		    }},
			function(error, docs) {
				req.flash('info', 'Succesfully added to carpool');
				res.redirect('back');
		});
		
	});
};

exports.delete_rider = function(req, res) {

	//authorization?
	carpoolClass.findRideForRider(req.params.rider_id, function(err, carpool){

		carpoolClass.delete(carpool._id.toString(), function(error, docs) {
			riderClass.update(req.params.rider_id, 
				{$set:{
			      ride: false
			    }},
				function(error, docs) {
					req.flash('info', 'Succesfully left carpool');
					res.redirect('back');
			});
		});

	});

};