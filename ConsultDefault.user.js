// ==UserScript==
// @name            ConsultDefault
// @namespace       https://github.com/maywoodmedical/Oscar
// @description     Sets the default for Consults Appointment Instructions, and hides Cortico consults panel
// @include         *oscar/oscarEncounter/oscarConsultationRequest/ConsultationFormRequest.jsp*
// @updateURL       https://github.com/maywoodmedical/Oscar/raw/main/ConsultsDefault.user.js
// @downloadURL     https://github.com/maywoodmedical/Oscar/raw/main/ConsultsDefault.user.js
// @version         2.0
// @grant           none
// @run-at          document-end
// ==/UserScript==

(function() {
    'use strict';

    // 1. CSS INJECTION (Fastest way to hide Cortico panel)
    const style = document.createElement('style');
    style.textContent = '#referral-receipt-panel { display: none !important; }';
    (document.head || document.documentElement).appendChild(style);

    // 2. BACKUP OBSERVER (If Cortico forcefully changes layout properties)
    const observer = new MutationObserver((mutations) => {
        const panel = document.getElementById('referral-receipt-panel');
        if (panel && panel.style.display !== 'none') {
            panel.style.setProperty('display', 'none', 'important');
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // 3. SET DEFAULT APPOINTMENT INSTRUCTIONS
    // Runs automatically because @run-at document-end guarantees the DOM elements are ready
    function setAppointmentInstructions() {
        const theDefault = 'MSP Numbers: Dr. Hoi Ling Irene Iu ("iu" NOT "Lu") 30205, Dr. Hsu-An Ann Lin 60768, Dr. Louis Wang 37475, Dr. Xuan (Linda) Wang 37588, Dr. Jeffrey Leong J2776. Thank you for informing the patient of their appointment details and forwarding us a copy.';
        const selectElem = document.getElementsByName('appointmentInstructions')[0];

        if (selectElem) {
            const options = selectElem.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].text.trim() === theDefault.trim()) {
                    options[i].selected = true;

                    // Trigger native change events so Oscar registers data mutation cleanly
                    selectElem.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log("ConsultDefault: Default instructions set successfully.");
                    return true;
                }
            }
        }
        return false;
    }

    // Run immediately since the DOM is already accessible
    var success = setAppointmentInstructions();

    // Fallback polling loop in case Oscar's dropdown template elements render asynchronously
    if (!success) {
        var attempts = 0;
        var pollTimer = setInterval(function() {
            attempts++;
            var dynamicSuccess = setAppointmentInstructions();
            if (dynamicSuccess || attempts > 20) {
                clearInterval(pollTimer);
            }
        }, 150);
    }

})();
