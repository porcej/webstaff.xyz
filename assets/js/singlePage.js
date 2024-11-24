
/***

jQuery singlePage

An lite-weight single page applicaton framework
Copyright 2017 Joseph Porcelli
0.0.2

***/

(function ($) {
    "use strict";
    const actionsMap = {};
    const settings = {
        spinnerClass: "loading",
        modalSpinnerClass: "modal-loading",
        homeRoute: "home",
        errorHandler: (route) => {
            console.error(`${route} not found.`);
        },
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

        Routing Requirements is run prior to routing, if routing requirements
        returns false, routing is not performed

    ========================================================================= */
    function router(route = location.hash.slice(1) || '', routingRequirements) {

        // Close nav bar
        // $("#tsNavbar").collapse('hide');

        if (typeof routingRequirements === "function" && !routingRequirements(route)) {
            return false;
        }

        // Remove leading and trailing slashes
        route = route.replace(/^\/|\/$/, '');

        if (["", "login"].includes(route)) {
            route = settings.homeRoute;
            if (route === "login") return false;
        }

        if (route === "ignore") return false;

        var steps = route.split('/');
        var action = steps[0] || false;

        // Sanity check here.  This `should` always be true...
        if (action) {
            showLoader();
            if (actionsMap[action] && typeof actionsMap[action] === "function") {
                actionsMap[action](route);
            } else {
                settings.errorHandler(route);
                hideLoader();
            }
        } else {
            settings.errorHandler(route);
            hideLoader();
        }
    }   // router()


    /* =========================================================================
    
    registerErrorHandler: What to do if router cant find route.

    ========================================================================= */
    function registerErrorHandler(action) {
        if (typeof action === "function") {
            settings.errorHandler = action;
        }
    }


    /* =========================================================================
    
    registerActtion: takes trigger, a string representing an action path
    and action, a function representing the action to comense.

    ========================================================================= */
    function registerAction(trigger, action) {
        if (trigger && typeof action === "function") {
            actionsMap[trigger] = action;
        }
    }

    /* =========================================================================
    
    registerActtions: takes an object maping action paths to routing. 

    ========================================================================= */
    function registerActions(actions) {
        if (typeof actions === "object") {
            Object.assign(actionsMap, actions);
        }
    }

    /* =========================================================================
    
    createLoader - Adds the html to support loader to end of html

    ========================================================================= */
    function createLoader() {
        if (!$(`body div.${settings.modalSpinnerClass}`).length) {
            $("body").append(
                $("<div/>", { class: settings.modalSpinnerClass }).html(`
                    <i class="fa fa-spinner fa-pulse fa-3x fa-fw ltblue"></i>
                    <span class="sr-only">Loading...</span>
                `)
            );
        }

        $("a[href]").on("click", function (event) {
            if ($(this).attr("href") === window.location.hash) {
                event.currentTarget.href += "/";
            }
        });

        $("a:not([href])").attr("href", "#ignore");
    }


    /* =========================================================================
    
    showLoader - shows spinning loader icon

    ========================================================================= */
    function showLoader() {
        $("body").addClass(settings.spinnerClass);
    }

    /* =========================================================================
    
    hideLoader - hides spinning Loader Icon. 

    ========================================================================= */
    function hideLoader() {
        $("body").removeClass(settings.spinnerClass);
    }

    /* =========================================================================
    
    doNav- Navigates to action

    ========================================================================= */
    function doNav(action = "") {
        window.location.hash = `#${action}`;
        return this;
    }


    // Expose API
    $.singlePage = singlePage;
    $.singlePage.registerAction = registerAction;
    $.singlePage.registerActions = registerActions;
    $.singlePage.registerErrorHandler = registerErrorHandler;
    $.singlePage.router = router;
    $.singlePage.showLoader = showLoader;
    $.singlePage.hideLoader = hideLoader;
    $.singlePage.doNav = doNav;

})(jQuery);