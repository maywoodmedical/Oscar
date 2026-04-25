// ==UserScript==
// @name         InboxHotkeys
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Enter to Label, F1 to Acknowledge/Close, F1 to open next inbox item
// @author       Gemini
// @match        https://maywoodmedicalclinic.openosp.ca/oscar/lab/CA/ALL/labDisplay.jsp*
// @match        https://maywoodmedicalclinic.openosp.ca/oscar/documentManager/inboxManage.do*
// @match        https://maywoodmedicalclinic.openosp.ca/oscar/documentManager/showDocument.jsp*
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/InboxHotkeys.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/InboxHotkeys.user.js
// @grant        window.close
// ==/UserScript==

(function() {
    'use strict';

    const currentUrl = window.location.href;

    // --- 1. DOCUMENT/LAB VIEW (labDisplay.jsp OR showDocument.jsp) ---
    if (currentUrl.includes("labDisplay.jsp") || currentUrl.includes("showDocument.jsp")) {
        window.addEventListener('keydown', function(e) {
            
            // Press Enter to click the Label button
            if (e.key === "Enter") {
                let labelBtn = document.querySelector('button[id^="createLabel_"]');
                if (labelBtn) {
                    e.preventDefault();
                    labelBtn.click();
                }
            }

            // Press F1 to click Acknowledge and Close the window
            if (e.key === "F1") {
                let ackBtn = document.querySelector('input[value="Acknowledge"]');
                if (ackBtn) {
                    e.preventDefault();
                    ackBtn.click();
                    
                    // Small delay to allow the acknowledge command to hit the server
                    setTimeout(() => {
                        window.close();
                    }, 500);
                }
            }
        });
    }

    // --- 2. MASTER INBOX LIST (inboxManage.do) ---
    if (currentUrl.includes("inboxManage.do")) {
        window.addEventListener('keydown', function(e) {
            
            if (e.key === "F1") {
                e.preventDefault();
                
                // --- CALIBRATION AREA ---
                const x = 500; 
                const y = 390; 

                // Create a temporary Visual Tracker (Red Dot)
                let dot = document.createElement('div');
                dot.style.cssText = `
                    position: fixed; 
                    top: ${y - 5}px; 
                    left: ${x - 5}px; 
                    width: 10px; 
                    height: 10px; 
                    background: red; 
                    border-radius: 50%; 
                    z-index: 10000; 
                    pointer-events: none;
                    box-shadow: 0 0 5px white;
                `;
                document.body.appendChild(dot);
                setTimeout(() => dot.remove(), 1200);

                // Find the element at the pixel
                let targetEl = document.elementFromPoint(x, y);

                if (targetEl) {
                    let clickTarget = targetEl;
                    if (targetEl.tagName !== 'A') {
                        const internalLink = targetEl.querySelector('a') || targetEl.closest('tr')?.querySelector('a');
                        if (internalLink) clickTarget = internalLink;
                    }

                    const clickEvent = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y
                    });
                    
                    clickTarget.dispatchEvent(clickEvent);

                    if (clickTarget.href && clickTarget.tagName === 'A') {
                        if (clickTarget.getAttribute('onclick')) {
                             clickTarget.click(); 
                        } else {
                             window.location.href = clickTarget.href;
                        }
                    }
                }
            }
        });
    }
})();	
