  window.fbAsyncInit = function() {
    // init the FB JS SDK
    FB.init({
      appId      : '417957444996823',                        // App ID from the app dashboard
      status     : false,                                 // Check Facebook Login status
      xfbml      : false                                  // Look for social plugins on the page
    });

    // Additional initialization code such as adding Event Listeners goes here
  };

  // Load the SDK asynchronously
  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/all.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));