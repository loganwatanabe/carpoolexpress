
var UserClass = require('../user_class').UserClass;
var userClass = new UserClass('localhost', 27017);

exports.list = function(req, res){
    userClass.findAll(function(error, docs){
      console.log(docs);
      res.render('user_list.ejs', {locals:{
        title: 'Users',
        collection: docs,
        user:req.user
        }
      });
    });
};

exports.new = function(req, res){
  res.render('register.ejs', {locals: {title:'register'}});
};


exports.create = function(req, res){
  userClass.save({
      username: req.param('username'),
      password: req.param('password'),
      first_name: req.param('first_name'),
      last_name: req.param('last_name'),
      email: req.param('email'),
      contact: req.param('contact')
    }, function(err, docs){
      res.redirect('/users');
      //effed up
    });
};

exports.get = function(req, res){
  userClass.findById(req.params.id, function(error, user) {
        res.render('user_show',
        { locals: {
          username: user.username,
          password: user.password,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          contact: user.contact,
          fb_id: user.fb_id,
          accessToken: user.access,
          id:user._id,
          user:req.user,
          title:user.username
        }
        });
    });
};

exports.edit = function(req, res){
  userClass.findById(req.params.id, function(error, user) {
    //if(req.user._id == req.params.id)//user edits themselves
    res.render('user_edit',
    { locals: {
      id: user._id,
      username: user.username,
      password: user.password,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      contact: user.contact,
      user:req.user,
      title:user.username,
    }
    });
  });
};

exports.update = function(req, res){
  userClass.update(req.param('_id'),{
    username: req.param('username'),
    password: req.param('password'),
    first_name: req.param('first_name'),
    last_name: req.param('last_name'),
    email: req.param('email'),
    contact: req.param('contact')
  }, function(error, docs) {
    res.redirect('/user/'+req.param('_id'));
    //effed up
  });
};

exports.delete = function(req, res){
    userClass.delete(req.param('_id'), function(error, docs) {
      res.redirect('/users');
      //effed up
    });
};

//need a user.revokeFacebookAccess or something to remove app from facebook profile