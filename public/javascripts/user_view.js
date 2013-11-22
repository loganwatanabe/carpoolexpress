
$(function() { //document is loaded and ready

	$("#deletefb").on("click", function(){
		FB.api('/me/permissions', 'delete', function(response) {
		    console.log(response); // true
		});

	});

});//onReady
