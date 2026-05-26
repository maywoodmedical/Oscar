// ==UserScript==
// @name         LoginAuto
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically clicks "Keep other sessions signed in" on Oscar login page
// @author       Your Name
// @match        https://maywoodmedicalclinic.openosp.ca/oscar/login.do*
// @grant        none
// @run-at       document-end
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/LoginAuto.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/LoginAuto.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Function to find and click the button
    function autoClickKeepSession() {
        // Query for the specific button based on its attributes
        const keepButton = document.querySelector('button[name="sessionChoice"][value="keep"]');
        
        if (keepButton) {
            console.log('[Oscar Script] Found the "Keep sessions" button. Clicking it now...');
            keepButton.click();
        } else {
            console.log('[Oscar Script] "Keep sessions" button not found on this load.');
        }
    }

    // Run the function on page load
    autoClickKeepSession();

    // Optional: Oscar EMR pages sometimes load elements dynamically. 
    // If the button misses on the first split second, this backup check runs 500ms later.
    setTimeout(autoClickKeepSession, 500);
})();
