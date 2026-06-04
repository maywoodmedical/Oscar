// ==UserScript==
// @name         LoginAuto
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Automatically clicks "Keep other sessions signed in" on Oscar login page as fast as possible
// @author       Your Name
// @match        https://maywoodmedicalclinic.openosp.ca/oscar/login.do*
// @grant        none
// @run-at       document-start
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/LoginAuto.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/LoginAuto.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Target selector for the button
    const BUTTON_SELECTOR = 'button[name="sessionChoice"][value="keep"]';

    // Function to attempt the click and clear the observer/interval
    function tryClick(observer = null, intervalId = null) {
        const keepButton = document.querySelector(BUTTON_SELECTOR);

        if (keepButton) {
            console.log('[Oscar Script] Found the "Keep sessions" button. Actuating instantly...');
            keepButton.click();

            // Clean up listeners immediately after clicking
            if (observer) observer.disconnect();
            if (intervalId) clearInterval(intervalId);
            return true;
        }
        return false;
    }

    // 1. First immediate attempt (in case it's somehow already there)
    if (tryClick()) return;

    // 2. High-speed MutationObserver to catch it the millisecond it hits the DOM
    const observer = new MutationObserver((mutations, obs) => {
        if (tryClick(obs)) {
            // Success, observer stopped inside tryClick
        }
    });

    // Start observing the document as it builds
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // 3. Fail-safe high-frequency interval (runs every 50ms just in case MutationObserver misses a non-standard injection)
    const intervalId = setInterval(() => {
        if (tryClick(null, intervalId)) {
            // Success, interval stopped inside tryClick
            observer.disconnect(); // Make sure to kill the observer too
        }
    }, 50);

    // 4. Safety timeout: Stop looking after 5 seconds to prevent memory leaks if the button isn't on this specific page
    setTimeout(() => {
        observer.disconnect();
        clearInterval(intervalId);
    }, 5000);
})();
