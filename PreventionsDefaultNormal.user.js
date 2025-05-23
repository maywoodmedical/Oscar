// ==UserScript==
// @name        Preventions Default Normal
// @namespace   https://github.com/maywoodmedical/Oscar
// @description when preventions window opens the default selection for result is normal
// @include     */oscarPrevention/AddPreventionData.jsp*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @require  https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/PreventionsDefaultNormal
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/PreventionsDefaultNormal
// @grant    GM_addStyle
// @grant    GM.getValue
// @noframes
// @version 1.0
// ==/UserScript==
//- The @grant directives are needed to restore the proper sandbox.
/* global $, waitForKeyElements */


(function() {
    'use strict';

    function selectNormalRadio() {
        const normalRadio = document.querySelector('input[type="radio"][name="result"][value="normal"]');
        if (normalRadio) {
            normalRadio.checked = true;
        }
    }

    // Run after DOM is fully loaded
    window.addEventListener('load', selectNormalRadio);

})();
