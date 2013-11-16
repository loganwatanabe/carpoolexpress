// //this is an exmaple of using mongoDB to store a user class collection

//var Db = require('mongodb').Db;

var mongodb = require('mongodb');
var Connection = require('mongodb').Connection;
//var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;


UserClass = function(host, port){
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
      if( error ) callback(error)
      else {
        user_collection.findOne({_id: user_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};


//find a user by username
UserClass.prototype.findByUsername = function(userN, callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        user_collection.findOne({username: userN}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
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
                        user_collection.remove(
                                {_id: user_collection.db.bson_serializer.ObjectID.createFromHexString(userId)},
                                function(error, user){
                                        if(error) callback(error);
                                        else callback(null, user)
                                });
                        }
        });
};

exports.UserClass = UserClass;