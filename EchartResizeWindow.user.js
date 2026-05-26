// ==UserScript==
// @name         EchartResizeWindow
// @namespace    https://github.com/maywoodmedical/Oscar
// @description  Resizes the Echart window and waits for the case note textarea to load before focusing.
// @include      */casemgmt/forward.jsp?action=view&demographic*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartResizeWindow.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartResizeWindow.user.js
// @grant        GM_addStyle
// @grant        GM.getValue
// @noframes
// @version      1.6
// ==/UserScript==
//- The @grant directives are needed to restore the proper sandbox.
/* global $, waitForKeyElements */

(function() {
    'use strict';

    // Function to maximize window height and set width to 75% of screen size
    function maximizeWindow() {
        var screenWidth = window.screen.availWidth;
        var newWidth = screenWidth * 0.75; // 75% of screen width
        var leftPosition = window.screen.left || 0;
        window.resizeTo(newWidth, window.screen.availHeight);
        window.moveTo(leftPosition, 0);
    }

    // Function to handle the textbox once waitForKeyElements finds it
    function handleTextArea(jNode) {
        // jNode is already the jQuery object for '#caseNote_note0'
        var strLength = jNode.val().length;
        
        jNode.focus();
        
        // Put cursor at the end
        jNode[0].setSelectionRange(strLength, strLength);
        
        // Backup trick to force cursor to the end
        var val = jNode.val();
        jNode.val('').val(val);
    }

    // Maximize window immediately on document ready
    $(document).ready(function() {
        maximizeWindow();
    });

    // Dynamically watch the DOM and wait for the textarea to load
    waitForKeyElements("#caseNote_note0", handleTextArea);

})();
