// ==UserScript==
// @name        Consult Autoload History
// @namespace   https://github.com/maywoodmedical/Oscar
// @description Automatically click buttons to load patient history and medications
// @include  *oscarEncounter/oscarConsultationRequest/ConsultationFormRequest.jsp?*
// @require   http://ajax.googleapis.com/ajax/libs/jquery/1.3.1/jquery.min.js
// @updateURL https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/ConsultAutoloadHistory.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/ConsultAutoloadHistory.user.js
// @version     1.0
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    // Wait for the page to fully load before executing
    window.addEventListener('load', function() {
        // List of button IDs to click
        const buttonIds = [
            "Concerns_clinicalInformation", 
            "MedHistory_clinicalInformation", 
            "SocHistory_concurrentProblems", 
            "FamHistory_concurrentProblems", 
            "fetchMedications_currentMedications", 
            "OMeds_currentMedications",
            "fetchAllergies_allergies"
        ];

        // Loop through the button IDs and click each one
        buttonIds.forEach(function(buttonId) {
            const button = document.getElementById(buttonId);
            if (button) {
                button.click();
                console.log(`Button with id "${buttonId}" clicked.`);
            } else {
                console.log(`Button with id "${buttonId}" not found.`);
            }
        });
    });
})();
