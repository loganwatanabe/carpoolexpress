// //this is an exmaple of using mongoDB to store a event class collection

var mongodb = require('mongodb');
//var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
//var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var DriverClass = require('./driver_class').DriverClass;
var driverClass = new DriverClass('localhost', 27017);

var RiderClass = require('./rider_class').RiderClass;
var riderClass = new RiderClass('localhost', 27017);



EventClass = function(host, port){
  var db = new mongodb.Db('nodejitsu_loganwatanabe_nodejitsudb9965101284',
            new mongodb.Server('ds045978.mongolab.com', 45978, {}), {safe:true});
    db.open(function (err, db_p) {
    if (err) { throw err; }
    db.authenticate('nodejitsu_loganwatanabe', '5rqqdp0qka16ean53d3cunur4p', function (err, replies) {
        // You are now connected and authenticated.
      });
  });
  this.db=db;  
  // this.db.open(function(){});
};


EventClass.prototype.getCollection = function(callback){
  this.db.collection('events', function(error, event_collection) {
    if( error ) callback(error);
    else callback(null, event_collection);
  });
};

//find all events
EventClass.prototype.findAll = function(callback) {
    this.getCollection(function(error, event_collection) {
      if( error ) callback(error)
      else {
        event_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

//find a event by ID
EventClass.prototype.findById = function(id, callback) {
    this.getCollection(function(error, event_collection) {
      if( error ) callback(error)
      else {
        event_collection.findOne({_id: event_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

EventClass.prototype.findByUser = function(userID, callback) {
    this.getCollection(function(error, event_collection) {
      if( error ) callback(error)
      else {
        event_collection.find({created_by_id: userID}).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

//save new event
EventClass.prototype.save = function(events, callback) {
    this.getCollection(function(error, event_collection) {
      if( error ) callback(error)
      else {
        if( typeof(events.length)=="undefined")
          events = [events];

        for( var i =0;i< events.length;i++ ) {
          event = events[i];
          event.created_at = new Date();
        }

        event_collection.insert(events, function() {
          callback(null, events);
        });
      }
    });
};


// update a event
EventClass.prototype.update = function(eventId, events, callback) {
    this.getCollection(function(error, event_collection) {
      if( error ) callback(error);
      else {
        event_collection.update(
                                        {_id: event_collection.db.bson_serializer.ObjectID.createFromHexString(eventId)},
                                        events,
                                        function(error, events) {
                                                if(error) callback(error);
                                                else callback(null, events)       
                                        });
      }
    });
};

//delete event
EventClass.prototype.delete = function(eventId, callback) {
  this.getCollection(function(error, event_collection) {
    if(error) callback(error);
    else {
      driverClass.findByEvent(eventId, function(erro, drivers){
        for(var ii=0; ii<drivers.length;ii++){
          driverClass.delete(drivers[ii]._id.toString(), function(er, result){});
        }

        riderClass.findByEvent(eventId, function(err, riders){

          for(var ii=0; ii<riders.length;ii++){
            riderClass.delete(riders[ii]._id.toString(), function(e, result){});
          }

          event_collection.remove(
                  {_id: event_collection.db.bson_serializer.ObjectID.createFromHexString(eventId)},
                  function(error1, event_obj){
                          if(error1) callback(error1);
                          else callback(null, event_obj)
                  });
          });
      });
    }
  });
};

exports.EventClass = EventClass;