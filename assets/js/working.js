
/***

Telestaff Web Inerfaces
Copyright 2017 Joseph Porcelli
0.0.1

***/



(function ($, telestaffViews) {
"use strict";

function telestaff(){

	// Returns the keys from an object
	this._getKeys = function(obj){
		var keys = [];
		for(var key in obj){
			if (obj.hasOwnProperty(key)){
				keys.push(key);
			}
		}
		return keys;
	};

	// Checks to see if local || or session storage is available


	// Checks to see if local storage is available
	this._hasLocalStorage = function(){
	    var ls = 'ls';
	    try {
	        localStorage.setItem(ls, ls);
	        localStorage.removeItem(ls);
	        return true;
	    } catch(e) {
	        return false;
	    }
	};

	// Checks to see if session storage is available
	this._hasSessionStorage = function (){
	    var ls = 'ls';
	    try {
	        sessionStorage.setItem(ls, ls);
	        sessionStorage.removeItem(ls);
	        return true;
	    } catch(e) {
	        return false;
	    }
	};

	this._localStorage = this._hasLocalStorage();
	this._sessionStorage = this._hasLocalStorage();
	this._storeMethod = false;
	this._creds = {
		duser: '',
		dpass: '',
		username: '',
		password: ''
	};

	this.loadCreds();

	if ( this.hasCreds() ){
		$("nav").removeClass("app-not-auth");
	}

 	this._dataUrl = 'https://data.webstaff.xyz/';
//	this._dataUrl = 'https://dev.webstaff.xyz/';

	this._defaultRoute = "dashboard";

	this._templates = {
		welcome: function(data){
			return `<div class="jumbotron">
  <div class="container">
    <h1><i class="fa fa-phone-square ltblue" aria-hidden="true"></i> AFD Webstaff</h1>
    <p class="lead">Mobile interface for AFD's Workforce Telestaff <em><a href="https://telestaff.alexandriava.gov">telestaff.alexandriava.gov</a></em>.</p>
  </div>
</div>`;
		},
		
		// Login form tempalte
		login_form: function(data){
			return `<form action="#" method="post" class="form-signin">

  <!-- Domain Logon -->
  <fieldset class="row mb-3">
    <legend class="col-form-label col-sm-1 pt-0 align-middle col-form-label-lg"><i class="fa fa-windows fa-fw ltblue" aria-hidden="true"></i></legend>
    <div class="col-sm-11">
      <div class="input-group mb-0">
        <span class="input-group-text" id="basic-addon-windows-username"><i class="fa fa-user fa-fw ltblue" aria-hidden="true"></i></span>
        <input 
          class="form-control"
          type="text" 
          data-lpignore="true" 
          id="duser" 
          name="duser" 
          tabindex="1" 
          class="form-control" 
          placeholder="Windows username" 
          aria-label="Windows username" 
          aria-describedby="basic-addon-windows-username" 
          required 
          autofocus
          >

      <div class="input-group mb-0">
        <span class="input-group-text" id="basic-addon-windows-password"><i class="fa fa-key fa-fw ltblue" aria-hidden="true"></i></span>
        <input class="form-control" type="password" data-lpignore="true" id="dpass" name="dpass" tabindex="2" placeholder="Windows password" aria-label="Windows password" aria-describedby="basic-addon-windows-password" required>
        </div>
      </div>
    </div>
  </fieldset>

  <!-- Telestaff Logon -->
  <fieldset class="row mb-3">
    <legend class="col-form-label col-sm-1 pt-0 align-middle col-form-label-lg"><i class="fa fa-phone fa-fw ltblue" aria-hidden="true"></i></legend>
    <div class="col-sm-11">
      <div class="input-group mb-0">
        <span class="input-group-text" id="basic-addon-username"><i class="fa fa-user fa-fw ltblue" aria-hidden="true"></i></span>
        <input 
          class="form-control"
          type="text" 
          data-lpignore="true" 
          id="username" 
          name="username" 
          tabindex="3" 
          class="form-control" 
          placeholder="Badge number" 
          aria-label="Badge number" 
          aria-describedby="basic-addon-username" 
          required 
          autofocus
          >

      <div class="input-group mb-0">
        <span class="input-group-text" id="basic-addon-password"><i class="fa fa-key fa-fw ltblue" aria-hidden="true"></i></span>
        <input class="form-control" type="password" data-lpignore="true" id="password" name="password" tabindex="4" placeholder="Telestaff password" aria-label="Telestaff password" aria-describedby="basic-addon-password" required>
        </div>
      </div>
    </div>
  </fieldset>

 <!-- Save -->
  <fieldset class="row mb-3">
    <legend class="col-form-label col-sm-1 pt-0 align-middle col-form-label-lg"> </legend>
    <div class="col-sm-11">
      <input class="form-check-input" type="checkbox" value="remember-me" id="rememberMe" tabindex="5" name="rememberMe" checked Disabled>
      <label class="form-check-label" for="rememberMe">  Keep me signed-in </label>
    </div>
  </fieldset>

  <!-- submit button -->
  <div class="row d-grid">
    <button class="btn btn-lg btn-primary" tabindex="6" type="submit">Login</button>  
  </div>
</form>`;

		}
	};	


// ===========================================================================================================
	




// ===========================================================================================================


}

telestaff.prototype = {
	/***** 	Handle the credentials	*****/

	// Sets credential, key, to value, val
	//	if key is not a credential, does nothing
	setCred: function(key, val){
		if (this._creds.hasOwnProperty(key)){
			this._creds[key] = val;
		}
	},

	// returns credential, key, or null if key is not a credential
	getCred: function(key){
		if (this._creds.hasOwnProperty(key)){
			return this._creds[key];
		}
		return null;
	},

	// Returns true if credential, key, exists, is defined, and
	// is not null or ''. returns false otherwise
	hasCred: function(key){
		return (this._creds.hasOwnProperty(key) && (this._creds[key] !== null) && (this._creds[key]));
	},

	// Returns true if all creads exists
	hasCreds: function(){
		var allCreds = true;
		var credKeys = this._getKeys(this._creds);
		for (var kdx in credKeys){
			if (credKeys.hasOwnProperty(kdx)){
				var key = credKeys[kdx];
				allCreds = (this._creds.hasOwnProperty(key) && (this._creds[key] !== null) && (this._creds[key]) && allCreds);
			}
		}
		return allCreds;
	},

	// Returns a list of credientials
	listCreds: function(){
		return this._getKeys(this._creds);
	},

	// loads all credentials from local storage
	loadCreds: function(){
		if (this._localStorage) {
			var credKeys = this._getKeys(this._creds);
			for (var kdx in credKeys){
				if (credKeys.hasOwnProperty(kdx)){
					var key = credKeys[kdx];
					if (localStorage.getItem(key) !== null) {
						this._creds[key] = localStorage.getItem(key);
					}
				}
			}
		}
	},

	// Load single credential, key, from localstorage
	loadCred: function(key){
		if (this._creds.hasOwnProperty(key)){
			if (this._localStorage){
				if (localStorage.getItem(key) !== null) {
					this._creds[key] = localStorage.getItem(key);
				}
			}
		}
	},

	// Stores all credentials
	storeCreds: function(){
		if (this._localStorage) {
			var credKeys = this._getKeys(this._creds);
			for (var kdx in credKeys){
				if (credKeys.hasOwnProperty(kdx)){
					var key = credKeys[kdx];
					localStorage.setItem(key, this._creds[key]);
				}
			}
		}
	},

	// stores single credential, key, with localstorage
	storeCred: function(key){
		if (this._creds.hasOwnProperty(key)){
			if (this._localStorage){
				localStorage.setItem(key, this._creds[key]);
			}
		}
	},

	// Clears local storages of credentials
	removeCreds: function(){
		if (this._localStorage) {
			var credKeys = this._getKeys(this._creds);
			for (var kdx in credKeys){
				if (credKeys.hasOwnProperty(kdx)){
					var key = credKeys[kdx];
					localStorage.removeItem(key);
				}
			}
		}
	},

	// Sets credentials from values in form
	setCredsFromForm: function(){
		var credKeys = this._getKeys(this._creds);
		for (var kdx in credKeys){
			if (credKeys.hasOwnProperty(kdx)){
				var key = credKeys[kdx];
				this._creds[key] = $("#" + key).val();
			}
		}
	},

	// Loads credentials to form
	loadCredsToForm: function(){
		if ( this.hasCreds() ){
			var credKeys = this._getKeys(this._creds);
			for (var kdx in credKeys){
				if (credKeys.hasOwnProperty(kdx)){
					var key = credKeys[kdx];
					$("#" + key).val( this._creds[key] );
				}
			}
			$('#rememberMe').prop('checked', true);
		}

	},	// loadCredsToForm()

	// Activate navigation menu
	doNav: function(target){
		target = target || '';

		if (target !== ''){
			$('ul.navbar').find('.active').removeClass('active');
			$('ul.navbar-nav > li > ' + target).addClass('active');
		}

		// $('button.navbar-toggle').addClass('collapsed');
		// $('button.navbar-toggle').attr('aria-expanded', 'false');

	},	// doNav()

	// Display error content
	error: function(status, text, msg){
		status = status || '';
		text = text || '';
		msg = msg || '';

		var error_block = $("<div/>").addClass("alert alert-danger auth-alert").attr("role", "alert");
		
		if (status == "403"){
			error_block.text("Wrong username and/or password.");
		} else if (status == "401") {
			error_block.text("Invalid domain credentials.");	
		} else {
			var generic_error = "<p><strong>Oh snap!</strong> You should not be here.";
			generic_error +=  'Run away and let <a href="mailto:webmaster@webstaff.xyz" class="alert-link">webmaster@webstaff.xyz</a> know you were here.';
			generic_error += 'Tell them that <strong>Error' + status + ' </strong> sent you to them.</p>';
			if (text !== ''){ 
				generic_error += '<p>'+text+'</p>';
			}
			if (msg !== ''){
				generic_error += '<p>'+msg+'</p>';
			}
			error_block.html(generic_error);
		}
		return error_block;
	},

	// Displays logon form
	showLogin: function(err){
		err = err || {};
		$(".auth-alert").remove();

		$("nav").addClass("app-not-auth");
		$("#msg").html(this._templates.welcome());
		$("#app").html(this._templates.login_form());


		if ( err.hasOwnProperty('status')){
			$('#msg').append(this.error(err.status));
		}

		// Check if this browser supports local/session storage
		if (( !this._localStorage ) && ( !this._sessionStorage )){
			var errorBlock = $("<div/>").addClass("alert alert-danger auth-alert").attr("role", "alert");
			errorBlock.html("<p>I'm terribly sorry but you are not using a compatable browser.  Please upgrade to a modern web browser that supports local storage.</p>");
			$('#msg').append( errorBlock );
		} else {

			if ( sessionStorage.getItem("auth-error") !== null ){
				$('#msg').append(this.error(sessionStorage.getItem("auth-error")));
				sessionStorage.removeItem("auth-error");
			} 

			var _this = this;

			this.loadCredsToForm();

			$(".form-signin").submit(function(event){
				event.preventDefault();
				_this.setCredsFromForm();
				if ($('#rememberMe').is(":checked")){
					_this.storeCreds();
				} else {
					_this.removeCreds();
				}
				$.singlePage.doNav("dashboard");

			});

		}
		$.singlePage.hideLoader();
	},

	// Handle logout
	doLogout: function(){
		this._creds = {};
		this.removeCreds();
		window.location = window.location.href.split('#')[0];
		// $.singlePage.doNav('');
	},

	// Fetch data from data.webstaff.xyz
	request: function(path, date){
		// If path is provided we can check the location hash
		path = path || location.hash.slice(1) || '';
		// params = params || {};
		date = date || '';



		if (!this.hasCreds()){
			$.singlePage.doNav("");
		} else {
			var action = '';

			// Remove leading and trailing slahes
			path = path.replace(/^\/|\/$/, '');

			// No path, why are we here?
			if (path === ''){
				return false;

			// Just a path, no date
			} else if ( path.indexOf('/') >= 0 ){
				action = path;

			// Path and a date... yay
			} else {
				var steps = path.split('/');
				action = steps[0];
				date = steps[1] || date;
			}

			var _this = this;

			var view = new telestaffViews();

			if ( action.startsWith("signup")){
				view.dispSignup('hello');
				$.singlePage.hideLoader();
				return false;
			}

			$.ajax({
				type : 'POST',
				url  : _this._dataUrl + action + '/' + date,
				data : _this._creds,
				dataType : 'json',
				success: function(json, textStatus, request){
					if (json.status_code.toString() == '200' ){
						var action = json.data.type;
						if ($.inArray(action, ['dashboard', 'calendar', 'roster', 'picklist']>-1)){
							$("#msg").html('');
							$("nav").removeClass("app-not-auth");
							if (action == "roster"){
								view.dispRoster(json);
							} else if (action == "signup"){
								view.dispSignup(json);
							} else if (action == "picklist") {
								view.dispPick(json);
							} else if (action == "holdlist") {
								view.dispHold(json);
							} else {
								view.dispCal(json, action);
							}
							$.singlePage.hideLoader();

							return true;
						} else {
							sessionStorage.setItem("auth-error", json.data.info);
							$.singlePage.doNav("");
						}
					}
					sessionStorage.setItem("auth-error", json.status_code);
					$.singlePage.doNav("");
					return false;
				},
				error: function(xhr, ajaxOpts, thrownError){
					sessionStorage.setItem("auth-error", xhr.status);
					_this.showLogin({status: xhr.status});
					return false;
				}
			});
		}
	}
};

$(function () {
	var ts = new telestaff();
	console.log('webstaff.xyz loaded at ' + Date.now());

	var routes = {
		home: function(route){
			$.singlePage.showLoader();
			ts.showLogin();
		},
		login: function(route){
			ts.showLogin();
		},
		dashboard: function(route){
			$.singlePage.showLoader();
			ts.doNav('nav-dashboard');
			ts.request();
		},
		roster: function(route){
			$.singlePage.showLoader();
			ts.doNav('nav-roster');
			ts.request();
		},
		calendar: function(route){
			$.singlePage.showLoader();
			ts.doNav('nav-calendar');
			ts.request();
		},
		picklist: function(route){
			$.singlePage.showLoader();
			ts.doNav('nav-picklist');
			ts.request();
		},
		holdlist: function(route){
			$.singlePage.showLoader();
			ts.doNav('nav-holdlist');
			ts.request();
		},
		signup: function(route){
			$.singlePage.showLoader();
			ts.doNav('nav-signup');
			ts.request();
		},
		logout: function(route){
			$.singlePage.showLoader();
			ts.doLogout();
		},
		test: function(route){
			console.log("The route is: " + route);
		}

	};

	$.singlePage(routes);
	var views = new telestaffViews();
	$.singlePage.registerErrorHandler( views.dispError );

	// Set default datepicker values and click functions
	var today = new Date();


	$("#ts-month-input").prop("defaultValue", views._toMonthString( today ) );
	$("#ts-r-date-input").prop("defaultValue", views._toDateString( today ) );
	$("#ts-pl-date-input").prop("defaultValue", views._toDateString( today ) );

	$("#ts-calendar-go").on('click', function(e){
		e.preventDefault;

		var year = '';
		var month = '';

		[year, month] = $("#ts-month-input").val().split('-');

		var selectedDate = new Date();
		selectedDate.setFullYear( parseInt(year) );
		selectedDate.setMonth( parseInt(month) - 1 );

		$.singlePage.doNav( "calendar/" + views._toTelestaffString( selectedDate ) );
	});

	$("#ts-roster-go").on('click', function(e){
		e.preventDefault;

		var year = '';
		var month = '';
		var day = '';

		[year, month, day] = $("#ts-r-date-input").val().split('-');

		var selectedDate = new Date();
		selectedDate.setFullYear( parseInt(year) );
		selectedDate.setMonth( parseInt(month) - 1 );
		selectedDate.setDate( parseInt( day ) );

		$.singlePage.doNav( "roster/" + views._toTelestaffString( selectedDate ) );
	});


	$("#ts-picklist-go").on('click', function(e){
		e.preventDefault;

		var year = '';
		var month = '';
		var day = '';

		[year, month, day] = $("#ts-pl-date-input").val().split('-');

		var selectedDate = new Date();
		selectedDate.setFullYear( parseInt(year) );
		selectedDate.setMonth( parseInt(month) - 1 );
		selectedDate.setDate( parseInt( day ) );

		$.singlePage.doNav( "picklist/" + views._toTelestaffString( selectedDate ) );
	});

	$("#ts-holdlist-go").on('click', function(e){
		e.preventDefault;

		var year = '';
		var month = '';
		var day = '';

		[year, month, day] = $("#ts-hl-date-input").val().split('-');

		var selectedDate = new Date();
		selectedDate.setFullYear( parseInt(year) );
		selectedDate.setMonth( parseInt(month) - 1 );
		selectedDate.setDate( parseInt( day ) );

		$.singlePage.doNav( "picklist/" + views._toTelestaffString( selectedDate ) );
	});

	$("#ts-signup-go").on('click', function(e){
		e.preventDefault;

		var year = '';
		var month = '';
		var day = '';

		[year, month, day] = $("#ts-su-date-input").val().split('-');

		var selectedDate = new Date();
		selectedDate.setFullYear( parseInt(year) );
		selectedDate.setMonth( parseInt(month) - 1 );
		selectedDate.setDate( parseInt( day ) );

		$.singlePage.doNav( "signup/" + views._toTelestaffString( selectedDate ) );
	});


	// END

});

}(jQuery, telestaffViews));

