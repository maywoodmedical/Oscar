// ==UserScript==
// @name        MedicationsPanel
// @namespace   https://github.com/maywoodmedical/Oscar
// @description move Stage Medication button to left of containing box
// @include     *oscarRx/choosePatient.do?*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @require  https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/MedicationsPanel.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/MedicationsPanel.user.js
// @grant    GM_addStyle
// @grant    GM.getValue
// @noframes
// @version 1.1
// ==/UserScript==
//- The @grant directives are needed to restore the proper sandbox.
/* global $, waitForKeyElements */


(function() {
    'use strict';

    window.addEventListener('load', function() {
        const stageButton = document.querySelector('input[type="button"][name="stage"][value="Stage Medication"]');
        const cancelButton = document.querySelector('input[type="button"][name="cancel"][value="Cancel"]');

        if (stageButton && cancelButton && stageButton.parentNode === cancelButton.parentNode) {
            const container = stageButton.parentNode;

            if (container.parentNode) {
                // Create a wrapper div to hold the buttons side-by-side
                const buttonWrapper = document.createElement('div');
                buttonWrapper.style.display = 'inline-flex';
                buttonWrapper.style.gap = '8px'; // space between buttons
                buttonWrapper.style.marginRight = '10px';
                buttonWrapper.style.verticalAlign = 'top';

                // Move both buttons into the wrapper
                buttonWrapper.appendChild(stageButton);
                buttonWrapper.appendChild(cancelButton);

                // Insert the wrapper before the original container
                container.parentNode.insertBefore(buttonWrapper, container);
            }
        }
    }, false);
})();
