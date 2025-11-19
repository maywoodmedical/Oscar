// ==UserScript==
// @name        Move WTW Document Feedback
// @namespace   https://github.com/maywoodmedical/Oscar
// @description Move WTW Document Feedback button location
// @include     */documentManager/showDocument.jsp?*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @require  https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL 
// @downloadURL 
// @grant    GM_addStyle
// @grant    GM.getValue
// @noframes
// @version 1.0
// ==/UserScript==
//- The @grant directives are needed to restore the proper sandbox.
/* global $, waitForKeyElements */


(function() {
    'use strict';

    function moveButton() {
        const btn = document.getElementById('extractButton');
        if (btn) {
            // Get the current top position (defaulting to 100px if not found)
            const currentTop = parseInt(window.getComputedStyle(btn).top) || 100;
            btn.style.top = (currentTop - 50) + 'px';
        } else {
            // Try again if the button isn’t there yet (e.g., loaded dynamically)
            setTimeout(moveButton, 500);
        }
    }

    // Run once DOM is ready
    window.addEventListener('load', moveButton);
})();
