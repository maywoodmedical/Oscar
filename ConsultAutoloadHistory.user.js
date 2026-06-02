// ==UserScript==
// @name         ConsultAutoloadHistory
// @namespace    https://github.com/maywoodmedical/Oscar
// @description  Automatically and reliably click buttons to load patient history and medications using sequence pacing.
// @include      *oscarEncounter/oscarConsultationRequest/ConsultationFormRequest.jsp?*
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/ConsultAutoloadHistory.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/ConsultAutoloadHistory.user.js
// @version      2.0
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // List of structural Oscar layout button IDs to trigger
    const buttonIds = [
        "Concerns_clinicalInformation",
        "MedHistory_clinicalInformation",
        "SocHistory_concurrentProblems",
        "FamHistory_concurrentProblems",
        "fetchMedications_currentMedications",
        "OMeds_currentMedications",
        "fetchAllergies_allergies"
    ];

    function executePacedClicks() {
        console.log("Oscar Script: Initializing history autoload matrix...");

        buttonIds.forEach(function(buttonId, index) {
            // Introduce a brief 100ms staggered delay per button.
            // This prevents the browser from overloading Oscar's database requests simultaneously.
            setTimeout(function() {
                const button = document.getElementById(buttonId);
                if (button) {
                    button.click();
                    console.log(`Autoload: Triggered button "${buttonId}"`);
                } else {
                    console.log(`Autoload: Button id "${buttonId}" not present in this layout view.`);
                }
            }, index * 100);
        });
    }

    // =========================================================================
    // INITIALIZATION GUARDIAN
    // =========================================================================
    // Instead of waiting for a volatile 'load' event, we poll for the very first
    // target button to ensure Oscar's consult structure has generated.
    var checkAttempts = 0;
    var initialPoll = setInterval(function() {
        checkAttempts++;
        const firstTarget = document.getElementById(buttonIds[0]);

        if (firstTarget || checkAttempts > 30) {
            clearInterval(initialPoll);
            executePacedClicks();
        }
    }, 100);

})();
