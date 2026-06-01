// ==UserScript==
// @name         InboxMoveWTWDocumentFeedback
// @namespace    https://github.com/maywoodmedical/Oscar
// @description  Move WTW Document Feedback button location permanently via CSS
// @include      */documentManager/showDocument.jsp?*
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/InboxMoveWTWDocumentFeedback.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/InboxMoveWTWDocumentFeedback.user.js
// @grant        GM_addStyle
// @grant        GM.getValue
// @noframes
// @version      1.4
// ==/UserScript==

(function() {
    'use strict';

    // Inject CSS to override Oscar's inline layout properties permanently.
    // Adjust the top pixel value calculation (e.g., 40px) to match your previous setup if needed.
    GM_addStyle(`
        #extractButton {
            top: 36px !important;
            right: 0px !important;
            left: auto !important;
        }
    `);
})();
