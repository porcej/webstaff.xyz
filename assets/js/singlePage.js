
/***

jQuery singlePage

An lite-weight single page applicaton framework
Copyright 2017 Joseph Porcelli
0.0.2

***/

(function ($) {
    "use strict";
    var actionsMap = {};
    var settings = {
        spinnerClass: "loading",
        modalSpinnerClass: "modal-loading",
        homeRoute: "home",
        errorHandler: function(route){
            console.log(route + " not found.");
        }
    };

    /* =========================================================================
    
    singlePage - Default constructor, adds loading spinner to page and registers
        router.  Return this

    ========================================================================= */
    function singlePage(actions){
        if ( typeof actions === "object" ){
            registerActions(actions);
        }
        createLoader();
        window.addEventListener( "hashchange", function(){ router(); } );
        router();
        return this;

    }   // singlePage()


    /* =========================================================================
    
    router: handles routing:
        Gets route as passed to route, or looks for location.hash
        otherwise ignores routing

        Routing Requirments is run prior to routing, if routing requirments
        returns false, routing is not performed

    ========================================================================= */
    function router(route, routingRequirments){
        // Get route (passed), or form the page's hash. otherwise we 
        //  dehas or use default
        // We use the slice(1) for the has to remove the '#'
        route = route || location.hash.slice(1) || '';

        // Close nav bar
        $("#tsNavbar").collapse('hide');

        if ( $.isFunction( routingRequirments )){
            if ( !routingRequirments( route ) ){
                return false;
            }
        }

        // Remove leading and trailing slashes
        route = route.replace(/^\/|\/$/, '');

        if (route === '') {
            route = settings.homeRoute;
            // return false;
        }

        if (route === 'login') {
            route = settings.homeRoute;
            return false;
        }

        if (route == 'ignore'){
            return false;
        }

        var steps = route.split('/');
        var action = steps[0] || false;

        // Sanity check here.  This `should` always be true...
        if( action ){
            showLoader();
            if (( actionsMap.hasOwnProperty( action ) ) && 
                ( $.isFunction( actionsMap[ action ] ))){
                    actionsMap[ action ]( route );
                    return true;
            } else {
                settings.errorHandler.call(route);
                $.singlePage.hideLoader();
            }
        } else {
            settings.errorHandler.call(route);
            $.singlePage.hideLoader();
        }
    }   // router()


    /* =========================================================================
    
    registerErrorHandler: What to do if router cant find route.

    ========================================================================= */
    function registerErrorHandler( action ){

        if ( $.isFunction( action ) ){
            settings.errorHandler = action;
        }
    }   // registerErrorHandler()


    /* =========================================================================
    
    registerActtion: takes trigger, a string representing an action path
    and action, a function representing the action to comense.

    ========================================================================= */
    function registerAction( trigger, action ){
        trigger =  trigger || '';
        if (( trigger !== '' ) && ( $.isFunction( action ))){
            actionsMap[ trigger ] = action;
        }
    }   // registerAction()

    /* =========================================================================
    
    registerActtions: takes an object maping action paths to routing. 

    ========================================================================= */
    function registerActions( actions ){
        if ( typeof actions === "object" ){
            $.extend(actionsMap, actions);
        }
    }   // registerActions()

    /* =========================================================================
    
    createLoader - Adds the html to support loader to end of html

    ========================================================================= */
    function createLoader(){
        // Check if the spinner exists
        if ( $("body div." + settings.modalSpinnerClass).length === 0) {
            $("body").append(
                $("<div/>").addClass(settings.modalSpinnerClass).html(
                    "<i class='fa fa-spinner fa-pulse fa-3x fa-fw ltblue'>" + 
                    "</i><span class='sr-only'>Loading...</span>"

            ));
        }

        // Add loader to listen for any anchor clicks
        $("a[href]").click(function(event){

            if ($(this).attr("href") == window.location.hash) {
                 event.originalEvent.currentTarget.href = $(this).attr("href") + "/";
            }
        });

        // If an <a> does not have an href, give it #ignore
        $("a:not([href])").attr("href", "#ignore");
    }   // createLoader()


    /* =========================================================================
    
    showLoader - shows spinning loader icon

    ========================================================================= */
    function showLoader(){
        $("body").addClass(settings.spinnerClass);
    }   // showLoader()

    /* =========================================================================
    
    hideLoader - hides spinning Loader Icon. 

    ========================================================================= */
    function hideLoader(){
        $("body").removeClass(settings.spinnerClass);
    }   // hideLoader()

    /* =========================================================================
    
    doNav- Navigates to action

    ========================================================================= */
    function doNav(action){
        action = action || '';
        window.location.hash = "#" + action;
        return this;
    }   //doNav()


    $.singlePage = singlePage;
    $.singlePage.registerAction = registerAction;
    $.singlePage.registerActions = registerActions;
    $.singlePage.registerErrorHandler = registerErrorHandler;
    $.singlePage.router = router;
    $.singlePage.showLoader = showLoader;
    $.singlePage.hideLoader = hideLoader;
    $.singlePage.doNav = doNav;

})(jQuery);