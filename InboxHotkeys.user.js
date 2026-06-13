// ==UserScript==
// @name         InboxHotkeys
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Enter to Label, F1-F4 for Rows 1-4 Inbox items & Acknowledge/Close, Arrows for Page Nav & Text Navigation, Auto-resize Lab View and Inboxhub, Auto-space document description hyphen
// @author       Gemini
// @match        *://*.openosp.ca/oscar/web/inboxhub/Inboxhub.do*
// @match        *://*.openosp.ca/oscar/lab/CA/ALL/labDisplay.jsp*
// @match        *://maywoodmedicalclinic.openosp.ca/oscar/lab/CA/ALL/labDisplay.jsp*
// @match        *://*.openosp.ca/oscar/documentManager/inboxManage.do*
// @match        *://*.openosp.ca/oscar/documentManager/showDocument.jsp*
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/InboxHotkeys.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/InboxHotkeys.user.js
// @grant        window.close
// @allFrames    true
// ==/UserScript==

(function() {
    'use strict';

    const currentUrl = window.location.href;

    // Helper: Prevent hotkeys from firing when typing inside text boxes or textareas
    function isTyping(e) {
        const active = document.activeElement;
        if (!active) return false;
        const tag = active.tagName.toLowerCase();
        return tag === 'input' && (active.type === 'text' || active.type === 'search') || tag === 'textarea';
    }

    // --- 0. AUTO-RESIZE WINDOW HEIGHT ---
    if (currentUrl.includes("labDisplay.jsp") || currentUrl.includes("Inboxhub.do")) {
        window.addEventListener('load', () => {
            const topWin = window.top || window;
            const availableHeight = topWin.screen.availHeight;
            const currentWidth = topWin.outerWidth;
            const topPos = topWin.screen.availTop || 0;
            const leftPos = (topWin.screenLeft !== undefined) ? topWin.screenLeft : topWin.screenX;

            topWin.moveTo(leftPos, topPos);
            topWin.resizeTo(currentWidth, availableHeight);
        });
    }

    // --- 1. DOCUMENT/LAB VIEW (labDisplay.jsp OR showDocument.jsp) ---
    if (currentUrl.includes("labDisplay.jsp") || currentUrl.includes("showDocument.jsp")) {

        if (currentUrl.includes("showDocument.jsp")) {
            window.addEventListener('load', () => {
                let docDescInput = document.querySelector('input[name="documentDescription"]');
                if (docDescInput) {
                    let val = docDescInput.value;
                    if (val.endsWith('-')) {
                        let correctedValue = val + ' ';
                        docDescInput.value = correctedValue;

                        if (docDescInput.hasAttribute('data-original-value')) {
                            docDescInput.setAttribute('data-original-value', correctedValue);
                        }
                    }
                }
            });
        }

        window.addEventListener('keydown', function(e) {
            // Safety bypass: Allow Enter, F1, F2, F3, and F4 to execute even if focused inside the description field
            if (isTyping(e) && !["Enter", "F1", "F2", "F3", "F4"].includes(e.key)) return;

            if (e.key === "Enter") {
                let labelBtn = document.querySelector('button[id^="createLabel_"]');
                if (labelBtn) {
                    e.preventDefault();
                    labelBtn.click();
                }
            }

            // Intercept F1, F2, F3, or F4 to trigger Acknowledge and Close the window
            if (e.key === "F1" || e.key === "F2" || e.key === "F3" || e.key === "F4") {
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
            if (isTyping(e)) return;

            // Map keys to specific zero-based row indexes
            let targetRowIndex = -1;
            if (e.key === "F1") targetRowIndex = 0;
            if (e.key === "F2") targetRowIndex = 1;
            if (e.key === "F3") targetRowIndex = 2;
            if (e.key === "F4") targetRowIndex = 3;

            if (targetRowIndex !== -1) {
                e.preventDefault();

                // Gather all functional workflow links inside data tables
                let allLinks = Array.from(document.querySelectorAll('table tbody tr td a[href*="showDocument"], table tbody tr td a[href*="labDisplay"]'));

                // Fallback catch-all array if primary selector yields nothing
                if (allLinks.length === 0) {
                    allLinks = Array.from(document.querySelectorAll('.dataTable tbody tr a, #inboxTable tbody tr a, table tr td a'));
                }

                // Pick the specific link based on the hotkey pressed
                let targetLink = allLinks[targetRowIndex];

                if (targetLink) {
                    // Flash visual alignment confirmation dot
                    let rect = targetLink.getBoundingClientRect();
                    let dot = document.createElement('div');
                    dot.style.cssText = `
                        position: fixed;
                        top: ${rect.top + (rect.height / 2) - 5}px;
                        left: ${rect.left + 10}px;
                        width: 10px;
                        height: 10px;
                        background: ${targetRowIndex === 0 ? '#00FF00' : '#00DFFF'}; /* Green for F1, Blue/Cyan for F2-F4 */
                        border-radius: 50%;
                        z-index: 10000;
                        pointer-events: none;
                        box-shadow: 0 0 5px white;
                    `;
                    document.body.appendChild(dot);
                    setTimeout(() => dot.remove(), 800);

                    // Programmatic navigation dispatch
                    if (targetLink.getAttribute('onclick')) {
                        targetLink.click();
                    } else if (targetLink.href) {
                        window.location.href = targetLink.href;
                    }
                }
            }
        });
    }

    // --- 3. MULTI-PAGE DOCUMENT NAVIGATION (inWindow) ---
    if (currentUrl.includes("showDocument.jsp")) {
        window.addEventListener('keydown', function(e) {
            // Safety bypass: Allow ArrowLeft and ArrowRight to flip pages even if typing inside description box
            if (isTyping(e) && !["ArrowLeft", "ArrowRight"].includes(e.key)) return;

            if (e.key === "ArrowRight") {
                let nextBtn = document.querySelector('a[id^="nextP_"]');
                if (nextBtn) {
                    nextBtn.click(); // Fires page change; native behavior handles cursor moving right
                }
            }
            if (e.key === "ArrowLeft") {
                let prevBtn = document.querySelector('a[id^="prevP_"]');
                if (prevBtn) {
                    prevBtn.click(); // Fires page change; native behavior handles cursor moving left
                }
            }
        });
    }
})();
