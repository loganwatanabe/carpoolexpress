
var user_class = require('../user_class').UserClass;

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.all = function(req, res){
  user_class.findAll(function(error, docs){
    res.send(docs);
      // res.render('index', {
      //       title: 'Users',
      //       users:users
      //   });
  });
};

//render new user page
exports.register = function(req, res) {
    res.render('user_register', {
        title: 'New User'
    });
};

//save new user
exports.save = function(req, res){
    user_class.save({
        title: req.param('title'),//change these values
        name: req.param('name') //change these values
    }, function( error, docs) {
        res.redirect('/')//change this
    });
};



//render user edit page
exports.edit = function(req, res) {
        user_class.findById(req.param('_id'), function(error, user) {
                res.render('user_edit',
                { 
                        user: user
                });
        });
	};

//save updated user
exports.update = function(req, res) {
        user_class.update(req.param('_id'),{
                title: req.param('title'),//change these fields
                name: req.param('name')//change these fields
        }, function(error, docs) {
                res.redirect('/')
        });
};

//delete an employee
exports.delete = function(req, res) {
        user_class.delete(req.param('_id'), function(error, docs){
                res.redirect('/')
        });
};
