// //this is an exmaple of using mongoDB to store a carpool class collection

var mongodb = require('mongodb');
//var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
//var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

CarpoolClass = function(host, port){
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


CarpoolClass.prototype.getCollection = function(callback){
  this.db.collection('carpools', function(error, carpool_collection) {
    if( error ) callback(error);
    else callback(null, carpool_collection);
  });
};

//find all carpools
CarpoolClass.prototype.findAll = function(callback) {
    this.getCollection(function(error, carpool_collection) {
      if( error ) callback(error)
      else {
        carpool_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

//find a carpool by ID
CarpoolClass.prototype.findById = function(id, callback) {
    this.getCollection(function(error, carpool_collection) {
      if( error ) callback(error)
      else {
        carpool_collection.findOne({_id: carpool_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

//save new carpool
CarpoolClass.prototype.save = function(carpools, callback) {
    this.getCollection(function(error, carpool_collection) {
      if( error ) callback(error)
      else {
        if( typeof(carpools.length)=="undefined")
          carpools = [carpools];

        for( var i =0;i< carpools.length;i++ ) {
          carpool = carpools[i];
          carpool.created_at = new Date();
        }

        carpool_collection.insert(carpools, function() {
          callback(null, carpools);
        });
      }
    });
};


// update a carpool
CarpoolClass.prototype.update = function(carpoolId, carpools, callback) {
    this.getCollection(function(error, carpool_collection) {
      if( error ) callback(error);
      else {
        carpool_collection.update(
                                        {_id: carpool_collection.db.bson_serializer.ObjectID.createFromHexString(carpoolId)},
                                        carpools,
                                        function(error, carpools) {
                                                if(error) callback(error);
                                                else callback(null, carpools)       
                                        });
      }
    });
};

//delete carpool
CarpoolClass.prototype.delete = function(carpoolId, callback) {
        this.getCollection(function(error, carpool_collection) {
                if(error) callback(error);
                else {
                        carpool_collection.remove(
                                {_id: carpool_collection.db.bson_serializer.ObjectID.createFromHexString(carpoolId)},
                                function(error, carpool){
                                        if(error) callback(error);
                                        else callback(null, carpool)
                                });
                        }
        });
};

exports.CarpoolClass = CarpoolClass;