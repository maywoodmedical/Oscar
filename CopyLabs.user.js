// ==UserScript==
// @name        CopyLabs
// @namespace   https://github.com/maywoodmedical/Oscar
// @description left click to copy lab values automatically
// @include  *lab/CA/ALL/labDisplay.jsp?segmentID*
// @include  *lab/CA/ALL/labDisplay.jsp?demographicId*
// @include  *dms/MultiPageDocDisplay.jsp?segmentID*
// @include  *lab/CA/ALL/labDisplay.jsp?inWindow=true&segmentID*
// @include  *dms/showDocument.jsp?inWindow*
// @include  *dms/showDocument.jsp?segmentID*
// @require   http://ajax.googleapis.com/ajax/libs/jquery/1.3.1/jquery.min.js
// @updateURL 
// @downloadURL 
// @version     1.0
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    let clipboard = []; // This will hold the accumulated lab names and values
    let textArea = null;  // Will store the textarea element

    // Function to accumulate lab name and value when left-clicked
    function accumulateLabValue(event) {
        // Find the numerical value and its associated lab name
        let numberElement = event.target;
        if (numberElement.tagName.toLowerCase() === 'td' && numberElement.align === 'right') {
            let labValue = numberElement.textContent.trim();
            let labLabelElement = numberElement.previousElementSibling;

            // Ensure the label is valid and the number is also valid
            if (labLabelElement && labLabelElement.tagName.toLowerCase() === 'td') {
                let labName = labLabelElement.querySelector('a') ? labLabelElement.querySelector('a').textContent : '';
                
                if (labName && !isNaN(labValue)) {
                    clipboard.push(`${labName}: ${labValue}`);
                    alert(`Added ${labName}: ${labValue} to clipboard!`);
                    updateTextArea();
                    copyToClipboard(); // Automatically trigger copying to clipboard
                }
            }
        }
    }

    // Function to update the textarea with the accumulated values
    function updateTextArea() {
        if (!textArea) {
            // Create and display the textarea if it doesn't exist
            textArea = document.createElement('textarea');
            textArea.style.position = 'fixed';
            textArea.style.top = '216px';
            textArea.style.right = '10px';
            textArea.style.width = '200px';
            textArea.style.height = '55px';
            textArea.style.zIndex = '9999';
            textArea.readOnly = true;
            textArea.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';  // White with 80% opacity
            document.body.appendChild(textArea);
        }

        // Update the textarea content
        textArea.value = clipboard.join('\n');
    }

    // Function to simulate copying to clipboard
    function copyToClipboard() {
        // Create a temporary textarea to copy the clipboard content to the system clipboard
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = clipboard.join('\n');
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        alert('Lab values copied to clipboard!');
    }

    // Listen for left-click event to collect lab values
    document.addEventListener('click', function(event) {
        accumulateLabValue(event);
    });

})();
