
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Carpool Express', user:req.user, message: req.flash('info') });
};