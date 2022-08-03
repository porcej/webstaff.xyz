

/* globals $: false */

/**************************    Start Telestaff Views **************************/

/* Change Log
	- 2017-06-13: Updated _parseShiftTimes to handle 12:00 PM hour.
	- 2017-06-13: Fixed typo in _getShift()
	- 2017-06-23: Updates roster display to get notes from the o.notes key 
					for stations and units
	- 2017-10-08: Updated roster display to show Telestaff V.6 pending request icons
	- 2018-03-12: Updated roster display to handle Telestaff V 6.4.2 Iconography
	- 2018-12-28: Changed handling of dates to better reflect month changes

*/



function telestaffViews(){
	"use strict";
	this._formateTimeRange = function( str ){
		if (str == '07:00-07:00'){
			return 'All Day';
		}
		return str.split('-').join(' - ') || '';
	};

	// Formats data.webstaff.xyz date (YYYYMMDD) into human readable date
	this._formateDate = function( str ){
		var year = parseInt(str.substring(0,4));
		var month = parseInt(str.substring(4,6))-1;
		var day = parseInt(str.substring(6,9));
		var d = new Date(year, month, day);
		var dStr = d.toString();
		return dStr.slice(0,10);
	};

	// Save date to Date object
	this._toDateObject = function( str ){
		if ( !str ){
			return new Date();
		}
		var year = parseInt(str.substring(0,4));
		var month = parseInt(str.substring(4,6))-1;
		var day = parseInt(str.substring(6,9));
		return new Date(year, month, day);
	};


	// Maps Telestaff Battalions to Valids Class Representations
	this._mapBatallion = function( str ){
		var bats = {
			EMS: 'EMS',
			'Fire Emergency Services': 'FES',
			'Fire Prevention Services': 'FPS',
			'Support Services': 'SS'
		};
		return bats[str];
	};

	// Reformats a string to be useable in a class
	this._classifyStr = function( str ){
		return str.replace(/\s|\./g,'-');
	};	// _classifyStr()

	// Parses a Telestaff Roster Name to get the name and the qualifications short codes
	this._parseNameCaps = function( str ){
		return [str.replace(/\(.*$/g, '').trim(), str.replace(/^[^\(]*|\(|\)/g, '').trim()];
	};	//_parseNamesCaps()

	// Returns a date object in telestaff format YYYYMMDD
	this._toTelestaffString = function( date ){
		date = date || new Date();
		return date.getFullYear().toString() + this._padLeading(date.getMonth() + 1) + this._padLeading(date.getDate());
	};	// _toTelestaffString

	// Returns a date object in month input format YYYY-MM
	this._toMonthString = function( date ){
		date = date || new Date();
		return date.getFullYear().toString() + "-" + this._padLeading(date.getMonth() + 1);
	};	// _toMonthString

	// Returns a date object in date input format YYYY-MM-DD
	this._toDateString = function( date ){
		date = date || new Date();
		return date.getFullYear().toString() + "-" + this._padLeading(date.getMonth() + 1) + "-" + this._padLeading(date.getDate())
	};	// _toDateString

	// Returns a function that formats a date object in telestaff format
	this._retToTelestaffString = function ( ) {
		return function(date){
			date = date || new Date();

			// Get Month componet and pad if needed
			var month = (date.getMonth() + 1).toString();
			month = month.length >= 2 ? month : new Array(2 - month.length + 1).join('0') + month;

			// Get day componet and pad if needed
			var day = date.getDate().toString();
			day = day.length >= 2 ? day : new Array(2 - day.length + 1).join('0') + day;

			return date.getFullYear().toString() + month + day;
		};

	};

	this._getMonthName = function( num ){
		return this._getMonthNameJS(num - 1);
	};

	this._getMonthNameJS = function( num ){
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		return months[num];
	};


	// Gets the month index (0..11) for month, month, returns -1 if month is unknow
	this._getMonthNumberJS = function( str ){
		str = str || '';
		str = str.toLowerCase();

		var monthMap = {
			january: 0,
			february: 1,
			march: 2,
			april: 3,
			may: 4,
			june: 5,
			july: 6,
			august: 7,
			september: 8,
			october: 9,
			november: 10,
			december: 11,
			jan: 0,
			feb: 1,
			mar: 2,
			apr: 3,
			// May is left out because the shortcode and the long code are the same
			jun: 5,
			jul: 6,
			aug: 7,
			sep: 8,
			oct: 9,
			nov: 10,
			dec: 11
		};

		if (monthMap.hasOwnProperty(str)){
			return monthMap[str];
		} else {
			return -1;
		}
	};	// _this._getMonthNumberJS()

	// Parses full date format from Telestaff and retursn a date object
	this._parseFullDate = function(str){
		// Monday, January 2, 2017
		str = str.replace(/,/, '');
		var strParts = str.split(' ');
		var dateParts = {
			dayName: strParts[0],
			month: this._getMonthNumberJS(strParts[1]),
			day: parseInt(strParts[2]),
			year: parseInt(strParts[3])
		};
		return new Date(dateParts.year, dateParts.month, dateParts.day);
	};	// _parseFullDate()

	// Pads string n, with the contents of z (defautls to 0) for a total width
	//	width
	this._padLeading = function(n, width, z) {
		z = z || '0';
		width = width || 2;
		n = n.toString() + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	};	// this._padLeading()

	// Returns the number of days between Dates first and second.
	this._dayDiff = function(first, second) {
	    return Math.round(Math.abs(second-first)/(1000*60*60*24));
	};	// _dayDiff


	// Determines what shift is working on date
	this._getShift = function( date ){

		date = date || new Date();

		// First we clean up date by dropping hours, minutes and seconds
		date = new Date( date.getFullYear(), date.getMonth(), date.getDate() );

		var shiftMap = {
			// 2017/00/03 - 2017/00/05 - 2017/00/07
			a: {
				first: new Date(2017,0,3),
				second: new Date(2017,0,5),
				third: new Date(2017,0,7)
			},
			// 2017/00/06 - 2017/00/08 - 2017/00/10
			b: {
				first: new Date(2017,0,6),
				second: new Date(2017,0,8),
				third: new Date(2017,0,10)
			},
			// 2017/00/09 - 2017/00/11 - 2017/00/13
			c: {
				first: new Date(2017,0,9),
				second: new Date(2017,0,11),
				third: new Date(2017,0,13)
			}

		};

		for ( var sdx in shiftMap ){
			if (shiftMap.hasOwnProperty( sdx )){
				for ( var ddx in shiftMap[sdx]){
					if ( shiftMap[sdx].hasOwnProperty(ddx) ) {
						var d = this._dayDiff(shiftMap[sdx][ddx], date);
						if (d % 9 === 0 ) {
							return sdx;
						}
					}
				}
			}
		}

		return '';
		
	};	/* this._getShift() */

	this._parseShiftTimes = function(str){
		// 05/30/2017 07:00 AM
		str = str || '';

		str = str.slice(10);
		var parts = str.trim().split(' ');

		if (parts[1] == "PM"){
			var p = parts[0].split(":");

			if (p[0] != 12) {
				parts[0] = (parseInt(p[0]) + 12).toString() + ":" +p[1];
			}
		}
		
		return parts[0];
	};	/* parseShiftTimes() */
}



telestaffViews.prototype = {

	dispFilter: function(type, opts){
		var filterType = type || '';
		var filterList = opts || {};
		var filterWindow = $("<div/>").addClass("modal hide fade")
				   .attr("role", "dialog")
				   .attr("id", "filter-modal");

		filterWindow.append( $("<div/>").addClass("modal-header").html("<button type='button' class='close' data-dismiss='modal'>×</button><<h3>" + type + "</h3>"));

		$("body").append(filterWindow);
	},

	// Returns an error
	dispError: function(){
		$("#msg").html(`<div class="jumbotron">
    <h1><i class="fa fa-frown-o red"></i> 404 Not Found</h1>
    <p class="lead">We couldn't find what you're looking for on <em>https://` + window.location.hostname + `</em>.</p>
    <p><a onclick=javascript:checkSite(); class="btn btn-default btn-lg"><span class="green">Take Me To The Homepage</span></a>
        <script type="text/javascript">
            function checkSite(){
              var currentSite = window.location.hostname;
                window.location = "https://" + currentSite;
            }
        </script>
    </p>
  </div>`);
		$("#app").html(`    <div class="row">
      <div class="col-md-6">
        <h2>What happened?</h2>
        <p class="lead">A 404 error status implies that the file or page that you're looking for could not be found.</p>
      </div>
      <div class="col-md-6">
        <h2>What can I do?</h2>
        <p class="lead">If you're a site visitor</p>
        <p>Please use your browser's back button and check that you're in the right place. If you need immediate assistance, please send us an email instead.</p>
     </div>
    </div>`);

	},	// dispError()

	dispSignup: function(data){
		// We use the hash value to get the current date (or assume today)Z
		var dateObj = this._toDateObject( window.location.hash.split("/")[1] );
		var date = moment(dateObj);

		$(document).prop('title', 'AFD Webstaff | Signup');

		var panel = $("<div/>").addClass("panel panel-default ts-panel-signup");

		var heading = $("<span/>").addClass("pull-left");
		heading.append($("<h4/>").addClass("panel-title " + 
								this._getShift(dateObj) + 
								"-shift").html('Signup for ' + date.format('dddd, MMMM Do, YYYY') ));
		heading.append($("<small/>").html('<a href="#roster/' + date.format('YYYYMMDD') + '">Roster</a> | <a href="#picklist/' + date.format('YYYYMMDD') + '">Picklist</a> | <a href="#holdlist/' + date.format('YYYYMMDD') + '">Holdlist</a>'));

		var toolbar = $("<div/>").addClass("btn-toolbar").attr("role", "toolbar").html(`
			<div class="btn-group pull-right" role="group"><button id="ts-previous" type="button" class="btn btn-primary"><i class="fa fa-arrow-circle-left" aria-hidden="true"></i></button>
		    <button id="ts-filter" type="button" class="btn btn-primary" data-toggle="modal" data-target="#filter-modal"><i class="fa fa-filter" aria-hidden="true"></i></button>
		    <button id="ts-next" type="button" class="btn btn-primary"><i class="fa fa-arrow-circle-right" aria-hidden="true"></i></button></div>
		`);


		panel.append($("<div/>").addClass("panel-heading clearfix"));
		panel.find(".panel-heading").append(heading);
		panel.find(".panel-heading").append(toolbar);

		var yesterday = date.subtract(1,'day').format('YYYYMMDD');
		var tomorrow = date.add(2, 'day').format('YYYYMMDD');

		panel.append($("<div/>").addClass("panel-body").html("<h4>Stay tuned... Coming Soon</h4>"));

		// Lets display our beautiful list!
		$("#app").html($("<div/>").addClass("ts-fixed-col").html(panel));


		$('#ts-previous').on('click', function(event) {
  			event.preventDefault();
  			window.location.hash = "#signup/" + yesterday;
		});

		$('#ts-next').on('click', function(event) {
  			event.preventDefault();
  			window.location.hash = "#signup/" + tomorrow;
		});
	},	// dispSignup()

	dispPick: function(data){
		if (data.hasOwnProperty("data")){
			data = data.data;
		}

		if (data.hasOwnProperty("aaData")){
			data = data.aaData;
		}

		// We use the hash value to get the current date (or assume today)
		var listDateObj = this._toDateObject( window.location.hash.split("/")[1] );
		var listDate = moment(listDateObj);

		$(document).prop('title', 'AFD Webstaff | Picklist');

		var pickPanel = $("<div/>").addClass("panel panel-default ts-panel-picklist");


		var pickHeading = $("<span/>").addClass("pull-left");
		pickHeading.append($("<h4/>").addClass("panel-title " + 
								this._getShift(listDateObj) + 
								"-shift").html('Picklist for ' + listDate.format('dddd, MMMM Do, YYYY') ));
		pickHeading.append($("<small/>").html('<a href="#roster/' + listDate.format('YYYYMMDD') + '">Roster</a> | <a href="#signup/' + listDate.format('YYYYMMDD') + '">Signup</a> | <a href="#holdlist/' + listDate.format('YYYYMMDD') + '">Holdlist</a>' ));


		var pickToolbar = $("<div/>").addClass("btn-toolbar").attr("role", "toolbar").html(`
			<div class="btn-group pull-right" role="group"><button id="ts-pick-previous" type="button" class="btn btn-primary"><i class="fa fa-arrow-circle-left" aria-hidden="true"></i></button>
		    <button id="ts-pick-filter" type="button" class="btn btn-primary" data-toggle="modal" data-target="#filter-modal"><i class="fa fa-filter" aria-hidden="true"></i></button>
		    <button id="ts-pick-next" type="button" class="btn btn-primary"><i class="fa fa-arrow-circle-right" aria-hidden="true"></i></button></div>
		`);

		pickPanel.append($("<div/>").addClass("panel-heading clearfix"));
		pickPanel.find(".panel-heading").append(pickHeading);
		pickPanel.find(".panel-heading").append(pickToolbar);

		var yesterday = listDate.subtract(1,'day').format('YYYYMMDD');
		var tomorrow = listDate.add(2, 'day').format('YYYYMMDD');

		var pickTable = $("<table/>").addClass("table table-striped picklist");

		var pickBody = $('<tbody/>');

		// Loop over persons on picklist
		for ( var pdx = 0; pdx < data.length; pdx++ ){
			var dayKey = ',	SU Day';
			var nightKey = ',	SU Night';
			var opFact = data[pdx].opportunityFactors;

			opFact = opFact.replace(dayKey, ' <i class="fa fa-sun-o" aria-hidden="true"></i>');
			opFact = opFact.replace(nightKey, ' <i class="fa fa-moon-o" aria-hidden="true"></i>');
			opFact = opFact.replace(' 00:00:00', '');

			pickBody.append('<tr><td>' + data[pdx].rscName + '</td><td>' + opFact + '</td></tr>');
		}

		pickTable.append(pickBody);

		pickPanel.append($("<div/>").addClass("panel-body").html(pickTable));

		// Lets display our beautiful list!
		$("#app").html($("<div/>").addClass("ts-fixed-col").html(pickPanel));


		$('#ts-pick-previous').on('click', function(event) {
  			event.preventDefault();
  			window.location.hash = "#picklist/" + yesterday;
		});

		$('#ts-pick-next').on('click', function(event) {
  			event.preventDefault();
  			window.location.hash = "#picklist/" + tomorrow;
		});


	},	// dispPick()

	dispHold: function(data){
		if (data.hasOwnProperty("data")){
			data = data.data;
		}

		if (data.hasOwnProperty("aaData")){
			data = data.aaData;
		}

		// We use the hash value to get the current date (or assume today)
		var listDateObj = this._toDateObject( window.location.hash.split("/")[1] );
		var listDate = moment(listDateObj);

		$(document).prop('title', 'AFD Webstaff | Holdover list');

		var holdPanel = $("<div/>").addClass("panel panel-default ts-panel-picklist");


		var holdHeading = $("<span/>").addClass("pull-left");
		holdHeading.append($("<h4/>").addClass("panel-title " + 
								this._getShift(listDateObj) + 
								"-shift").html('Holdover list for ' + listDate.format('dddd, MMMM Do, YYYY') ));
		holdHeading.append($("<small/>").html('<a href="#roster/' + listDate.format('YYYYMMDD') + '">Roster</a> | <a href="#signup/' + listDate.format('YYYYMMDD') + '">Signup</a> | <a href="#picklist/' + listDate.format('YYYYMMDD') + '">Picklist</a>' ));


		var holdToolbar = $("<div/>").addClass("btn-toolbar").attr("role", "toolbar").html(`
			<div class="btn-group pull-right" role="group"><button id="ts-pick-previous" type="button" class="btn btn-primary"><i class="fa fa-arrow-circle-left" aria-hidden="true"></i></button>
		    <button id="ts-pick-filter" type="button" class="btn btn-primary" data-toggle="modal" data-target="#filter-modal"><i class="fa fa-filter" aria-hidden="true"></i></button>
		    <button id="ts-pick-next" type="button" class="btn btn-primary"><i class="fa fa-arrow-circle-right" aria-hidden="true"></i></button></div>
		`);

		holdPanel.append($("<div/>").addClass("panel-heading clearfix"));
		holdPanel.find(".panel-heading").append(holdHeading);
		holdPanel.find(".panel-heading").append(holdToolbar);

		var yesterday = listDate.subtract(1,'day').format('YYYYMMDD');
		var tomorrow = listDate.add(2, 'day').format('YYYYMMDD');

		var holdTable = $("<table/>").addClass("table table-striped picklist");

		var holdBody = $('<tbody/>');

		// Loop over persons on the hold list
		for ( var pdx = 0; pdx < data.length; pdx++ ){
			var dayKey = ',	SU Day';
			var nightKey = ',	SU Night';
			var opFact = data[pdx].opportunityFactors;

			opFact = opFact.replace(dayKey, ' <i class="fa fa-sun-o" aria-hidden="true"></i>');
			opFact = opFact.replace(nightKey, ' <i class="fa fa-moon-o" aria-hidden="true"></i>');
			opFact = opFact.replace(' 00:00:00', '');

			holdBody.append('<tr><td>' + data[pdx].rscName + '</td><td>' + opFact + '</td></tr>');
		}

		holdTable.append(holdBody);

		holdPanel.append($("<div/>").addClass("panel-body").html(holdTable));

		// Lets display our beautiful list!
		$("#app").html($("<div/>").addClass("ts-fixed-col").html(holdPanel));


		$('#ts-pick-previous').on('click', function(event) {
  			event.preventDefault();
  			window.location.hash = "#holdlist/" + yesterday;
		});

		$('#ts-pick-next').on('click', function(event) {
  			event.preventDefault();
  			window.location.hash = "#holdlist/" + tomorrow;
		});


	},	// dispHold()


	// Formats json responses for cal and dashboard
	// Updated on 12/4/2017 to provide support for the isRequest data field
	//		- Updated Icon's abbreviation to include an astrick in the title field
	//		- Update Event Name's to include an astrick for Request events
	dispCal: function(data, type){

		if (data.hasOwnProperty("data")){
			data = data.data;
		}

		type = type || data.type  || 'dashboard';
		type = type.charAt(0).toUpperCase() + type.slice(1);

		// Pre-calculate preivous and next month dates

		// We use the hash value to get the current date (or assume today)
		var calDateObj = this._toDateObject( window.location.hash.split("/")[1] );

		// Calculate the date for 30 days in the future (its good enough)
		var timeTravelDate = new Date();
  		timeTravelDate.setDate(calDateObj.getDate()+30);
		var nextMonth = this._toTelestaffString(timeTravelDate);


		// Calculate the date for 30 days in the past (its good enough)
		timeTravelDate = new Date(calDateObj);
		timeTravelDate.setDate(calDateObj.getDate() - 30);
		var previousMonth = this._toTelestaffString(timeTravelDate);

		$(document).prop('title', 'AFD Webstaff | ' + type);

		var calPanel = $("<div/>").addClass("panel panel-default ts-panel-" + type);

		var calPanelHeading = $("<div/>").addClass("panel-heading clearfix");


		if (type == "Calendar") {
			var calDateStr = this._toTelestaffString( calDateObj );
			var yearMonth = this._getMonthName( parseInt( calDateStr.slice(4,6) ) ) + "  " + calDateStr.slice(0,4);
			calPanelHeading.append( $("<h4/>").addClass("panel-title pull-left").html( data.owner + ": " + yearMonth ));
		} else {
			calPanelHeading.append( $("<h4/>").addClass("panel-title pull-left").html( type + ": " + data.daterange ));
		}

		var calToolbar = $("<div/>").addClass("btn-toolbar").attr("role", "toolbar").html(`
				<div class="btn-group pull-right" role="group"><button id="ts-cal-previous" type="button" class="btn btn-primary"><i class="fa fa-arrow-circle-left" aria-hidden="true"></i></button>
    <button id="ts-cal-filter" type="button" class="btn btn-primary" data-toggle="modal" data-target="#filter-modal"><i class="fa fa-filter" aria-hidden="true"></i></button>
    <button id="ts-cal-next" type="button" class="btn btn-primary"><i class="fa fa-arrow-circle-right" aria-hidden="true"></i></button></div>
			`);
		calPanelHeading.append( calToolbar );

		calPanel.append(calPanelHeading);

		var calBody = $("<div/>").addClass("panel-body");

		// Loop over days
		for ( var ddx = 0; ddx < data.days.length; ddx++ ){

			var dob = data.days[ddx];

			var rowDiv = $('<div/>').addClass('row date-row').addClass(dob.date);

			var thisDate = this._toDateObject( dob.date );

			rowDiv.html($('<div/>').addClass("date-box")
								   .html($('<a/>').attr('href', "#roster/" + dob.date)
								   				  .addClass('date roster')
								   				  .addClass(this._getShift(thisDate) + '-shift')
								   				  .text(this._formateDate(dob.date))));

			// loop over the day's events
			for ( var edx = 0; edx < dob.events.length; edx++ ){
				var eob = dob.events[edx];

				var eventInfo = $('<div/>').addClass("event-item");

				var eventTimes = '';

				if (eob.hasOwnProperty('time')){
					eventTimes = this._formateTimeRange(eob.time);
				}
				eventInfo.append($('<div/>').addClass("event-times").text(eventTimes));

				var eventIcon = $('<div/>').addClass("event-icon").html( "&nbsp;" );
				if (eob.hasOwnProperty('exception-code')){
					// eventInfo.append($('<div/>').addClass("event-icon").html($('<abbr/>').addClass(eob['exception-code']).attr('title', eob.name ).text(eob['exception-code'])));
					eventIcon.addClass("status");
					eventIcon.attr('style', eob.icon_style);

					//  Added on 12/4/2017 to handle pending requests 
					if (eob['isRequest']){
						eventIcon.html($('<abbr/>').addClass(eob['exception-code']).attr('title', '* ' + eob.name ).text(eob['exception-code']));
					} else {
						eventIcon.html($('<abbr/>').addClass(eob['exception-code']).attr('title', eob.name ).text(eob['exception-code']));
					}
				} else if (eob.type == "flsaDay"){
					eventIcon.html($('<i/>').addClass("fa fa-hourglass-end fa-fw ts-flsa").attr("aria-hidden", "true"));
				} else if (eob.type == "holiday"){
					eventIcon.html($('<i/>').addClass("fa fa-star fa-fw ts-holiday")
										 .addClass(this._getShift(thisDate) + '-shift')
										 .attr("aria-hidden", "true"));
				} else if (eob.type == "payDay"){
					eventIcon.html( $('<i/>').addClass("fa fa-money fa-fw ts-payday").attr("aria-hidden", "true") );
				}
				eventInfo.append(eventIcon);

				if (eob.hasOwnProperty('location')){
					eventInfo.append($('<div/>').addClass('event-location').text(eob.location));
				} else {
					// Added isRequest handleing functionality on 12/4/2017
					if (eob['isRequest']) { 
						eventInfo.append($('<div/>').addClass('event-name').html('<i class="fa fa-fw fa-asterisk" aria-hidden="true"></i> ' + eob.name));
					} else {
						eventInfo.append($('<div/>').addClass('event-name').text(eob.name));
					}
				}

				rowDiv.append(eventInfo);

			}		// events

			calBody.append(rowDiv);


		}	// days
		calPanel.append(calBody);

		$("#app").html($("<div/>").addClass("ts-fixed-col").html(calPanel));


		$('#ts-cal-previous').on('click', function(event) {
  			event.preventDefault();
  			window.location.hash = "#calendar/" + previousMonth;
		});

		$('#ts-cal-next').on('click', function(event) {
  			event.preventDefault();
  			window.location.hash = "#calendar/" + nextMonth;
		});


		var filterWindow = $("<div/>").attr("id", "filter-modal")
									  .addClass("modal fade")
				   					  .attr("role", "dialog");

		var filterContent = $("<div/>").addClass("modal-content");

		filterContent.append($("<div/>").addClass("modal-header ts-modal-header")
										.append(`<button type="button" class="close" data-dismiss="modal">&times;</button><h4 class="modal-title"> Calendar Filter </h4>`));

		filterContent.append($("<div/>").addClass("modal-body")
										.append(` 
											<div class="row ts-filter-opt">
												<div class="event-item">
													<div class="event-times"><input type="checkbox" value=""></div>
													<div class="event-icon"><i class="fa fa-star fa-fw ts-holiday a-shift" aria-hidden="true"></i></div>
													<div class="event-name">holiday</div>
												</div>
												<div class="event-item">
													<div class="event-times"><input type="checkbox" value=""></div>
													<div class="event-icon"><i class="fa fa-money fa-fw ts-payday" aria-hidden="true"></i></div>
													<div class="event-name">Pay Day</div>
												</div>
												<div class="event-item">
													<div class="event-times"><input type="checkbox" value=""></div>
													<div class="event-icon"><i class="fa fa-hourglass-end fa-fw ts-flsa" aria-hidden="true"></i></div>
													<div class="event-name">FLSA Period End</div>
												</div>
											</div>


										`));

		filterContent.append($("<div/>").addClass("modal-footer")
										.append(`<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>`));

		filterContent = $("<div/>").addClass( "modal-dialog" ).append( filterContent );
		filterWindow.append( filterContent );

		$("body").append(filterWindow);
	},
/* **********************************************   dispRoster   ********************************************** */
	dispRoster: function(data){ 

		// Check to see if the data is inside the data... if so take it out
		if (data.hasOwnProperty('data')){ data = data.data; }

		// Get the roster date from the data
		var rosterDateSrc = data.Date[0].title;
		var rosterDateObj = this._parseFullDate(rosterDateSrc);
		var timeTravelDate = new Date(rosterDateObj);
  		timeTravelDate.setDate(rosterDateObj.getDate()+1);

		var rosterTomorrowDate = this._toTelestaffString(timeTravelDate);

		timeTravelDate.setDate(rosterDateObj.getDate()-1);
		var rosterYesterdayDate = this._toTelestaffString(timeTravelDate);


		var rosterTitle = rosterDateSrc.replace(/\(.*$/, '').trim();
		var rosterSubTitle = rosterDateSrc.replace(/^[^\(]*|[()]/g, '').trim() || '';
		// var rosterDateTs = this._toTelestaffString(rosterDateObj);

		// For efficiency we will ignore everything down to the batallion level
		data = data.Date[0].Institution[0].Agency[0].Batallion;

		$(document).prop('title', 'AFD Webstaff | Roster ');
		$('#app').html($('<div/>').addClass('container ts-roster'));

		// var rosterControls = $("<div/>").addClass("row ts-roster-controls");

		// rosterControls.append(
		// 	$("<div/>").addClass("col-sm-6 col-sm-push-3 rs-roster-title " + this._getShift(rosterDateObj) + "-shift " + this._toTelestaffString(rosterDateObj)).html("<h4> " + rosterTitle + "</h4><small>" + rosterSubTitle + "</small>" )
		// );


		//rosterControls.append(
		var rostertoolbar = $("<div/>").addClass("btn-toolbar").attr("role", "toolbar").html(`
				<div class="btn-group pull-right" role="group"><button id="ts-roster-previous" type="button" class="btn btn-primary"><i class="fa fa-arrow-circle-left" aria-hidden="true"></i></button>
    <button id="ts-roster-filter" type="button" class="btn btn-primary"><i class="fa fa-filter" aria-hidden="true"></i></button>
    <button id="ts-roster-next" type="button" class="btn btn-primary"><i class="fa fa-arrow-circle-right" aria-hidden="true"></i></button></div>
			`); //);

		// rosterControls.append($("<div/>").addClass("col-sm-3 hidden-sm"));

		// $("div.ts-roster").html(rosterControls);

		var rosterData = $("<div/>");
		rosterData.addClass("ts-roster-data panel panel-default");
		rosterData.addClass(this._toTelestaffString(rosterDateObj));

//this._getShift(rosterDateObj) + "-shift " + this._toTelestaffString(rosterDateObj)).html("<h4> " + rosterTitle + "</h4><small>" + rosterSubTitle + "</small>" )


		var rosterHeading = $("<span/>").addClass("pull-left");
		rosterHeading.append($("<h4/>").addClass("panel-title " + 
								this._getShift(rosterDateObj) + 
								"-shift").html('Roster for ' + rosterTitle ));
		rosterHeading.append($("<small/>").addClass("sub-title").html(rosterSubTitle));
		rosterHeading.find(".sub-title").append((' <a href="#picklist/' + this._toTelestaffString(rosterDateObj) + '">Picklist</a> | <a href="#signup/' + this._toTelestaffString(rosterDateObj) + '">Signup</a> | <a href="#holdlist/' + this._toTelestaffString(rosterDateObj) + '">Holdlist</a>'));


		//var rosterHeading = " <strong class='" + > " + + " </strong>   <small>" + rosterSubTitle + "</small>";
		rosterData.append($("<div/>").addClass("panel-heading clearfix"));
		rosterData.find(".panel-heading").append(rosterHeading);
		rosterData.find(".panel-heading").append(rostertoolbar);

		var rosterBody = $("<div/>").addClass("roster-body panel-body");


		// Loop over batallions
		for ( var bdx = 0; bdx < data.length; bdx++ ){
			var bod = data[bdx];

			// Loop Over Shifts
			for (var shiftDx = 0; shiftDx < bod.Shift.length; shiftDx++) {
				var shiftObj = bod.Shift[shiftDx];

				var batClass = "bat-" + this._mapBatallion(bod.title);

				var batRow = $("<div/>").addClass("row ts-bat");
				batRow.addClass(batClass);

				batRow.append(" <strong> " + bod.title + " </strong>   (" + shiftObj.title + ") ");
				if (shiftObj.Station.length == 1){
					batRow.append(" <i> " + shiftObj.Station[0].title + " </i> ");
				}
				rosterBody.append(batRow);

				// Loop over stations
				for (var sdx = 0; sdx < shiftObj.Station.length; sdx++){
					var sob = shiftObj.Station[sdx];
					var staClass = this._classifyStr(sob.title);
					if (shiftObj.Station.length > 1){
						var stationRow = $("<div/>").addClass("row");
						stationRow.addClass("ts-station-row text-xs-center bg-info");
						stationRow.addClass(staClass);
						stationRow.addClass(batClass);
						if (sob.notes){
							stationRow.append($("<div/>").addClass("col-sm-12").append($("<strong/>").text( sob.title )).append(" {" + sob.notes + "}"));
						} else {
							stationRow.append($("<div/>").addClass("col-sm-12").append($("<strong/>").text( sob.title )));
						}
						
						rosterBody.append(stationRow);
					}

					// Loop over units
					for (var udx = 0; udx < sob.Unit.length; udx++){
						var uob = sob.Unit[udx];
						var unitClass =  this._classifyStr(uob.title);
						var unitRow = $("<div/>").addClass("row");
						unitRow.addClass("ts-unit-row text-xs-center bg-info");
						unitRow.addClass(batClass);
						unitRow.addClass(staClass);
						unitRow.addClass(unitClass);
						if (uob.notes){
							unitRow.append($("<div/>").addClass("col-sm-12").append( uob.title ).append("<span class='notes'> {" + uob.notes + "}</span>"));
						} else {
							unitRow.append($("<div/>").addClass("col-sm-12").text( uob.title ));
						}

						rosterBody.append(unitRow);

						// Loop over positions
						for (var pdx = 0; pdx < uob.Position.length; pdx++){
							var pob = uob.Position[pdx];
							var posClass = this._classifyStr(pob.title);
							var positionRow = $("<div/>").addClass("row ts-position-row");
							positionRow.addClass(batClass);
							positionRow.addClass(staClass);
							positionRow.addClass(unitClass);
							positionRow.addClass(posClass);
							if (( pob.isVacant )&&(!pob.isSurrpressed)){
								positionRow.addClass('isVacant');
							}
							var nameParts = this._parseNameCaps(pob.name);

							// Check to see if this is a filled spot
							if ((pob.title === '') && (nameParts[0] === '')) { continue;}
							positionRow.append($("<div/>").addClass("ts-left-padding hidden-xs").text(''));
							positionRow.append($("<div/>").addClass("ts-position-title").text( pob.title ));
							positionRow.append($("<div/>").addClass("ts-person-name").text( nameParts[0] ));
							if ( nameParts[1] ) {
								positionRow.find(".ts-person-name").append($("<span/>").addClass("hidden-xs")
																 					   .text(" (" + nameParts[1] + ")"));
							}

							if ( pob.specialties ){
								positionRow.find(".ts-person-name").attr("title", pob.specialties)
																   .attr("data-toggle", "tooltip")
																   .attr("data-placement", "top");
							}

							// positionRow.append($("<div/>").addClass("ts-col-2 hidden-xs ts-person-capabilities").text( nameParts[1] ));

							var workcode = $("<div/>").addClass("ts-workcode");
							// Added trim to the following line on 2018/03/2018 to deal with empty expection codes ' '
							if ( pob.exceptioncode.trim() !== ''){
								var workcode_title = '';
								var workcode_html = '';
								if ( pob.isRequest ){
									workcode_title = "*pending* ";
									workcode_html = '<i class="fa fa-asterisk" aria-hidden="true"></i> ';

								}
								workcode.attr('title', workcode_title + pob.workcode);
								workcode.attr("data-toggle", "tooltip");
								workcode.attr("data-placement", "top");
								// Added style attribute on 2018/03/12
								workcode.html($("<span/>").addClass("workcode")
														  .html(workcode_html + pob.exceptioncode)
															.attr('style', pob.workcode_style)
														  // .attr('style', pob.workcode_style)
											);
							}

							positionRow.append(workcode);

							var timeText = this._parseShiftTimes(pob.startTime) + " - " + this._parseShiftTimes(pob.endTime); 

							if ( timeText == "07:00 - 07:00" ){
								timeText = "All Day";
							}

							positionRow.append($("<div/>").addClass("ts-col-3 ts-hours").html($("<div/>").addClass("hours").text(timeText)));

							rosterBody.append(positionRow);


						}	// Positions
					}	// Units
				}	// Stations
			}	// Shifts
		}	// Batallions
		rosterData.append(rosterBody);

		$("div.ts-roster").append(rosterData);
		$('#ts-roster-previous').on('click', function(event) {
  			event.preventDefault();
  			window.location.hash = "#roster/" + rosterYesterdayDate;
		});

		$('#ts-roster-next').on('click', function(event) {
  			event.preventDefault();
  			window.location.hash = "#roster/" + rosterTomorrowDate;
		});
		// $('[data-toggle="tooltip"]').tooltip(); 
		$('[data-toggle="tooltip"]').tooltip({
   			container: 'body'
		});
	}
};