
var UserClass = require('../user_class').UserClass;
var userClass = new UserClass('localhost', 27017);

var EventClass = require('../event_class').EventClass;
var eventClass = new EventClass('localhost', 27017);

var DriverClass = require('../driver_class').DriverClass;
var driverClass = new DriverClass('localhost', 27017);

var RiderClass = require('../rider_class').RiderClass;
var riderClass = new RiderClass('localhost', 27017);

var CarpoolClass = require('../carpool_class').CarpoolClass;
var carpoolClass = new CarpoolClass('localhost', 27017);

exports.list = function(req, res){
    userClass.findAll(function(error, docs){
      res.render('user_list.ejs', {locals:{
        title: 'Users',
        collection: docs,
        message: req.flash('info'),
        user:req.user
        }
      });
    });
};

exports.new = function(req, res){
  res.render('register.ejs', {locals: {title:'register', message: req.flash('info')}});
};


exports.create = function(req, res){
  var email = req.param('email');
  userClass.findByEmail(email, function(error, prof){
    if(prof){   //there already exists a user with that email
      //flash message
      req.flash('info', 'That email is taken.');
      res.redirect('/register');
    }else{
      userClass.save({
        // username: req.param('username'),
        password: req.param('password'),
        first_name: req.param('first_name'),
        last_name: req.param('last_name'),
        email: req.param('email'),
        contact: req.param('contact')
      }, function(err, docs){
        req.flash('info', "Profile successfully created.  Try log in.");
        res.redirect('/');
      });
    }

  });
};

exports.get = function(req, res){
  userClass.findById(req.params.id, function(error, user) {
    if(!user){res.redirect('/');}
    else{
      var authorized = false;
      if(req.user && req.user._id.toString()==req.params.id){
        authorized=true;
      }
        res.render('user_show',
        { locals: {
          // username: user.username,
          password: user.password,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          contact: user.contact,
          fb_id: user.fb_id,
          accessToken: user.access,
          id:user._id,
          user:req.user,
          authorized: authorized,
          message: req.flash('info'),
          title:user.first_name
        }
        });
    }
    });
};

exports.info = function(req, res){
  userClass.findById(req.params.id, function(error, user) {
      res.send(user);
    });
};



exports.edit = function(req, res){
  userClass.findById(req.params.id, function(error, user) {
    if(!user){res.redirect('/');}
    else{
      if(req.user._id == req.params.id){//user edits themselves
        res.render('user_edit',
        { locals: {
          id: user._id,
          // username: user.username,
          password: user.password,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          contact: user.contact,
          user:req.user,
          message: req.flash('info'),
          title:user.first_name,
        }
        });
      }
      else{
        req.flash('info', 'You are not authorized to edit this user');
        res.redirect('/');
      }
    }
  });
};

exports.update = function(req, res){
  if(req.user._id == req.params.id){//user edits themselves
    userClass.update(req.params.id,{$set:{
      // username: req.param('username'),
      password: req.param('password'),
      first_name: req.param('first_name'),
      last_name: req.param('last_name'),
      email: req.param('email'),
      contact: req.param('contact')
    }}, function(error, docs) {
      req.flash('info', 'User successfully edited');
      res.redirect('/user/'+req.params.id);
      
    });
  }else{
    req.flash('info', 'You are not authorized to edit this user');
    res.redirect('/')
  }
};

exports.delete = function(req, res){
  if(req.user._id == req.params.id){
    userClass.delete(req.params.id, function(error, docs) {
      req.flash('info', 'User successfully deleted');
      res.redirect('/');
      
    });
  }else{
    req.flash('info', 'You are not authorized to delete this user');
    res.redirect('/')
  }
};

exports.events = function(req,res){
  if(req.user._id == req.params.id){
      driverClass.findByUser(req.params.id, function(err, drivers){
        riderClass.findByUser(req.params.id, function(error, riders){
          res.render('user_events',
            { locals: {
              drivers: drivers,
              riders: riders,
              user:req.user,
              message: req.flash('info'),
              title:"My Events"
            }
          });
        });
      });
  }else{
    req.flash('info', 'You are not authorized to access that page');
    res.redirect('/events');
  }
};


exports.drivers = function(req,res){
    driverClass.findByUser(req.params.id, function(err, drivers){
      res.send(drivers);
    });
};

exports.riders =  function(req,res){
    riderClass.findByUser(req.params.id, function(err, riders){
      res.send(riders);
    });
}

//need a user.revokeFacebookAccess or something to remove app from facebook profile