// ==UserScript==
// @name         Inbox Master Button
// @namespace    https://github.com/maywoodmedical/Oscar
// @version      1.2
// @description  When reviewing results in the inbox, add a button that navigates to the patient's master chart, and hide the useless Req# button
// @match        *://maywoodmedicalclinic.openosp.ca/oscar/lab/CA/ALL/labDisplay.jsp*
// @grant        none
// @updateURL     https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/InboxMasterButton.user.js
// @downloadURL   https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/InboxMasterButton.user.js
// ==/UserScript==


(function() {
    'use strict';

    // 1. Scraping the Patient ID
    const pageContent = document.documentElement.innerHTML;
    const demoMatch = pageContent.match(/demo=['"]?(\d+)/);

    if (demoMatch && demoMatch[1]) {
        const patientId = demoMatch[1];
        const masterChartUrl = `https://maywoodmedicalclinic.openosp.ca/oscar/demographic/demographiccontrol.jsp?demographic_no=${patientId}&displaymode=edit&dboperation=search_detail`;

        // 2. Locate the "Req#" button
        const reqButton = document.querySelector('input[value^="Req#"]');

        if (reqButton) {
            // 3. Create the Master Chart button
            const masterBtn = document.createElement('input');
            masterBtn.type = 'button';
            masterBtn.value = 'Master';

            // 4. Open in a NEW window/tab
            masterBtn.onclick = function() {
                window.open(masterChartUrl, '_blank');
            };

            // 5. Hide original and insert new
            reqButton.style.display = 'none'; 
            reqButton.parentNode.insertBefore(masterBtn, reqButton);
        }
    }
})();
