
var EventClass = require('../event_class').EventClass;
var eventClass = new EventClass('localhost', 27017);
var UserClass = require('../user_class').UserClass;
var userClass = new UserClass('localhost', 27017);

var DriverClass = require('../driver_class').DriverClass;
var RiderClass = require('../rider_class').RiderClass;
var driverClass = new DriverClass('localhost', 27017);
var riderClass = new RiderClass('localhost', 27017);


exports.list = function(req, res){
	eventClass.findAll(function(error, docs){
			res.render('event_list.ejs', {locals:{
				title: 'Events',
				collection: docs,
				user:req.user
				}
			});
		})
};


exports.new = function(req, res){
		res.render('event_new.ejs', {locals: {
			title:'Create Event',
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
			res.redirect('/events');
			//effed up
		});
};

exports.get = function(req, res){


};


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
					title:event.name
		        }
				});
			}else{
				console.log('you are not authorized to edit');
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
					res.redirect('/event/'+req.params.id);
					//effed up
				});
			}else{
				console.log('you are not authorized to edit');
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
					res.redirect('/events');
					//effed up
				});
			}else{
				console.log('you are not authorized to delete');
				res.redirect('/events');
			}
		}
	});
};


