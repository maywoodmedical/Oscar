// ==UserScript==
// @name         Preventions Expand
// @namespace    https://github.com/maywoodmedical/Oscar
// @version      1.5
// @description  automatically expands the Preventions sidebar on loading the echart
// @match        *://maywoodmedicalclinic.openosp.ca/oscar/casemgmt/forward.jsp?action=view&demographicNo=*
// @grant        none
// @run-at       document-idle
// @updateURL     https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/PreventionsExpand.user.js
// @downloadURL   https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/PreventionsExpand.user.js
// ==/UserScript==


(function() {
    'use strict';

    let hasClicked = false;

    function forceClick(element) {
        if (!element || hasClicked) return;

        console.log("Button detected! Starting force-click sequence...");

        // 1. Try triggering the raw onclick attribute if it exists
        if (element.getAttribute('onclick')) {
            element.onclick(); 
        }

        // 2. Simulate a full Mouse Event sequence (Down -> Click -> Up)
        const mouseEvents = ['mousedown', 'click', 'mouseup'];
        mouseEvents.forEach(type => {
            const ev = new MouseEvent(type, {
                view: window,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(ev);
        });

        hasClicked = true;
        console.log("Force-click sequence completed.");
    }

    // Use a recurring check to find the button even if it's late
    const checker = setInterval(() => {
        const btn = document.getElementById('imgpreventions5');
        if (btn) {
            forceClick(btn);
            clearInterval(checker); // Stop checking once we find it
        }
    }, 500);

    // Stop after 10 seconds to be safe
    setTimeout(() => clearInterval(checker), 10000);

})();

