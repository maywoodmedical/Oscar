// ==UserScript==
// @name        Echart Hide Stuff
// @namespace   https://github.com/maywoodmedical/Oscar
// @description Hides the Research bar, Right Navigation Bar headers, etc. 
// @include     */casemgmt/forward.jsp?action=view&demographic*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @require  https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant    GM_addStyle
// @grant    GM.getValue
// @noframes
// @version 1.0
// ==/UserScript==
//- The @grant directives are needed to restore the proper sandbox.
/* global $, waitForKeyElements */

/*
waitForKeyElements ("legend:contains('Research')", removeFieldsetWithLegend);

function removeFieldsetWithLegend (jNode) {
    'use strict';

    // Remove the parent fieldset element
    var fieldsetElement = jNode.closest('fieldset');

    // Check if the fieldset element exists
    if (fieldsetElement) {
        // Remove the fieldset element from its parent
        fieldsetElement.remove();
    }
}
*/
    
waitForKeyElements ("#unresolvedIssues", removeUnresolvedIssuesDiv);

function removeUnresolvedIssuesDiv (jNode) {
    'use strict';
    // Remove the unresolved issues div element
    jNode.remove();
}

waitForKeyElements ("#resolvedIssues", removeResolvedIssuesDiv);

function removeResolvedIssuesDiv (jNode) {
    'use strict';
    // Remove the resolved issues div element
    jNode.remove();
}

waitForKeyElements ("#Guidelines", removeGuidelinesDiv);

function removeGuidelinesDiv (jNode) {
    'use strict';
    // Remove the guidelines div element
    jNode.remove();
}

waitForKeyElements ("#contacts", removeContactsDiv);

function removeContactsDiv (jNode) {
    'use strict';
    // Remove the contacts div element
    jNode.remove();
}


waitForKeyElements ("#msgs", removeMsgsDiv);

function removeMsgsDiv (jNode) {
    'use strict';
    // Remove the messenger div element
    jNode.remove();
}


waitForKeyElements ("button:contains('Display Resolved Issues')", hideDisplayResolvedButton);

function hideDisplayResolvedButton (jNode) {
    'use strict';
    // Hide the button with text "Display Resolved Issues"
    jNode.hide();
}


waitForKeyElements ("button:contains('Display Unresolved Issues')", hideDisplayUnresolvedButton);

function hideDisplayUnresolvedButton (jNode) {
    'use strict';
    // Hide the button with text "Display Resolved Issues"
    jNode.hide();
}


// Function to remove the last two characters of text (BC) inside the HIN/PHN element
function removeLastTwoCharacters(jNode) {
    // Get the HTML content of the element
    var htmlContent = jNode.html();

    // Remove the last two characters
    var modifiedHtml = htmlContent.slice(0, -2);

    // Set the modified HTML content back to the element
    jNode.html(modifiedHtml);
}

// Wait for the element with id "patient-hin" to be available, then execute the function
waitForKeyElements("#patient-hin", removeLastTwoCharacters);


