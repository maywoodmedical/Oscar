// ==UserScript==
// @name         EchartEformQuickSave
// @namespace    http://tampermonkey.net/
// @version      4.4
// @description  Instantly closes eForm on save and utilizes state tracking to bypass post-print reloads safely.
// @author       Your Name
// @match        *://*.openosp.ca/oscar/eform/*
// @match        *://*.openosp.ca/oscar//eform/*
// @match        *://*.openosp.ca/oscar///eform/*
// @allFrames    true
// @grant        unsafeWindow
// @run-at       document-end
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartEformQuickSave.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartEformQuickSave.user.js
// ==/UserScript==

(function() {
    'use strict';

    const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const printMarkerKey = "oscar_eform_print_active";

    function closeWindowInstantly() {
        console.log("Oscar Script: Executing Instant Close...");

        try {
            win.onbeforeunload = null;
            win.top.onbeforeunload = null;
            if (win.jQuery) {
                win.jQuery(win).off('beforeunload');
                win.jQuery(win.top).off('beforeunload');
            }
        } catch (e) {}

        if (typeof win.remoteClose === 'function') {
            win.remoteClose();
        }

        try {
            win.open('', '_self');
            win.close();
        } catch(e) {}

        try {
            if (win.top) {
                win.top.open('', '_self');
                win.top.close();
            }
        } catch(e) {}
    }

    // =========================================================================
    // PART 1: STATE VERIFICATION (RUNS ON LOAD)
    // =========================================================================
    // Check if this specific window session was the result of a print trigger
    if (localStorage.getItem(printMarkerKey) === "true") {
        localStorage.removeItem(printMarkerKey); // Instantly consume marker to allow subsequent openings
        console.log("Oscar Script: Confirmed post-print reload state. Terminating window.");
        setTimeout(closeWindowInstantly, 50);
        return;
    }

    // =========================================================================
    // PART 2: INTERCEPT SAVE & PRINT BUTTONS
    // =========================================================================
    function applyInterceptors() {
        const saveBtn = document.getElementById('remoteSubmitButton');
        const printBtn = document.getElementById('remotePrintButton');
        const form = document.querySelector('form[name="eForm"]') || document.forms[0];

        // 1. Handle Print Button State Tracking
        if (printBtn && !printBtn.hasPrintInterceptor) {
            printBtn.hasPrintInterceptor = true;

            printBtn.addEventListener('click', function() {
                console.log("Oscar Script: Print clicked. Setting session tracking marker.");
                // Set the marker right as the page begins its submission/print cycle
                localStorage.setItem(printMarkerKey, "true");
            });
        }

        // 2. Handle Background AJAX Save
        if (saveBtn && form && !saveBtn.hasAjaxInterceptor) {
            saveBtn.hasAjaxInterceptor = true;
            console.log("Oscar Script: Intercepting Save Button.");

            saveBtn.removeAttribute('onclick');

            saveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                saveBtn.value = "Saving...";
                saveBtn.style.background = "#ffa500";

                let formDataString = "";
                try {
                    if (win.$ && win.$.fn && win.$.fn.serialize) {
                        formDataString = win.$(form).serialize();
                    } else {
                        const params = new URLSearchParams();
                        for (const pair of new FormData(form)) {
                            params.append(pair[0], pair[1]);
                        }
                        formDataString = params.toString();
                    }
                } catch (err) {
                    console.error("Serialization failed", err);
                }

                if (!formDataString.includes('remoteSubmitButton')) {
                    formDataString += '&remoteSubmitButton=Save';
                }

                fetch(form.action || win.location.href, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formDataString
                }).catch(err => {
                    console.error("Background save network stream dropped:", err);
                });

                setTimeout(() => {
                    closeWindowInstantly();
                }, 50);
            });
        }
    }

    // Standard deferred initialization loop
    applyInterceptors();
    const initLoop = setInterval(applyInterceptors, 300);
    setTimeout(() => clearInterval(initLoop), 5000);

})();
