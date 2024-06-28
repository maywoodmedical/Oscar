// ==UserScript==
// @name        Documents and Inbox Sorting
// @namespace   https://github.com/maywoodmedical/Oscar
// @description Organize documents in chronologic order, and load all inbox items
// @include     *documentManager/documentReport.jsp*
// @include     *documentManager/inboxManage.do*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @updateURL https://github.com/maywoodmedical/Oscar/raw/main/DocumentSorting.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/main/DocumentSorting.user.js
// @version 1.3
// @grant       none
// ==/UserScript==


(function() {
    'use strict';

    // Function to simulate a click on the table header with the text "Observed"
    function clickOnObservedHeader() {
        // Find the table header element containing the text "Observed"
        var observedHeader = findObservedHeader();
        if (observedHeader) {
            // Trigger a click event on the element
            observedHeader.click();
            observedHeader.click();
        }
    }

    // Function to find the table header element containing the text "Observed"
    function findObservedHeader() {
        var headers = document.querySelectorAll('th');
        for (var i = 0; i < headers.length; i++) {
            if (headers[i].textContent.trim() === 'Observed') {
                return headers[i];
            }
        }
        return null;
    }

    // Wait for 0.5 seconds before clicking on the table header
    setTimeout(clickOnObservedHeader, 500);
})();



// Function to maximize window height and set width to 75% of screen size
(function() {
    'use strict';

    function maximizeWindow() {
        var screenWidth = window.screen.availWidth;
        var newWidth = screenWidth * 0.85; // 85% of screen width
        // Calculate left position to start from the left of the screen
        var leftPosition = screen.left;
        window.resizeTo(newWidth, window.screen.availHeight);
        // Move window to the left of the screen
        window.moveTo(leftPosition, 0);
    }

    // Wait for the document to be fully loaded
    $(document).ready(function() {
        // Maximize window
        maximizeWindow();
    });
})();


// Function to automatically click Load All Inbox 
(function() {
    'use strict';

    window.addEventListener('load', function() {
        setTimeout(function() {
            var loadAllButton = document.querySelector('input.smallButton[value="Load All Inbox"]');
            if(loadAllButton) {
                loadAllButton.click();
            }
        }, 500); // 500 milliseconds = 1 second
    });
})();
