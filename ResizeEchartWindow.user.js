// ==UserScript==
// @name        Resize Echart Window
// @namespace   https://github.com/maywoodmedical/Oscar
// @description Resizes the Echart window
// @include     */casemgmt/forward.jsp?action=view&demographic*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @require  https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant    GM_addStyle
// @grant    GM.getValue
// @noframes
// @version 1.0
// ==/UserScript==
//- The @grant directives are needed to restore the proper sandbox.
/* global $, waitForKeyElements */


(function() {
    'use strict';

    // Function to maximize window height and set width to 75% of screen size
    function maximizeWindow() {
        var screenWidth = window.screen.availWidth;
        var newWidth = screenWidth * 0.75; // 75% of screen width

        window.resizeTo(newWidth, window.screen.availHeight);
    }

    // Wait for the document to be fully loaded
    $(document).ready(function() {
        // Maximize window
        maximizeWindow();
    });
})();
