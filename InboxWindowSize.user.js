// ==UserScript==
// @name         InboxWindowSize
// @namespace    https://github.com/maywoodmedical/Oscar
// @description  Organize documents in chronologic order, and load all inbox items (Updated for InboxHub framework)
// @include      *documentManager/documentReport.jsp*
// @include      *documentManager/inboxManage.do*
// @include      *web/inboxhub/Inboxhub.do*
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/InboxWindowSize.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/InboxWindowSize.user.js
// @version      1.8
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    function maximizeWindow() {
        // Target the topmost browser window frame, bypassing nested EMR frames
        var targetWindow = window.top || window;

        var screenWidth = targetWindow.screen.availWidth;
        var newWidth = screenWidth * 0.85; // 85% of screen width

        // Use a safe fallback for modern browser screen coordinates
        var leftPosition = (targetWindow.screen.left !== undefined) ? targetWindow.screen.left : 0;

        // Safely resize and relocate the parent viewport
        targetWindow.resizeTo(newWidth, targetWindow.screen.availHeight);
        targetWindow.moveTo(leftPosition, 0);
    }

    // Run as soon as the DOM tree for the current framework layer is parsed
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', maximizeWindow);
    } else {
        maximizeWindow();
    }
})();
