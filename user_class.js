// //this is an exmaple of using mongoDB to store a user class collection

//var Db = require('mongodb').Db;

var mongodb = require('mongodb');
var Connection = require('mongodb').Connection;
//var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var EventClass = require('./event_class').EventClass;
var eventClass = new EventClass('localhost', 27017);

var DriverClass = require('./driver_class').DriverClass;
var driverClass = new DriverClass('localhost', 27017);

var RiderClass = require('./rider_class').RiderClass;
var riderClass = new RiderClass('localhost', 27017);


UserClass = function(host, port){
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


UserClass.prototype.getCollection = function(callback){
  this.db.collection('users', function(error, user_collection) {
    if( error ) callback(error);
    else callback(null, user_collection);
  });
};

//find all users
UserClass.prototype.findAll = function(callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        user_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

//find a user by ID
UserClass.prototype.findById = function(id, callback) {
    this.getCollection(function(error, user_collection) {
      if( error ){ callback(error);}
      else {
        user_collection.findOne({_id: user_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};


//find a user by email
UserClass.prototype.findByEmail = function(email, callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        user_collection.findOne( { email: email }
          , function(error, result) {
          if( error ) callback(error)
          else callback(null, result)//returns a user
        });
      }
    });
};

//save new user
UserClass.prototype.save = function(users, callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        if( typeof(users.length)=="undefined")
          users = [users];

        for( var i =0;i< users.length;i++ ) {
          user = users[i];
          user.created_at = new Date();
        }

        user_collection.insert(users, function() {
          callback(null, users);
        });
      }
    });
};


// update a user
UserClass.prototype.update = function(userId, users, callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error);
      else {
        user_collection.update(
                                        {_id: user_collection.db.bson_serializer.ObjectID.createFromHexString(userId)},
                                        users,
                                        function(error, users) {
                                                if(error) callback(error);
                                                else callback(null, users)       
                                        });
      }
    });
};

//delete user
UserClass.prototype.delete = function(userId, callback) {

  this.getCollection(function(error, user_collection) {
    if(error) callback(error);
    else {

      eventClass.findByUser(userId, function(er, events){
        for(var ii=0; ii<events.length;ii++){
         eventClass.delete(events[ii]._id.toString(), function(err, result){});
        }

        riderClass.findByUser(userId, function(err, riders){
          for(var ii=0; ii<riders.length;ii++){
            riderClass.delete(riders[ii]._id.toString(), function(err, result){});
          }

          driverClass.findByUser(userId, function(erro, drivers){
            for(var ii=0; ii<drivers.length;ii++){
              driverClass.delete(drivers[ii]._id.toString(), function(err, result){});
            }
          
            user_collection.remove(
                    {_id: user_collection.db.bson_serializer.ObjectID.createFromHexString(userId)},
                    function(error, user){
                            if(error) callback(error);
                            else callback(null, user)
                    });
          });
        });
      });
    }
  });
};

exports.UserClass = UserClass;