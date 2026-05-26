// ==UserScript==
// @name         EchartEformQuickSave
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Instantly closes eForm window on click while seamlessly pushing the AJAX save in the background.
// @author       Your Name
// @match        *://*.openosp.ca/oscar/eform/*
// @match        *://*.openosp.ca/oscar//eform/*
// @match        *://*.openosp.ca/oscar///eform/*
// @allFrames    true
// @grant        unsafeWindow
// @run-at       document-end
// @uploadURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartEformQuickSave.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartEformQuickSave.user.js
// ==/UserScript==

(function() {
    'use strict';

    const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    function closeWindowInstantly() {
        console.log("Oscar Script: Executing Instant Close...");

        // Wipe out Firefox/Chrome "Leave Page" alerts immediately
        try {
            win.onbeforeunload = null;
            win.top.onbeforeunload = null;
            if (win.jQuery) {
                win.jQuery(win).off('beforeunload');
                win.jQuery(win.top).off('beforeunload');
            }
        } catch (e) {}

        // 1. Try Oscar's internal logic
        if (typeof win.remoteClose === 'function') {
            win.remoteClose();
        }

        // 2. Window Exploit: Trick browser into believing this script opened the window context
        try {
            win.open('', '_self');
            win.close();
        } catch(e) {}

        // 3. Independent Window Fallback
        try {
            if (win.top) {
                win.top.open('', '_self');
                win.top.close();
            }
        } catch(e) {}
    }

    function applyAjaxSave() {
        const saveBtn = document.getElementById('remoteSubmitButton');
        const form = document.querySelector('form[name="eForm"]') || document.forms[0];

        if (saveBtn && form && !saveBtn.hasAjaxInterceptor) {
            saveBtn.hasAjaxInterceptor = true;
            console.log("Oscar Script: Intercepting Save Button.");

            // Strip native inline onclick
            saveBtn.removeAttribute('onclick');

            saveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

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

                // Fire off the network call asynchronously
                fetch(form.action || win.location.href, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formDataString
                }).catch(err => {
                    // Logged to console background, but won't hold up UI closure
                    console.error("Background save failed downstream:", err);
                });

                // --- CRITICAL SPEED CHANGE ---
                // We do not wait for .then(). We trigger closure immediately.
                closeWindowInstantly();
            });
        }
    }

    applyAjaxSave();
    const initLoop = setInterval(applyAjaxSave, 300);
    setTimeout(() => clearInterval(initLoop), 5000);

  saveBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // 1. Give the user immediate visual feedback that processing started
    saveBtn.value = "Saving...";
    saveBtn.style.background = "#ffa500"; 

    let formDataString = serializeForm(form); // (Assuming serialization logic here)

    let saveSuccessful = false;
    let networkFinished = false;

    // 2. Fire the network request
    fetch(form.action || win.location.href, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formDataString
    })
    .then(response => {
        if (response.ok) {
            saveSuccessful = true;
            saveBtn.value = "Saved!";
            saveBtn.style.background = "#2ecc71"; // Turn button green
        }
        networkFinished = true;
    })
    .catch(err => {
        networkFinished = true;
    });

    // 3. Wait exactly 450ms. If it succeeded (which 95% of local server hits do in <200ms), close it.
    // If it failed or timed out, halt closure and scream an error.
    setTimeout(() => {
        if (saveSuccessful) {
            closeWindowInstantly();
        } else {
            saveBtn.value = "SAVE FAILED!";
            saveBtn.style.background = "#e74c3c"; // Turn button red
            alert("CRITICAL ERROR: eForm did NOT save to server. Do not close this window manually without copying your note!");
        }
    }, 450); 
});
  
})();

