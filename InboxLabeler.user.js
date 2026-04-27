// ==UserScript==
// @name         InboxLabeler
// @namespace    https://github.com/maywoodmedical/Oscar
// @description  Click to copy and paste prelabel to document label field
// @match        *://*/oscar/lab/CA/ALL/labDisplay.jsp*
// @match        *://*/oscar/documentManager/showDocument.jsp*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @updateURL    https://github.com/maywoodmedical/Oscar/blob/main/InboxLabeler.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/blob/main/InboxLabeler.user.js
// @version      3.1
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function getLabelInput() {
        // Specifically look for documentDescription first (Document Manager), 
        // then comment (Labs), then any text input as fallback.
        return document.querySelector('input[name="documentDescription"]') || 
               document.querySelector('input[id*="comment"]') || 
               document.querySelector('input[type="text"]');
    }

    function pasteLogic(span, input) {
        let text = span.innerHTML;
        text = text.replace(/^<i>|<\/i>$/g, '');
        text += "- ";
        input.value = text;
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
        console.log("InboxLabeler: Auto-paste completed.");
    }

    function enableGlobalTyping() {
        document.addEventListener('keydown', function(e) {
            const labelInput = getLabelInput();
            const active = document.activeElement;

            const isTypingElsewhere = active && (
                active.tagName === 'INPUT' || 
                active.tagName === 'TEXTAREA' || 
                active.isContentEditable
            );
            
            // Only redirect if a label input exists and we aren't already in a field
            if (labelInput && !isTypingElsewhere && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
                e.preventDefault();
                labelInput.focus();
                labelInput.setSelectionRange(labelInput.value.length, labelInput.value.length);
                labelInput.value += e.key;
            }
        });
    }

    const observer = new MutationObserver((mutations, obs) => {
        const span = document.querySelector('span[id*="labelspan"]');
        const input = getLabelInput();

        if (span && input) {
            pasteLogic(span, input);
            obs.disconnect(); 
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // Run once on load in case elements are already there
    enableGlobalTyping();
})();
