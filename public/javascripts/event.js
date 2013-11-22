//setup jquery and all that

$(function() { //document is loaded and ready

	$("#driver").on("click", function(){
		$("#jq-insert").append('<legend>How many can you drive?</legend><div class="ui-input-text ui-shadow-inset ui-corner-all ui-btn-shadow ui-body-b"><input type="number" name="ride_cap" id="ride_cap" value="" placeholder="Ride Capacity" data-theme="b" class="ui-input-text ui-body-b"></div>');
		//$("#subm").attr("value","RSVP as Driver");
		var act = $("#RSVPform").attr("action").replace("/role/","/driver/").replace("/rider/","/driver/");
		$("#RSVPform").attr("action",act);

	});

	$("#rider").on("click", function(){
		$("#jq-insert").empty();
		//$("#subm").attr("value","RSVP as Rider");
		var act = $("#RSVPform").attr("action").replace("/role/","/rider/").replace("/driver/","/rider/");
		$("#RSVPform").attr("action",act);
	});//end of load news


});//onReady