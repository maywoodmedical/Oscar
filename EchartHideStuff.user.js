// ==UserScript==
// @name        Hide Echart Stuff
// @namespace   https://github.com/maywoodmedical/Oscar
// @description Hides the Research bar
// @include     */casemgmt/forward.jsp?action=view&demographic*
// @include     */provider/providercontrol.jsp?*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @require  https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL https://github.com/maywoodmedical/Oscar/raw/main/EchartHideStuff.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/main/EchartHideStuff.user.js
// @grant    GM_addStyle
// @grant    GM.getValue
// @noframes
// @version 1.3
// ==/UserScript==
//- The @grant directives are needed to restore the proper sandbox.
/* global $, waitForKeyElements */



/*
//removes the Research toolbar 
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


//removes the OpenOSP logo next to Patient Name
waitForKeyElements ("#branding-logo", removeBrandingLogoDiv);

function removeBrandingLogoDiv (jNode) {
    'use strict';
    jNode.remove();
}


//removes the Cortico logo on Labs header
waitForKeyElements("a[href='https://help.cortico.ca/help/oscar-lab-auto-labelling?version=latest']", removeElement);

function removeElement(jNode) {
    'use strict';
    jNode.remove();
}
waitForKeyElements("span.tw-bg-cortico-blue", removeElement);

function removeElement(jNode) {
    'use strict';
    jNode.remove();
}

//removes multiple headers in Navigation Bars
waitForKeyElements ("#unresolvedIssues", removeUnresolvedIssuesDiv);

function removeUnresolvedIssuesDiv (jNode) {
    'use strict';
    jNode.remove();
}

waitForKeyElements ("#resolvedIssues", removeResolvedIssuesDiv);

function removeResolvedIssuesDiv (jNode) {
    'use strict';
    jNode.remove();
}

waitForKeyElements ("#Guidelines", removeGuidelinesDiv);

function removeGuidelinesDiv (jNode) {
    'use strict';
    jNode.remove();
}

waitForKeyElements ("#contacts", removeContactsDiv);

function removeContactsDiv (jNode) {
    'use strict';
    jNode.remove();
}

waitForKeyElements ("#msgs", removeMsgsDiv);

function removeMsgsDiv (jNode) {
    'use strict';
    jNode.remove();
}


//removes multiple buttons at bottom of Echart
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

waitForKeyElements ("#assignIssueSection", removeassignIssueSectionDiv);

function removeassignIssueSectionDiv (jNode) {
    'use strict';
    // Remove the assign issue button
    jNode.remove();
}


//removes the last two characters 'BC' at the end of the PHN in header
// Get the element with id "patient-hin"
var hinElement = document.getElementById('patient-hin');
// Get the text node within the element
var textNode = hinElement.childNodes[1];
// Get the text content of the text node
var textContent = textNode.textContent;
// Check if the last two characters are 'BC'
if (textContent.slice(-2) === 'BC') {
    // Remove the last two characters
    var modifiedText = textContent.slice(0, -2);
    
    // Set the modified text content back to the text node
    textNode.textContent = modifiedText;
}


(function() {
    'use strict';
    
    // Define custom CSS to adjust image position
    GM_addStyle(`
        img[src^='data:image/png;base64'] {
            position: absolute !important;
            top: 0px !important;
        }
    `);
})();
