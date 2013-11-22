
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
			created_by_id: req.user._id
		}, function(err, docs){
			res.redirect('/events');
			//effed up
		});
};

exports.get = function(req, res){//replace with working code
  //   eventClass.findById(req.params.id, function(error, event) {

  //   	var creator;
  //   	userClass.findById(event.created_by_id, function(err,result){creator=result});
  //   	console.log(creator);

  //   	var driver_coll;
		// driverClass.findByEvent(event._id, function(error,result){driver_coll=result});
  //       res.render('event_show',
  //       { locals: {
		// 	name: event.name,
		// 	date: event.date,
		// 	location: event.location,
		// 	start_time: event.start_time,
		// 	end_time: event.end_time,
		// 	description: event.description,
		// 	id:event._id,
		// 	created_by: creator,
		// 	drivers:driver_coll,
		// 	user:req.user,
		// 	title:event.name
  //       }
  //       });
  //               //console.log(driver_coll);
  //   });
};


exports.edit = function(req, res){
	eventClass.findById(req.params.id, function(error, event) {
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
	});
};

exports.update = function(req, res){
	eventClass.update(req.param('_id'),{
			name: req.param('name'),
			date: req.param('date'),
			location: req.param('location'),
			start_time: req.param('start_time'),
			end_time: req.param('end_time'),
			description: req.param('description'),
			id:req.param('_id')
			//created_by_id:req.user._id
	}, function(error, docs) {
		res.redirect('/event/'+req.param('_id'));
		//effed up
	});
};

exports.delete = function(req, res){
		eventClass.delete(req.param('_id'), function(error, docs) {
			res.redirect('/events');
			//effed up
		});
};


