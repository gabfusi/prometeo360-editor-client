"use strict";

/**
 * App startup
 */
define(["config", "navigo"], function(config, Navigo) {

    /**
     * Router is a wrapper of Navigo
     */
    return {

        router: null,

        /**
         * init router
         * @param base
         */
        init: function (base) {
            this.router = new Navigo(base, true); // always use hash in electron environment!
        },

        /**
         * bind routes
         * @param routes
         */
        setRoutes: function(routes) {
            this.router.on(routes).resolve();
        },

        /**
         * replace current uri
         * @param uri
         */
        replaceUri: function(uri) {
            this.router.pause(true);
            this.router.navigate(uri);
            this.router.pause(false);
        },

        /**
         * navigate to uri
         * @param uri
         */
        navigateUri: function(uri) {
            this.router.navigate(uri);
        },

        /**
         * Refresh page links
         */
        refresh: function() {
            this.router.updatePageLinks();
        }

    };

});