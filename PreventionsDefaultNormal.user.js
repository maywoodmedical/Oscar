// ==UserScript==
// @name         PreventionsDefaultNormal
// @namespace    https://github.com/maywoodmedical/Oscar
// @description  when preventions window opens the default selection for result is normal and auto-populates date from lab window
// @include      */oscarPrevention/AddPreventionData.jsp*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/PreventionsDefaultNormal
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/PreventionsDefaultNormal
// @grant        GM_addStyle
// @grant        GM.getValue
// @grant        unsafeWindow
// @noframes
// @version      1.4
// ==/UserScript==

(function() {
    'use strict';

    function getServiceDateFromOpener() {
        const win = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
        if (!win.opener || win.opener.closed) return null;

        const windowsToSearch = [win.opener];

        try {
            if (win.opener.frames && win.opener.frames.length > 0) {
                for (let i = 0; i < win.opener.frames.length; i++) {
                    windowsToSearch.push(win.opener.frames[i]);
                }
            }
        } catch (e) {
            // Ignore cross-frame security restrictions if present
        }

        for (const targetWin of windowsToSearch) {
            try {
                const doc = targetWin.document;
                if (!doc || !doc.body) continue;

                const html = doc.body.innerHTML;

                // Regex extracts YYYY-MM-DD HH:mm:ss or YYYY-MM-DD HH:mm following "Date of Service:"
                const regex = /Date of Service:[\s\S]{1,400}?(\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}(?::\d{2})?)?)/i;
                const match = html.match(regex);

                if (match && match[1]) {
                    let dateStr = match[1].trim();

                    // Format YYYY-MM-DD HH:mm:ss down to YYYY-MM-DD HH:mm
                    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(dateStr)) {
                        dateStr = dateStr.slice(0, 16);
                    }
                    return dateStr;
                }
            } catch (e) {
                console.warn('Unable to read opener frame content:', e);
            }
        }
        return null;
    }

    function applyAutofill() {
        // 1. Select "Normal" radio
        const normalRadio = document.querySelector('input[type="radio"][name="result"][value="normal"]');
        if (normalRadio && !normalRadio.checked) {
            normalRadio.checked = true;
        }

        // 2. Populate Date field
        const extractedDate = getServiceDateFromOpener();
        const prevDateInput = document.getElementById('prevDate');

        if (prevDateInput && extractedDate && prevDateInput.value !== extractedDate) {
            prevDateInput.value = extractedDate;
            prevDateInput.dispatchEvent(new Event('change', { bubbles: true }));
            prevDateInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    // Polling loop (runs every 100ms for 3 seconds) to ensure override after Oscar native JS loads
    let attempts = 0;
    const maxAttempts = 30;
    const interval = setInterval(function() {
        applyAutofill();
        attempts++;
        if (attempts >= maxAttempts) {
            clearInterval(interval);
        }
    }, 100);

})();
