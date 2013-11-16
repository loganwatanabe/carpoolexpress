// //this is an exmaple of using mongoDB to store a rider class collection

var mongodb = require('mongodb');
//var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
//var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

RiderClass = function(host, port){
  var db = new mongodb.Db('nodejitsu_loganwatanabe_nodejitsudb9965101284',
            new mongodb.Server('ds045978.mongolab.com', 45978, {}));
    db.open(function (err, db_p) {
    if (err) { throw err; }
    db.authenticate('nodejitsu_loganwatanabe', '5rqqdp0qka16ean53d3cunur4p', function (err, replies) {
        // You are now connected and authenticated.
      });
  });
  this.db=db;  
  // this.db.open(function(){});
};


RiderClass.prototype.getCollection = function(callback){
  this.db.collection('riders', function(error, rider_collection) {
    if( error ) callback(error);
    else callback(null, rider_collection);
  });
};

//find all riders
RiderClass.prototype.findAll = function(callback) {
    this.getCollection(function(error, rider_collection) {
      if( error ) callback(error)
      else {
        rider_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

//find a rider by ID
RiderClass.prototype.findById = function(id, callback) {
    this.getCollection(function(error, rider_collection) {
      if( error ) callback(error)
      else {
        rider_collection.findOne({_id: rider_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

//save new rider
RiderClass.prototype.save = function(riders, callback) {
    this.getCollection(function(error, rider_collection) {
      if( error ) callback(error)
      else {
        if( typeof(riders.length)=="undefined")
          riders = [riders];

        for( var i =0;i< riders.length;i++ ) {
          rider = riders[i];
          rider.created_at = new Date();
        }

        rider_collection.insert(riders, function() {
          callback(null, riders);
        });
      }
    });
};


// update a rider
RiderClass.prototype.update = function(riderId, riders, callback) {
    this.getCollection(function(error, rider_collection) {
      if( error ) callback(error);
      else {
        rider_collection.update(
                                        {_id: rider_collection.db.bson_serializer.ObjectID.createFromHexString(riderId)},
                                        riders,
                                        function(error, riders) {
                                                if(error) callback(error);
                                                else callback(null, riders)       
                                        });
      }
    });
};

//delete rider
RiderClass.prototype.delete = function(riderId, callback) {
        this.getCollection(function(error, rider_collection) {
                if(error) callback(error);
                else {
                        rider_collection.remove(
                                {_id: rider_collection.db.bson_serializer.ObjectID.createFromHexString(riderId)},
                                function(error, rider){
                                        if(error) callback(error);
                                        else callback(null, rider)
                                });
                        }
        });
};

exports.RiderClass = RiderClass;