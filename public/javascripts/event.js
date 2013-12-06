//setup jquery and all that

//$(document).on("pageinit", function() {//will need to make pages for all of these then, no layout
$(function() { //document is loaded and ready




	$("#driver").on("click", function(){
		$("#jq-insert").empty();
		$("#jq-insert").append('<legend>How many can you drive?</legend><input type="number" name="ride_cap" id="ride_cap" value="" placeholder="Ride Capacity" data-theme="b" class="ui-input-text ui-body-b">').trigger("create");
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



//wrap all this in a get so we can access the driver/rider role of viewer
var url_user = $(location).attr('pathname')+"/user";
$.get(url_user, function(role_obj, status){

	//role_obj will be the current user's rider, driver, or null for this specific event
	if(role_obj)//user is RSVP'd
	{
		$("#RSVPbutton").empty();
		$("#RSVPbutton").append('<a href="#" data-inline="true" data-theme="b" data-role="button" class="ui-disabled">You have RSVPd</a>').trigger("create");
	}


	var url_drivers = $(location).attr('pathname')+"/drivers";

	$.get(url_drivers, function(drivers,stat){//drivers is an array
		var count=1;

		if(drivers.length==0){
			$("#load_cars").append('<h1>No drivers have RSVPd yet</h1>').trigger("create");;
		}
		else{

			for(var ii=0; ii<drivers.length;ii++){
				$.get("/driver/"+drivers[ii]._id, function(driver, er){
				var input = "";
				var row="odd";
				//if(count%2==0){row="even";}

				//add driver tile here
				input+='<div class="ui-corner-all border-block ui-grid-d row-'+ row +'"">';
				input+='<div class="ride-tile my-breakpoint ui-block-a">';
				input+='<p><img src="/images/driver.png" style="width:40px; height:40px; float:left;"></p>';
	            input+='<p class="tile_words"><a href="/user/'+driver.user_id+'">'+driver.first_name+' '+driver.last_name+'</a><br>'+driver.time+'&nbsp;&nbsp;'+driver.location+'<br>'+driver.notes;
	            var link = "/driver/"+driver._id+"/car";
	            input+='</p><p><a href="'+link+'" data-inline="true" data-mini="true" data-role="button">View Car</a>';

	            if(role_obj._id == driver._id){//only the driver can see this
	            	
	            	input+='<a href="#'+driver._id+'" data-rel="popup" data-position-to="window" data-mini="true" data-role="button" data-inline="true" data-icon="gear" data-theme="a" data-transition="pop">Change</a>';
					input+='<div data-role="popup" id="'+driver._id+'" data-theme="a">';
					    input+='<form id="driver_edit" action="/driver/'+driver._id+'/edit" method="post"><div style="padding:10px 20px;">';
					            input+='<h3>Change RSVP</h3>';
					            input+='<legend>Where from?</legend><input type="text" name="location" id="location" value="'+driver.location+'" placeholder="Location" data-theme="b">';
                                input+='<legend>What time?</legend><input type="time" name="time" id="time" value="'+driver.time+'" placeholder="Leave Time" data-theme="b">';
								input+='<legend>How many can you drive?</legend><input type="number" name="ride_cap" id="ride_cap" value="'+driver.cap+'" placeholder="Ride Capacity" data-theme="b" class="ui-input-text ui-body-b">';
								input+='<legend>Notes</legend><textarea name="notes" id="notes" placeholder="Ride Notes" data-theme="b">'+driver.notes+'</textarea>';
					            input+='<button type="submit" data-theme="b">Update</button>';
					    input+='</div></form>---OR---<br>';
					input+= '<form action="/driver/'+driver._id+'/delete" method="post">';
				    input+= '<input type="submit" data-theme="e" data-role="button" data-inline="true" value="Delete RSVP"></form>';
					input+='</div>';


	            }
	            input += '</p></div>';

	                            
					var cc=98;
					$.get("/driver/"+driver._id+"/rides", function(riders){//pass in all a driver's carpools
						console.log(riders);
						//AJAX for-loop
						for(var jj=0; jj<riders.length;jj++){

							var rider=riders[jj];
								if(cc>101){cc=97;}
									//add rider tiles here
									input+='<div class="ride-tile my-breakpoint ui-block-'+String.fromCharCode(cc)+'"">';
									input+='<p><img src="/images/rider.png" style="width:40px; height:40px;float:left;"></p>';
	                				input+='<p class="tile_words"><a href="/user/'+rider.user_id+'">'+rider.first_name+' '+rider.last_name+'</a><br>'+rider.location;
	                				
	                				if(role_obj._id == rider._id){
							        	input+='<br><a href="#'+rider._id+'-ride" data-rel="popup" data-position-to="window" data-mini="true" data-role="button" data-inline="true" data-icon="gear" data-theme="a" data-transition="pop">Change</a>';
										input+='<div data-role="popup" id="'+rider._id+'-ride" data-theme="a" class="ui-corner-all">';
										    input+='<form id="rider_edit" action="/rider/'+rider._id+'/edit" method="post"><div style="padding:10px 20px;">';
										            input+='<h3>Change RSVP</h3>';
										            input+='<legend>Where from?</legend><input type="text" name="location" id="location" value="'+rider.location+'" placeholder="Location" data-theme="b">';
					                                input+='<legend>What time?</legend><input type="time" name="time" id="time" value="'+rider.time+'" placeholder="Leave Time" data-theme="b">';
													input+='<legend>Notes</legend><textarea name="notes" id="notes" placeholder="Ride Notes" data-theme="b">'+rider.notes+'</textarea>';
										            input+='<button type="submit" data-theme="b">Update</button>';
										    input+='</div></form>---OR---';
										input+= '<form action="/carpool/rider/'+rider._id+'/delete" method="post">';
									    input+= '<input type="submit" data-theme="e" data-role="button" data-inline="true" value="Leave Car"></form>';
									    input+='---OR---';
										input+= '<form action="/rider/'+rider._id+'/delete" method="post">';
									    input+= '<input type="submit" data-theme="e" data-role="button" data-inline="true" value="Delete RSVP"></form>';
										input+='</div>';
						            }
						            if(role_obj._id == driver._id){
						            	input+= '<br><form action="/carpool/rider/'+rider._id+'/delete" method="post">';
									    input+= '<input type="submit" data-theme="e" data-role="button" data-mini="true" data-inline="true" value="Remove"></form>';
						            }

	                				input+='</p></div>';
	                				cc++;
						}




						var spaces = driver.cap-riders.length;
						//problem ajax for-loop
						for(var kk=0; kk<spaces;kk++){
							if(cc>101){cc=97;}
							//add empty tiles here
							input+='<div class="ride-tile my-breakpoint ui-block-'+String.fromCharCode(cc)+'"><div class="blank-tile">';
							input+='<p><img src="/images/empty.png" style="width:40px; height:40px;float:left;"></p>';
							//button
							if(role_obj.role == "rider" && role_obj.ride==false){

		        				input+='<p class="ride-butt">'
		        				input+= '<form action="/driver/'+driver._id+'/rider/'+role_obj._id+'/new" method="post">';
	            				input+= '<input type="hidden" name="driver_accept" value="">';
	            				input+= '<input type="hidden" name="rider_accept" value="true">';
					            input+= '<input type="submit" data-theme="b" data-mini="true" data-role="button" data-inline="true" value="Request a Ride"></form></p>';
	        				}

	        				input+='</div></div>';
	        				cc++;
						}
						//jquery to push button created above
						//inject whole thing into DOM here
						input+="</div></div>";
						$("#load_cars").append(input).trigger("create");
					});
				});
				count++;
			}//for loop
		}	

	});//load cars








	var url_riders = $(location).attr('pathname')+"/riders";
	$.get(url_riders, function(riders, work){
		var cc=97;


		function loadRider(index){
			var input="";
			if(index<riders.length){
				$.get("/rider/"+riders[index]._id+"/has_ride", function(cp_or_null, diditwork){
						//if(cp_or_null){
							//this means the rider has a ride, do nothing
							//class="ui-disabled"



						//}
						//else{//rider does not have a ride(ie cp_or_null is null)
							//insert the DOM elements into #stranded_riders
							var rider=riders[index];
							if(cc>101){cc=97;}
							input+='<div class="ride-tile ';
							if(cp_or_null){input+='ui-disabled';}
							input+=' my-breakpoint ui-block-'+String.fromCharCode(cc)+'"">';
							input+='<p><img src="/images/rider.png" style="width:40px; height:40px;float:left;"></p>';
			                input+='<p class="tile_words"><a href="/user/'+rider.user_id+'">'+rider.first_name+' '+rider.last_name+'</a><br>'+rider.time+" "+rider.location;
							input+='<br>'+rider.notes;

			                //drivers only
			                if(role_obj.role=="driver" && !cp_or_null){
								input+= '<form action="/driver/'+role_obj._id+'/rider/'+rider._id+'/new" method="post">';
	            				input+= '<input type="hidden" name="driver_accept" value="true">';
	            				input+= '<input type="hidden" name="rider_accept" value="">';
					            input+= '<input type="submit" data-theme="b" data-mini="true" data-role="button" data-inline="true" value="Offer a Ride"></form>';
					        }
					        //riders only
					        if(role_obj._id == rider._id && !cp_or_null){//only the rider sees this
					        	input+='<br><a href="#'+rider._id+'" data-rel="popup" data-position-to="window" data-mini="true" data-role="button" data-inline="true" data-icon="gear" data-theme="a" data-transition="pop">Change</a>';
								input+='<div data-role="popup" id="'+rider._id+'" data-theme="a" class="ui-corner-all">';
								    input+='<form id="rider_edit" action="/rider/'+rider._id+'/edit" method="post"><div style="padding:10px 20px;">';
								            input+='<h3>Change RSVP</h3>';
								            input+='<legend>Where from?</legend><input type="text" name="location" id="location" value="'+rider.location+'" placeholder="Location" data-theme="b">';
			                                input+='<legend>What time?</legend><input type="time" name="time" id="time" value="'+rider.time+'" placeholder="Leave Time" data-theme="b">';
											input+='<legend>Notes</legend><textarea name="notes" id="notes" placeholder="Ride Notes" data-theme="b">'+rider.notes+'</textarea>';
								            input+='<button type="submit" data-theme="b">Update</button>';
								    input+='</div></form>---OR---<br>';
								input+= '<form action="/rider/'+rider._id+'/delete" method="post">';
							    input+= '<input type="submit" data-theme="e" data-role="button" data-inline="true" value="Delete RSVP"></form>';
								input+='</div>';
						    }

			                input+='</p></div>';
			                
			                cc++;
			                //inserting into DOM here
			                $("#stranded_riders").append(input).trigger("create");
			            //}
				});
			}
		}

			for(var ll=0;ll<riders.length;ll++){
				loadRider(ll);
			}

			if(riders.length==0){
				$("#rider-box").append("<h1>No riders have RSVPd yet</h1>").trigger("create");
			}

	});//loads stranded riders

});//load the user role_obj


});//onReady