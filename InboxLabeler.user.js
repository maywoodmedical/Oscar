// ==UserScript==
// @name        Inbox Labeler
// @namespace   https://github.com/maywoodmedical/Oscar
// @description Copy and paste prelabel to document label field
// @include     *oscar/lab/CA/ALL/labDisplay.jsp?inWindow=true&segmentID=*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @updateURL 
// @downloadURL 
// @version 1.0
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    // Function to copy inner HTML from span to input field
    function copyInnerHTML() {
        console.log('copyInnerHTML function started');

        // Find the first span element with an id containing 'labelspan'
        var spanElement = Array.from(document.querySelectorAll('span[id*="labelspan"]')).find(el => el.id.includes('labelspan'));

        // Find the first input element
        var inputElement = document.querySelector('input[type="text"]');

        // Log elements for debugging
        console.log('Span Element:', spanElement);
        console.log('Input Element:', inputElement);

        // Check if both elements exist
        if (spanElement && inputElement) {
            // Get inner HTML of the span
            var innerHTML = spanElement.innerHTML;
            console.log('Original Inner HTML:', innerHTML);

            // Remove <i> tags from the beginning and end
            var cleanedText = innerHTML.replace(/^<i>|<\/i>$/g, '');
            console.log('Cleaned Text:', cleanedText);
          
            // Append a hyphen to the cleaned text
            cleanedText += '- ';
            console.log('Text with Hyphen:', cleanedText);

            // Set the cleaned text with hyphen as the value of the input
            inputElement.value = cleanedText;

            // Set the cursor to the end of the input field
            inputElement.focus();
            inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
        } else {
            console.error('One or both elements were not found');
        }
    }

    // Run the function once the DOM is fully loaded
    window.addEventListener('load', function() {
        setTimeout(copyInnerHTML, 1000); // Delay execution slightly to ensure all elements are fully loaded
    });
})();
