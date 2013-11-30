// //this is an exmaple of using mongoDB to store a rider class collection

var mongodb = require('mongodb');
//var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
//var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var CarpoolClass = require('./carpool_class').CarpoolClass;
var carpoolClass = new CarpoolClass('localhost', 27017);


RiderClass = function(host, port){
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

//find a driver by Event
RiderClass.prototype.findByEvent = function(eventID, callback) {
    this.getCollection(function(error, rider_collection) {
      if( error ) callback(error)
      else {
        rider_collection.find({event_id: eventID}).toArray(function(error, results) {
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

RiderClass.prototype.findByUser = function(userID, callback) {
    this.getCollection(function(error, rider_collection) {
      if( error ) callback(error)
      else {
        rider_collection.find({user_id: rider_collection.db.bson_serializer.ObjectID.createFromHexString(userID)}).toArray(function(error, results) {
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

RiderClass.prototype.findByEventAndUser = function(eventID, userID, callback) {
    this.getCollection(function(error, rider_collection) {
      if( error ) callback(error)
      else {
        rider_collection.findOne({event_id: eventID, user_id:userID}, function(error, results) {
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


RiderClass.prototype.findByCarpoolDriver = function(driverID, callback) {
    this.getCollection(function(error, rider_collection) {
      if( error ) callback(error)
      else {

        carpoolClass.findRidesForDriver(driverID, function(err, carpools){
          var rider_ids = [];
          for(var ii=0;ii<carpools.length;ii++){
            rider_ids.push(new ObjectID(carpools[ii].rider_id));
          }

          rider_collection.find( {_id:{$in : rider_ids}}).toArray(function(e, riders){
            callback(null, riders);

          });
        });

      }

    });
};
// RiderClass.prototype.needRideByEvent = function(eventID, callback) {
//     this.getCollection(function(error, rider_collection) {
//       if( error ) callback(error)
//       else {
//         rider_collection.find({event_id: eventID}, function(error, result) {//get list of all riders for an event
//           riders.toArray(function(e,riders){
//             var got_ride =[];
//             for(var ii=0;ii<riders.length;ii++){//for each rider
//               this.db.colection('carpools', function(err, carpool_collection){//access carpools
//                 carpool_collection.findRideForRider(rider._id, function(er, ride){
//                   if(ride!=null){
//                     got_ride.push(rider)
//                   }
//                 });
//               });

//             }

//           });
//         });
//       }
//     });
// };

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