
//must include the below on the page
//<script src="http://maps.googleapis.com/maps/api/js?key=AIzaSyAnhJ9slS6FaJpwogrvb5SJtEGohVY7cns&sensor=true"></script>


$(function()
{

			//load this drivers with routes

	var driver_url = $(location).attr('pathname').replace('/car', '');

	$.get(driver_url, function(driver,stat){

		$.get("/event/"+driver.event_id+"/info", function(event_obj){

			
			$.get("/event/"+driver.event_id+"/coords", function(coords){

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

				var directionsService = new google.maps.DirectionsService();
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
				    stepDisplay.setContent(text);
				    stepDisplay.open(map, marker);
				  });
				}

				attachInstructionText(event_marker, event_obj.name + "<br>" + event_obj.location);

				directionsDisplay.setMap(map);
				//at this point google map is centered on event, with a marker







			$.get('/driver/'+driver._id+'/route_req', function(requ, status){
				// directionsDisplay.setDirections(response);
				requ.travelMode = google.maps.TravelMode.DRIVING;

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
		});

	});//load driver

});

//google.maps.event.addDomListener(window, 'load', initialize);
//<div id="googleMap" style="width:500px;height:380px;"></div>