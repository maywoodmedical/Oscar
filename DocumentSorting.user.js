// ==UserScript==
// @name        Document Sorting
// @namespace   https://github.com/maywoodmedical/Oscar
// @description Organize documents in chronologic order
// @include     *documentManager/documentReport.jsp*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @updateURL https://github.com/maywoodmedical/Oscar/raw/main/DocumentSorting.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/main/DocumentSorting.user.js
// @version 1.0
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
