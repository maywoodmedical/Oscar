// ==UserScript==
// @name        InboxLabeler
// @namespace   https://github.com/maywoodmedical/Oscar
// @description Click to copy and paste prelabel to document label field
// @include     *oscar/lab/CA/ALL/labDisplay.jsp?inWindow=true&segmentID=*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @updateURL https://github.com/maywoodmedical/Oscar/blob/main/InboxLabeler.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/blob/main/InboxLabeler.user.js
// @version 2.3
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    function pasteLogic(span, input) {
        let text = span.innerHTML;
        text = text.replace(/^<i>|<\/i>$/g, '');
        text += "- ";
        input.value = text;
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
        console.log("Auto-paste completed instantly.");
    }

    const observer = new MutationObserver((mutations, obs) => {
        const span = document.querySelector('span[id*="labelspan"]');
        const input = document.querySelector('input[type="text"]');

        if (span && input) {
            pasteLogic(span, input);
            obs.disconnect(); // Stop watching once we've succeeded
        }
    });

    // Start watching the document for changes immediately
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();
