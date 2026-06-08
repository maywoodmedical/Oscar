// ==UserScript==
// @name         EchartEformQuickSave
// @namespace    http://tampermonkey.net/
// @version      5.2
// @description  Instantly closes eForm on save, addresses advanced double-save loops via submission proxy sandboxing. Targeted capture for StoreSignature1 form properties.
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
        const saveBtn = document.getElementById('remoteSubmitButton') || document.getElementById('SubmitButton');
        const printBtn = document.getElementById('remotePrintButton') || document.getElementById('PrintButton');
        const form = document.querySelector('form[name="FormName"]') || document.querySelector('form[name="eForm"]') || document.forms[0];

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

                // Stub the submit method to block native document loops
                form.submit = function() {
                    console.log("Oscar Script: Dropped inline programmatic form.submit()");
                };

                // Truncate the action target so native HTML triggers cannot reach the server
                form.setAttribute('action', 'javascript:void(0);');
                form.action = 'javascript:void(0);';

                // STAGE AND EXTRACT DRAWINGS / CANVAS SIGNATURE DATA
                try {
                    // Trigger the eForm's built-in staging handlers
                    if (typeof win.submitDocument === 'function') {
                        console.log("Oscar Script: Invoking native submitDocument() layer.");
                        win.submitDocument();
                    } else if (typeof win.SubmitImage === 'function') {
                        win.SubmitImage();
                    } else if (typeof win.submitForm === 'function') {
                        win.submitForm();
                    } else if (originalOnclick) {
                        const cleanClick = originalOnclick.replace(/window\.close\(\)|this\.disabled=true/g, '');
                        new Function(cleanClick).call(saveBtn);
                    }

                    // TARGETED ACTION: Extract base30 data directly if target field value is unpopulated
                    let targetSigInput = document.getElementsByName('StoreSignature1')[0] || document.getElementById('StoreSignature1');
                    if (!targetSigInput) {
                        console.log("Oscar Script: Dynamic generating placeholder for StoreSignature1");
                        targetSigInput = document.createElement('input');
                        targetSigInput.type = 'hidden';
                        targetSigInput.name = 'StoreSignature1';
                        targetSigInput.id = 'StoreSignature1';
                        form.appendChild(targetSigInput);
                    }

                    if (win.jQuery && win.jQuery(".jSignature").length > 0 && (!targetSigInput.value || targetSigInput.value.length < 30)) {
                        console.log("Oscar Script: Manually fetching base30 data arrays via jQuery API context...");
                        const sigData = win.jQuery(".jSignature").jSignature("getData", "base30");
                        if (sigData && sigData.length >= 2) {
                            targetSigInput.value = sigData.join(",");
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

                // Append essential validation parameter fallbacks for backend verification routing
                if (!formDataString.includes('remoteSubmitButton') && !formDataString.includes('SubmitButton')) {
                    formDataString += '&remoteSubmitButton=Save&SubmitButton=Submit';
                }

                // Force append signature string manually if missing from serial format strings
                if (!formDataString.includes('StoreSignature1=')) {
                    const explicitSigVal = document.getElementsByName('StoreSignature1')[0]?.value || "";
                    if (explicitSigVal) {
                        formDataString += '&StoreSignature1=' + encodeURIComponent(explicitSigVal);
                    }
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

                // Execute complete quick-close routine
                setTimeout(() => {
                    closeWindowInstantly();
                }, 100);
            });
        }
    }

    // Standard deferred initialization loop
    applyInterceptors();
    const initLoop = setInterval(applyInterceptors, 300);
    setTimeout(() => clearInterval(initLoop), 5000);

})();
