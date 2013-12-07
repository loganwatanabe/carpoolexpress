// $(document).on("pageinit", "#user_events", function() { //document is loaded and ready
$(function() { //document is loaded and ready

	var url_drivers = $(location).attr('pathname').replace("/events","/drivers");
	var url_riders = $(location).attr('pathname').replace("/events","/riders");


	$.get(url_drivers, function(drivers, status){
		// for(var ii=0;ii<drivers.length;ii++){
			function loadDrivers(index){
			var driver=drivers[index]
			var input="";

			$.get('/event/'+driver.event_id+'/info', function(one_event){
				input+='<li><a href="/event/'+driver.event_id+'">';
				input+='<img src="/images/driver.png" class="ui-li-icon ui-corner-none">';

				var date=moment(one_event.date).format("MMMM Do, YYYY");
	    	 	var start=moment(one_event.start_time, "HH:mm").format("h:mm A");

				input+='<h3>'+one_event.name+'</h3><p>'+start+'</p><p>'+date+'</p><p>'+one_event.location+'</p><br>';
				input+='<p>Driving: ';
				$.get('/driver/'+driver._id+'/rides', function(rides){
					if(rides.length==0){	input+='no people.';}
					else if(rides.length==1){ input+='1 person.';}
					else{ rides.length+' people.';}

					input+='</p></a></li>';

					$("#list_events").append(input).trigger("create").listview("refresh");

				})
			});
		}
		for(var ii=0;ii<drivers.length;ii++){
			loadDrivers(ii);
		}
	});

	$.get(url_riders, function(riders, status){
		// for(var ii=0;ii<riders.length;ii++){
		function loadRiders(index){
			var rider=riders[index]
			var input="";

			$.get('/event/'+rider.event_id+'/info', function(one_event){
				var date=moment(one_event.date).format("MMMM Do, YYYY");
	    	 	var start=moment(one_event.start_time, "HH:mm").format("h:mm A");

				input+='<li><a href="/event/'+rider.event_id+'">';
				input+='<img src="/images/rider.png" class="ui-li-icon ui-corner-none">';
				input+='<h3>'+one_event.name+'</h3><p>'+start+'</p><p>'+date+'</p><p>'+ one_event.location+'</p><br>';

				$.get('/rider/'+rider._id+'/has_ride', function(carpool){
					if(!carpool){

						input+='<p>You have no ride.</p></a></li>';
						$("#list_events").append(input).trigger("create").listview("refresh");
					}
					else{
						$.get('/driver/'+carpool.driver_id, function(driver){
							input+='<p> You have a ride from '+driver.first_name+' '+driver.last_name+'.</p></a></li>';
							$("#list_events").append(input).trigger("create").listview("refresh");
						});
					}

				})
			});
		}
		for(var ii=0;ii<riders.length;ii++){
			loadRiders(ii);
		}
	});

});//onReady