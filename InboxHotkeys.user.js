// ==UserScript==
// @name         InboxHotkeys
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Enter to Label, F1 to Acknowledge/Close, F1 to open next inbox item, Arrows for Page Nav, Auto-resize Lab View and Inboxhub, Auto-space document description hyphen
// @author       Gemini
// @match        https://maywoodmedicalclinic.openosp.ca/oscar/web/inboxhub/Inboxhub.do?*
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

    // --- 0. AUTO-RESIZE WINDOW HEIGHT ---
    if (currentUrl.includes("labDisplay.jsp") || currentUrl.includes("Inboxhub.do")) {
        window.addEventListener('load', () => {
            const availableHeight = window.screen.availHeight;
            const currentWidth = window.outerWidth;
            const topPos = window.screen.availTop || 0;
            const leftPos = window.screenLeft || window.screenX;

            window.moveTo(leftPos, topPos);
            window.resizeTo(currentWidth, availableHeight);
        });
    }

    // --- 1. DOCUMENT/LAB VIEW (labDisplay.jsp OR showDocument.jsp) ---
    if (currentUrl.includes("labDisplay.jsp") || currentUrl.includes("showDocument.jsp")) {
        
        // Fix trailing hyphen missing a space on document description fields
        if (currentUrl.includes("showDocument.jsp")) {
            window.addEventListener('load', () => {
                let docDescInput = document.querySelector('input[name="documentDescription"]');
                if (docDescInput) {
                    let val = docDescInput.value;
                    // If it ends with a hyphen and NOT followed by a space
                    if (val.endsWith('-')) {
                        let correctedValue = val + ' ';
                        docDescInput.value = correctedValue;
                        
                        // Update the data-original-value attribute so native OSCAR blur events don't break it
                        if (docDescInput.hasAttribute('data-original-value')) {
                            docDescInput.setAttribute('data-original-value', correctedValue);
                        }
                    }
                }
            });
        }

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
                    
                    setTimeout(() => {
                        window.close();
                    }, 500);
                }
            }
        });
    }

    // --- 2. MASTER INBOX LIST (Inboxhub.do OR inboxManage.do) ---
    if (currentUrl.includes("Inboxhub.do") || currentUrl.includes("inboxManage.do")) {
        window.addEventListener('keydown', function(e) {
            if (e.key === "F1") {
                e.preventDefault();
                
                const x = 330; 
                const y = 155; 

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

    // --- 3. MULTI-PAGE DOCUMENT NAVIGATION (inWindow) ---
    if (currentUrl.includes("showDocument.jsp?inWindow")) {
        window.addEventListener('keydown', function(e) {
            if (e.key === "ArrowRight") {
                let nextBtn = document.querySelector('a[id^="nextP_"]');
                if (nextBtn) {
                    nextBtn.click();
                }
            }
            if (e.key === "ArrowLeft") {
                let prevBtn = document.querySelector('a[id^="prevP_"]');
                if (prevBtn) {
                    prevBtn.click();
                }
            }
        });
    }
})();
