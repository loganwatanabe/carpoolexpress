$(function()
{


	
	$.get("/events/all", function(events, error){


		function loadEvents(index){
		// for(var ii=0; ii<events.length;ii++){//for each event
			var event_obj=events[index];

			$.get("/user/"+event_obj.created_by_id+"/info", function(host, err){

				var input='<li><a href="/event/'+event_obj._id+'">';
				input+= '<h2>'+event_obj.name+'</h2>';
				input+= '<p>Created by: '+host.first_name+' '+ host.last_name+'</p>';
				var date = moment(event_obj.date);
				input+= '<p>'+date.format('MMMM Do, YYYY')+'</p></a></li>';

				$("#event-list").append(input).trigger("create").listview("refresh");

			});

		}

		for(var ii=0; ii<events.length;ii++){//for each event
			loadEvents(ii);
		}

	});

});