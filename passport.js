
//WHERE DOES THIS STUFF GO?

//use this to link to facebook login: <a href="/auth/facebook">Login with Facebook</a>


//local authen = username & password stored
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//passport stuff
passport.use(new LocalStrategy( function(username, password, done){
	User.findOne({username:username}, function(err,user){
		if(err)
			{ return done(err);}
		if(!user)
			{return done(null,false, {message:'Incorrect username.'});}
		if(!user.validPassword(password))
			{return done(null, false, {message:'Incorrect password.'});}
		return done(null, user);

	});
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});








//facebook, OAuth login
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: 417957444996823,
    clientSecret: "5b5e5ee11224c085c512b6d581a64d0f",
    callbackURL: "http://www.example.com/auth/facebook/callback"	//redirect URl after a successful login, [app-location].com/auth/facebook/callback
  },
  //function to log them in or create an account
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(profile.email, function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });

    //look up how this is supposed to work
    //profile.emails[0].value -> username
    //profile.name.givenName ->first_name
    //profile.name.familyName -> Watanabe
    //profile.photos[0].value -> profile pic?


  }
));