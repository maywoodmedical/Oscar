// ==UserScript==
// @name        Inbox Labeler
// @namespace   https://github.com/maywoodmedical/Oscar
// @description Click to copy and paste prelabel to document label field
// @include     *oscar/lab/CA/ALL/labDisplay.jsp?inWindow=true&segmentID=*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @updateURL https://github.com/maywoodmedical/Oscar/blob/main/InboxLabeler.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/blob/main/InboxLabeler.user.js
// @version 2.0
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    function setupClickToPaste() {
        console.log('Setting up click-to-paste');

        // Find all span elements with id containing "labelspan"
        const spanElements = document.querySelectorAll('span[id*="labelspan"]');
        const inputElement = document.querySelector('input[type="text"]');

        if (!spanElements.length || !inputElement) {
            console.error("Required elements not found.");
            return;
        }

        spanElements.forEach(span => {
            span.style.cursor = "pointer"; // visual cue

            span.addEventListener("click", function() {
                console.log("Prelabel clicked:", span);

                // Get inner HTML from the clicked span
                let text = span.innerHTML;

                // Remove leading/trailing <i> tags
                text = text.replace(/^<i>|<\/i>$/g, '');

                // Add hyphen + space
                text += "- ";

                // Paste into the input
                inputElement.value = text;

                // Position cursor at end
                inputElement.focus();
                inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
            });
        });

        console.log("Click handlers attached.");
    }

    // Wait for DOM to load
    window.addEventListener('load', function() {
        setTimeout(setupClickToPaste, 800); 
    });

})();
