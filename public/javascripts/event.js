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



//wrap all this in a get so we can access the driver/rider role of viewer
var url_user = $(location).attr('pathname')+"/user";
$.get(url_user, function(role_obj, status){
	//role_obj will be the current user's rider, driver, or null for this specific event
	//if(role_obj)


	var url_drivers = $(location).attr('pathname')+"/drivers";
	console.log(url_drivers);

	$.get(url_drivers, function(drivers,stat){//drivers is an array
		var count=1;
		if(drivers.length==0){
			$("#load_guests").append('<h1>No guests have RSVPd yet</h1>');
		}
		else{


			for(var ii=0; ii<drivers.length;ii++){ 
				var input = "";
				var driver=drivers[ii];
				var row="odd";
				if(count%2==0){row="even";}

				//add driver tile here
				input+='<div class="ui-grid-d row-'+ row +'"">';
				input+='<div class="ui-block-a">';
				input+='<p><img src="/images/driver.png" style="width:40px; height:40px; float:left;"></p>';
	            input+='<p class="tile_words"><a href="/user/'+driver.user_id+'">'+driver.first_name+' '+driver.last_name+'</a><br>'+driver.time+'&nbsp;&nbsp;'+driver.location+'<br>'+driver.notes+'</p></div>';
	                            
					var cc=98;
					$.get("/driver/"+driver._id+"/rides", function(riders){//pass in all a driver's carpools
						
						//AJAX for-loop
						for(var jj=0; jj<riders.length;jj++){

							var rider=riders[jj];
								if(cc>101){cc=97;}
									//add rider tiles here
									input+='<div class="ui-block-'+String.fromCharCode(cc)+'"">';
									input+='<p><img src="/images/rider.png" style="width:40px; height:40px;float:left;"></p>';
	                				input+='<p class="tile_words"><a href="/user/'+rider.user_id+'">'+rider.first_name+' '+rider.last_name+'</a><br>'+rider.location+'</p></div>';
	                				cc++;
						}




						var spaces = driver.cap-riders.length;
						//problem ajax for-loop
						for(var kk=0; kk<spaces;kk++){
							if(cc>101){cc=97;}
							//add empty tiles here
							input+='<div class="ui-block-'+String.fromCharCode(cc)+'">';
							input+='<p><img src="/images/empty.png" style="width:40px; height:40px;float:left;"></p>';
							//button
	        				input+='<p class="ride-butt">'  
	        				input+= '<form action="/driver/'+driver._id+'/rider/'+role_obj._id+'/new" method="post">';
            				input+= '<input type="hidden" name="driver_accept" value="">';
            				input+= '<input type="hidden" name="rider_accept" value="true">';
				            input+= '<input type="submit" data-theme="b" data-mini="true" data-role="button" data-inline="true" value="Request a Ride"></form></p></div>';
	        				cc++;
						}
						//jquery to push button created above
						//inject whole thing into DOM here
						input+="</div>";
						$("#load_cars").append(input).trigger("create");
					});

				count++;
			}//function
		}	

	});//load cars








	var url_riders = $(location).attr('pathname')+"/riders";
	$.get(url_riders, function(riders, work){
		var cc=97;


		function loadRider(index){
			var input="";
			if(index<riders.length){
				$.get("/rider/"+riders[index]._id+"/has_ride", function(cp_or_null, diditwork){
						if(cp_or_null){
							//this means the rider has a ride, do nothing
						}
						else{//rider does not have a ride(ie cp_or_null is null)
							//insert the DOM elements into #stranded_riders
							var rider=riders[index];
							if(cc>101){cc=97;}
							input+='<div class="ui-block-'+String.fromCharCode(cc)+'"">';
							input+='<p><img src="/images/rider.png" style="width:40px; height:40px;float:left;"></p>';
			                input+='<p class="tile_words"><a href="/user/'+rider.user_id+'">'+rider.first_name+' '+rider.last_name+'</a><br>'+rider.time+" "+rider.location;
							
			                //drivers only
							input+= '<form action="/driver/'+role_obj._id+'/rider/'+rider._id+'/new" method="post">';
            				input+= '<input type="hidden" name="driver_accept" value="true">';
            				input+= '<input type="hidden" name="rider_accept" value="">';
				            input+= '<input type="submit" data-theme="b" data-mini="true" data-role="button" data-inline="true" value="Offer a Ride"></form>';

			                input+='</p></div>';
			                
			                cc++;
			                //inserting into DOM here
			                $("#stranded_riders").append(input).trigger("create");
			            }
				});
			}
		}

			for(var ll=0;ll<riders.length;ll++){
				loadRider(ll);
			}

	});//loads stranded riders

});//load the user role_obj


});//onReady