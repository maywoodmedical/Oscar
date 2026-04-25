// ==UserScript==
// @name           ConsultDefault
// @namespace      https://github.com/maywoodmedical/Oscar
// @description    Sets the default for Consults Appointment Instructions, and hides Cortico consults panel
// @include        *oscar/oscarEncounter/oscarConsultationRequest/ConsultationFormRequest.jsp*
// @require   http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @updateURL https://github.com/maywoodmedical/Oscar/raw/main/ConsultsDefault.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/main/ConsultsDefault.user.js
// @version 1.4


(function() {
    'use strict';

    // 1. CSS INJECTION (Fastest way to hide)
    // We add a style rule to the page header so that as soon as the 
    // panel is created, the browser hides it automatically via CSS.
    const style = document.createElement('style');
    style.textContent = '#referral-receipt-panel { display: none !important; }';
    (document.head || document.documentElement).appendChild(style);

    // 2. BACKUP OBSERVER (If the plugin forces the style back to visible)
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
    // This part runs once the DOM is ready
    window.addEventListener('DOMContentLoaded', () => {
        const theDefault = 'MSP Numbers: Dr. Hoi Ling Irene Iu ("iu" NOT "Lu") 30205, Dr. Hsu-An Ann Lin 60768, Dr. Louis Wang 37475, Dr. Xuan (Linda) Wang 37588, Dr. Jeffrey Leong J2776. Thank you for informing the patient of their appointment details and forwarding us a copy.';
        const selectElem = document.getElementsByName('appointmentInstructions')[0];
        
        if (selectElem) {
            const options = selectElem.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].text.trim() === theDefault.trim()) {
                    options[i].selected = true;
                    // Trigger change event to ensure OSCAR registers the selection
                    selectElem.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
    });

})();
