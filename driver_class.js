// //this is an exmaple of using mongoDB to store a driver class collection

var mongodb = require('mongodb');
//var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
//var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

DriverClass = function(host, port){
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


DriverClass.prototype.getCollection = function(callback){
  this.db.collection('drivers', function(error, driver_collection) {
    if( error ) callback(error);
    else callback(null, driver_collection);
  });
};

//find all drivers
DriverClass.prototype.findAll = function(callback) {
    this.getCollection(function(error, driver_collection) {
      if( error ) callback(error)
      else {
        driver_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

//find a driver by ID
DriverClass.prototype.findById = function(id, callback) {
    this.getCollection(function(error, driver_collection) {
      if( error ) callback(error)
      else {
        driver_collection.findOne({_id: driver_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

//find a driver by Event
DriverClass.prototype.findByEvent = function(eventID, callback) {
    this.getCollection(function(error, driver_collection) {
      if( error ) callback(error)
      else {
        driver_collection.find({event_id: eventID}).toArray(function(error, results) {
          if( error ){
            callback(error);
          }
          else{
            callback(null, results);
          }
        });
      }
    });
};

DriverClass.prototype.findByUser = function(userID, callback) {
    this.getCollection(function(error, driver_collection) {
      if( error ) callback(error)
      else {
        driver_collection.find({user_id: driver_collection.db.bson_serializer.ObjectID.createFromHexString(userID)}).toArray(function(error, results) {
          if( error ){
            callback(error);
          }
          else{
            callback(null, results);
          }
        });
      }
    });
};

DriverClass.prototype.findByEventAndUser = function(eventID, userID, callback) {
    this.getCollection(function(error, driver_collection) {
      if( error ) callback(error)
      else {
        driver_collection.findOne({event_id: eventID, user_id:userID}, function(error, results) {
          if( error ){
            callback(error);
          }
          else{
            callback(null, results);
          }
        });
      }
    });
};


//save new driver
DriverClass.prototype.save = function(drivers, callback) {
    this.getCollection(function(error, driver_collection) {
      if( error ) callback(error)
      else {
        if( typeof(drivers.length)=="undefined")
          drivers = [drivers];

        for( var i =0;i< drivers.length;i++ ) {
          driver = drivers[i];
          driver.created_at = new Date();
        }

        driver_collection.insert(drivers, function() {
          callback(null, drivers);
        });
      }
    });
};


// update a driver
DriverClass.prototype.update = function(driverId, drivers, callback) {
    this.getCollection(function(error, driver_collection) {
      if( error ) callback(error);
      else {
        driver_collection.update(
                                        {_id: driver_collection.db.bson_serializer.ObjectID.createFromHexString(driverId)},
                                        drivers,
                                        function(error, drivers) {
                                                if(error) callback(error);
                                                else callback(null, drivers)       
                                        });
      }
    });
};

//delete driver
DriverClass.prototype.delete = function(driverId, callback) {
        this.getCollection(function(error, driver_collection) {
                if(error) callback(error);
                else {
                        driver_collection.remove(
                                {_id: driver_collection.db.bson_serializer.ObjectID.createFromHexString(driverId)},
                                function(error, driver){
                                        if(error) callback(error);
                                        else callback(null, driver)
                                });
                        }
        });
};

exports.DriverClass = DriverClass;