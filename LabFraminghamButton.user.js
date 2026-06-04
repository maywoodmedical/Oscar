// ==UserScript==
// @name         LabFraminghamButton
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a Framingham eForm button next to the CHEM6 lab header in Oscar EMR
// @author       Your Name
// @match        https://*.openosp.ca/oscar/lab/CA/ALL/labDisplay.jsp*
// @grant        none
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/LabFraminghamButton.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/LabFraminghamButton.user.js
// ==/UserScript==

(function() {
    'use strict';

    // 1. Extract the demographicId from the current URL dynamically
    const urlParams = new URLSearchParams(window.location.search);
    const demographicId = urlParams.get('demographicId');

    if (!demographicId) {
        console.log("Framingham Script: No demographicId found in URL.");
        return;
    }

    // 2. Define the target base URL for the eForm
    // Note: The appointment ID is hardcoded as per your example, but demographic_no is dynamic.
    const eFormUrl = `https://maywoodmedicalclinic.openosp.ca/oscar/eform/efmformadd_data.jsp?fid=267&demographic_no=${demographicId}&appointment=180843&parentAjaxId=eforms`;

    // 3. Find all div elements with the class 'Title2'
    const headers = document.querySelectorAll('div.Title2');

    headers.forEach(header => {
        // Clean up the text content to look for 'CHEM6'
        if (header.textContent.trim() === 'CHEM6') {

            // Create the button element
            const btn = document.createElement('button');
            btn.innerHTML = 'Framingham';

            // Add some basic styling so it fits nicely next to the header
            btn.style.marginLeft = '15px';
            btn.style.padding = '3px 10px';
            btn.style.fontSize = '12px';
            btn.style.cursor = 'pointer';
            btn.style.backgroundColor = '#4CAF50';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '3px';
            btn.style.verticalAlign = 'bottom';

            // Add click behavior to open the eForm in a new tab
            btn.onclick = function() {
                window.open(eFormUrl, '_blank');
            };

            // Append the button right inside the header div
            header.appendChild(btn);
        }
    });
})();
