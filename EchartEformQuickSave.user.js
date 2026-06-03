// ==UserScript==
// @name         EchartEformQuickSave
// @namespace    http://tampermonkey.net/
// @version      4.7
// @description  Instantly closes eForm on save, addresses advanced double-save loops via submission proxy sandboxing.
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
    if (localStorage.getItem(printMarkerKey) === "true") {
        localStorage.removeItem(printMarkerKey);
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
                localStorage.setItem(printMarkerKey, "true");
            });
        }

        // 2. Handle Background AJAX Save
        if (saveBtn && form && !saveBtn.hasAjaxInterceptor) {
            saveBtn.hasAjaxInterceptor = true;
            console.log("Oscar Script: Intercepting Save Button.");

            const originalOnclick = saveBtn.getAttribute('onclick');
            saveBtn.removeAttribute('onclick');

            saveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                saveBtn.value = "Saving...";
                saveBtn.style.background = "#ffa500";

                // ADVANCED SANDBOXING: Protect form submission vectors
                const nativeSubmit = form.submit;
                const originalAction = form.action || win.location.href;

                // Stub the submit method
                form.submit = function() {
                    console.log("Oscar Script: Dropped inline programmatic form.submit()");
                };

                // Truncate the action target so native HTML triggers cannot reach the server
                form.setAttribute('action', 'javascript:void(0);');
                form.action = 'javascript:void(0);';

                // STAGE AND EXTRACT SIGNATURE/CANVAS DATA
                try {
                    if (typeof win.submitForm === 'function') {
                        win.submitForm();
                    } else if (originalOnclick) {
                        const cleanClick = originalOnclick.replace(/window\.close\(\)|this\.disabled=true/g, '');
                        new Function(cleanClick).call(saveBtn);
                    }

                    if (win.signaturePad && typeof win.signaturePad.isEmpty === 'function' && !win.signaturePad.isEmpty()) {
                        const sigDataInput = document.querySelector('input[name="sig_data"]') || document.querySelector('input[name*="signature"]');
                        if (sigDataInput) {
                            sigDataInput.value = win.signaturePad.toDataURL();
                        }
                    }
                } catch (err) {
                    console.warn("Oscar Script: Pre-save/signature extraction warning:", err);
                } finally {
                    // Restore original form properties immediately after data processing completes
                    form.submit = nativeSubmit;
                    form.setAttribute('action', originalAction);
                    form.action = originalAction;
                }

                // DATA SERIALIZATION
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

                // NETWORK SUBMISSION WITH KEEPALIVE (Targeting original backed-up URL)
                fetch(originalAction, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formDataString,
                    keepalive: true
                }).catch(err => {
                    console.error("Background save network stream dropped:", err);
                });

                // Immediate close sequence
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
