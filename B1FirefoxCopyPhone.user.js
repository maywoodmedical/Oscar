// ==UserScript==
// @name         B1FirefoxCopyPhone
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Targets precise OSCAR phone divs and copies digits to clipboard on click
// @author       You
// @match        https://maywoodmedicalclinic.openosp.ca/oscar/*
// @grant        GM_setClipboard
// @run-at       document-end
// @updateURL    
// @downloadURL  
// ==/UserScript==

(function() {
    'use strict';

    // Target the specific IDs from your OSCAR HTML layout
    const PHONE_SELECTORS = '#patient-phone, #patient-cell-phone';

    function setupClickToCopy() {
        const phoneElements = document.querySelectorAll(PHONE_SELECTORS);

        phoneElements.forEach(el => {
            // Skip if we already processed this element to avoid infinite loops
            if (el.getAttribute('data-clipboard-linked')) return;

            // Clone the element so we can safely strip the label text without breaking OSCAR styling
            const clone = el.cloneNode(true);
            const labelNode = clone.querySelector('.label');
            if (labelNode) {
                labelNode.remove(); // Removes the text "cell" or "phone"
            }

            const rawText = clone.textContent.trim();
            const cleanNumber = rawText.replace(/\D/g, ''); // Keeps only the pure digits

            if (cleanNumber.length >= 7) {
                // Keep the original label HTML prefix intact if it exists
                const labelHTML = el.querySelector('.label') ? el.querySelector('.label').outerHTML : '';

                // Inject the clickable trigger link using inherit to preserve native fonts exactly
                el.innerHTML = `${labelHTML}<span class="fx-dial-btn" style="color: #0066cc; font-family: inherit; font-size: inherit; font-weight: inherit; cursor: pointer; text-decoration: none; margin-left: 6px;">${rawText}</span>`;

                const dialBtn = el.querySelector('.fx-dial-btn');

                // Add a subtle underline on hover just for visual clarity
                dialBtn.addEventListener('mouseenter', () => dialBtn.style.textDecoration = 'underline');
                dialBtn.addEventListener('mouseleave', () => dialBtn.style.textDecoration = 'none');

                dialBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Securely pass the stripped phone digits to your computer's OS clipboard
                    GM_setClipboard(cleanNumber);

                    // Flash green to visually verify the copy was successful
                    const originalColor = dialBtn.style.color;
                    dialBtn.style.color = '#28a745';
                    setTimeout(() => dialBtn.style.color = originalColor, 800);
                });

                el.setAttribute('data-clipboard-linked', 'true');
            }
        });
    }

    // Run continuously via observer to handle patient switching/dynamic frames in OSCAR
    const observer = new MutationObserver(() => setupClickToCopy());
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial runtime loop execution
    setupClickToCopy();
})();
