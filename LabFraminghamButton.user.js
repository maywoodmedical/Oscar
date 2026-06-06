// ==UserScript==
// @name          LabFraminghamButton
// @namespace     http://tampermonkey.net/
// @version       1.2
// @description   Adds a Framingham eForm button next to the CHEM6 lab header in Oscar EMR (Aggressive Text Scrape)
// @author        Your Name
// @match         https://*.openosp.ca/oscar/lab/CA/ALL/labDisplay.jsp*
// @grant         none
// @updateURL     https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/LabFraminghamButton.user.js
// @downloadURL   https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/LabFraminghamButton.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Helper function to extract URL parameters from any URL string
    function getParamFromSearch(searchStr, paramName) {
        if (!searchStr) return null;
        const params = new URLSearchParams(searchStr);
        return params.get(paramName);
    }

    let demographicId = null;

    // --- STRATEGY 1: Check the current window's URL ---
    demographicId = getParamFromSearch(window.location.search, 'demographicId') ||
                    getParamFromSearch(window.location.search, 'demographic_no') ||
                    getParamFromSearch(window.location.search, 'demographicNo');

    // --- STRATEGY 2: Check the parent opener window ---
    if (!demographicId && window.opener) {
        try {
            demographicId = getParamFromSearch(window.opener.location.search, 'demographic_no') ||
                            getParamFromSearch(window.opener.location.search, 'demographicNo') ||
                            getParamFromSearch(window.opener.location.search, 'demographicId');
        } catch (e) {
            console.log("Framingham Script: Parent window blocked by browser security rules.");
        }
    }

    // --- STRATEGY 3: Hunt inside the Page Source Code / Hidden Elements ---
    if (!demographicId) {
        // Oscar lab pages often have print buttons, hidden forms, or scripts containing the ID
        const wholePageHtml = document.documentElement.innerHTML;

        // Regex Search 1: Look for "demo=XXXXX" or "demographic_no=XXXXX" in embedded script links
        const matchDemo = wholePageHtml.match(/(?:demo|demographic_no|demographicNo)=([0-9]+)/i);
        if (matchDemo && matchDemo[1]) {
            demographicId = matchDemo[1];
        } else {
            // Regex Search 2: Look for common Oscar forms inside the document body
            const formElement = document.querySelector("form[name='Form1'], form[action*='demographic']");
            if (formElement && formElement.action) {
                const matchForm = formElement.action.match(/(?:demo|demographic_no|demographicNo)=([0-9]+)/i);
                if (matchForm && matchForm[1]) demographicId = matchForm[1];
            }
        }
    }

    // Log tracking for troubleshooting
    if (!demographicId) {
        console.log("Framingham Script: ID could not be found via URL, Parent Window, or Page Scrape.");
    } else {
        console.log("Framingham Script: Target Patient ID found -> " + demographicId);
    }

    // Find all div elements with the class 'Title2'
    const headers = document.querySelectorAll('div.Title2');

    headers.forEach(header => {
        if (header.textContent.trim() === 'CHEM6') {

            const btn = document.createElement('button');
            btn.innerHTML = 'Framingham';

            // Style the button to match your environment
            btn.style.marginLeft = '15px';
            btn.style.padding = '3px 10px';
            btn.style.fontSize = '12px';
            btn.style.cursor = 'pointer';
            btn.style.backgroundColor = '#4CAF50';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '3px';
            btn.style.verticalAlign = 'bottom';

            btn.onclick = function() {
                if (!demographicId) {
                    alert("Error: Could not automatically detect the Patient's demographic ID from this window.");
                    return;
                }

                const eFormUrl = `https://maywoodmedicalclinic.openosp.ca/oscar/eform/efmformadd_data.jsp?fid=267&demographic_no=${demographicId}&appointment=180843&parentAjaxId=eforms`;
                window.open(eFormUrl, '_blank');
            };

            header.appendChild(btn);
        }
    });
})();
