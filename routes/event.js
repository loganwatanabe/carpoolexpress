
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


exports.list = function(req, res){
	eventClass.findAll(function(error, events){
			res.render('event_list.ejs', {locals:{
				title: 'Events',
				collection: events,
				user:req.user,
				message: req.flash('info')
				}
			});
		})
};

exports.all = function(req, res){
	eventClass.findAll(function(error, events){
			res.send(events);
		});
};


exports.new = function(req, res){
		res.render('event_new.ejs', {locals: {
			title:'Create Event',
			message: req.flash('info'),
			user:req.user}
		});
};


exports.create = function(req, res){
	
		eventClass.save({
			name: req.param('name'),
			location: req.param('location'),
			date: req.param('date'),
			start_time: req.param('start_time'),
			end_time: req.param('end_time'),
			description: req.param('description'),
			created_by_id: req.user._id.toString()
		}, function(err, docs){
			req.flash('info', 'Event successfully created');
			res.redirect('/events');
		});
};

exports.get = function(req,res){

    eventClass.findById(req.params.id, function(error, event_obj) {
    	 userClass.findById(event_obj.created_by_id, function(error, creator) {
    	 	var authorized = false;
    	 	if(req.user && req.user._id.toString()==event_obj.created_by_id){
    	 		authorized=true;
    	 	}

    	 	var date=moment(event_obj.date).format("MMMM Do, YYYY");
    	 	var start=moment(event_obj.start_time, "HH:mm").format("h:mm A");
    	 	var end=moment(event_obj.end_time, "HH:mm").format("h:mm A");

			res.render('event_show',
	        { locals: {
				name: event_obj.name,
				date: date,
				location: event_obj.location,
				start_time: start,
				end_time: end,
				description: event_obj.description,
				id:event_obj._id,
				created_by: creator,
				user:req.user,
				authorized:authorized,
				message: req.flash('info'),
				title:event_obj.name
	        	}
			});
		 });

    });

};

exports.info = function(req,res){
    eventClass.findById(req.params.id, function(error, event_obj) {
    	res.send(event_obj);
    });
}

exports.edit = function(req, res){
	eventClass.findById(req.params.id, function(error, event) {
		if(error){res.redirect('/events');}
		else{
			if(req.user._id.toString()==event.created_by_id){
				res.render('event_edit',
				{ locals: {
					name: event.name,
					date: event.date,
					location: event.location,
					start_time: event.start_time,
					end_time: event.end_time,
					description: event.description,
					id:event._id,
					user:req.user,
					message: req.flash('info'),
					title:event.name
		        }
				});
			}else{
				req.flash('info', 'You are not authorized to edit this event');
				res.redirect('/events');
			}
		}
	});
};

exports.update = function(req, res){
	eventClass.findById(req.params.id, function(error, event) {
		if(error){res.redirect('/events');}
		else{
			if(req.user._id.toString()==event.created_by_id){
				eventClass.update(req.params.id,{$set:{
						name: req.param('name'),
						date: req.param('date'),
						location: req.param('location'),
						start_time: req.param('start_time'),
						end_time: req.param('end_time'),
						description: req.param('description')
						// created_by_id:req.user._id.toString()
				}}, function(error, docs) {
					req.flash('info', 'Event successfully edited');
					res.redirect('/event/'+req.params.id);
					
				});
			}else{
				req.flash('info', 'You are not authorized to edit this event');
				res.redirect('/events');
			}
		}
	});
};

exports.delete = function(req, res){
	eventClass.findById(req.params.id, function(error, event) {
		if(error){res.redirect('/events');}
		else{
			if(req.user._id.toString()==event.created_by_id){
				eventClass.delete(req.param('_id'), function(error, docs) {
					req.flash('info', 'Event successfully deleted');
					res.redirect('/events');
					
				});
			}else{
				req.flash('info', 'You are not authorized to delete this event');
				res.redirect('/event/'+req.params.id);
			}
		}
	});
};


exports.user =  function(req,res){
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

};

exports.drivers = function(req, res) {

    driverClass.findByEvent(req.params.id, function(error, drivers) {
        res.send(drivers);//JSON array
    });
};

exports.riders = function(req, res) {

    riderClass.findByEvent(req.params.id, function(error, riders) {
        res.send(riders);//JSON array
    });
};

exports.coords = function(req,res){
	eventClass.findById(req.params.id, function(err, event){

		googlemaps.geocode(event.location, function(err, event_geo){
			if(event_geo){
			var coords=event_geo.results[0].geometry.location;
			res.send(coords);
			}else{
				eventClass.update(req.params.id,{$set:{
						location: 'Cannot recognize location: please re-enter'
				}}, function(error, docs) {});
			}
		});

	});
}