
//must include the below on the page
//<script src="http://maps.googleapis.com/maps/api/js?key=AIzaSyAnhJ9slS6FaJpwogrvb5SJtEGohVY7cns&sensor=true"></script>


$(function()
{


	var url_event = $(location).attr('pathname')+'/info';
	$.get(url_event, function(event_obj){

		var event_coords = $(location).attr('pathname')+'/coords';
		$.get(event_coords, function(coords){

			var lat=coords.lat;
			var lon=coords.lng;

			var mapProp = {
			  center:new google.maps.LatLng(lat,lon),
			  zoom:10,
			  mapTypeId:google.maps.MapTypeId.ROADMAP
			  };

			 //initializing the map object
			var map = new google.maps.Map(document.getElementById("googleMap")//jquery here?
			  ,mapProp);

			
			var directionsDisplay = new google.maps.DirectionsRenderer();


			var event_marker=new google.maps.Marker({
			  position: new google.maps.LatLng(lat,lon),
			  map: map,
			  title: event_obj.name
			  //icon:'/images/someting.png'
			  });

			var stepDisplay = new google.maps.InfoWindow();
			function attachInstructionText(marker, text) {
			  google.maps.event.addListener(marker, 'click', function() {
			    // Open an info window when the marker is clicked on,
			    // containing the text of the step.
			    stepDisplay.setContent(text);
			    stepDisplay.open(map, marker);
			  });
			}

			attachInstructionText(event_marker, event_obj.name + "<br>" + event_obj.location);

			//directionsDisplay.setMap(map);
			//at this point google map is centered on event, with a marker

			//now we'll try to add in stranded riders
			var url_riders = $(location).attr('pathname')+"/riders";
			$.get(url_riders, function(riders, work){

				function loadRider(index){
						$.get("/rider/"+riders[index]._id+"/has_ride", function(cp_or_null, diditwork){
								// if(cp_or_null){
								// 	
								// }
								// else{
									var rider=riders[index];

									$.get('/rider/'+rider._id+'/coords', function(coords, stat){
										var long=coords.lng;
										var latt=coords.lat;


										var rider_marker=new google.maps.Marker({
											position: new google.maps.LatLng(latt,long),
											map: map,
											title: rider.first_name+" "+ rider.last_name
										});
										attachInstructionText(rider_marker, rider.first_name+" "+ rider.last_name+ "<br>" + rider.location);

									});
					            // }
						});
				}//function

					for(var ll=0;ll<riders.length;ll++){
						loadRider(ll);
					}

			});//loads s riders



			//try and load drivers with routes

	var url_drivers = $(location).attr('pathname')+"/drivers";

	$.get(url_drivers, function(drivers,stat){//drivers is an array


		for(var ii=0; ii<drivers.length;ii++){
			$.get("/driver/"+drivers[ii]._id, function(driver, e){


			$.get('/driver/'+driver._id+'/route_req', function(requ, status){


				var directionsDisplay = new google.maps.DirectionsRenderer();
				directionsDisplay.setMap(map);

				// directionsDisplay.setDirections(response);
				requ.travelMode = google.maps.TravelMode.DRIVING;
				var directionsService = new google.maps.DirectionsService();

				directionsService.route(requ, function(response, status) {
				    if (status == google.maps.DirectionsStatus.OK) {
				      directionsDisplay.setDirections(response);
				    }
				  });
			});

			$.get('/driver/'+driver._id+'/coords', function(coords, stat){
				var long=coords.lng;
				var latt=coords.lat;


				var driver_marker=new google.maps.Marker({
					position: new google.maps.LatLng(latt,long),
					map: map,
					title: driver.first_name+" "+ driver.last_name
				});
				attachInstructionText(driver_marker, driver.first_name+" "+ driver.last_name+ "<br>" + driver.location);

			});


		});
		}//for each driver

	});//load cars



		});//get event_coords
	});//get event
});

//google.maps.event.addDomListener(window, 'load', initialize);
//<div id="googleMap" style="width:500px;height:380px;"></div>