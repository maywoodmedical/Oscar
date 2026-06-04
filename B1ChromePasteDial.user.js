// ==UserScript==
// @name         B1ChromePasteDial
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  Injects 'Paste & Dial' directly next to the native B1 CallIcon SVG
// @author       You
// @match        https://core2.b1communications.ca/*
// @grant        none
// @run-at       document-end
// @updateURL    
// @downloadURL  
// ==/UserScript==

(function() {
    'use strict';

    function injectInlineButton() {
        // Find the native Call Icon based on your exact SVG data-testid
        const callIcon = document.querySelector('svg[data-testid="CallIcon"]');
        if (!callIcon) return;

        // Target the clickable parent wrapper (usually a button element)
        const nativeCallTarget = callIcon.closest('button') || callIcon;

        // Prevent duplicate injections next to this specific button
        if (nativeCallTarget.parentNode.querySelector('#b1-inline-paste-btn')) return;

        // Create the custom inline button
        const btn = document.createElement('button');
        btn.id = 'b1-inline-paste-btn';
        btn.innerText = 'Paste & Dial';
        btn.type = 'button';

        // Styled cleanly with Material-UI standards to blend in smoothly
        btn.style.cssText = `
            margin-left: 8px;
            margin-right: 8px;
            padding: 6px 14px;
            background-color: #2b7de9;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            font-family: sans-serif;
            font-size: 13px;
            box-shadow: 0px 2px 4px rgba(0,0,0,0.1);
            display: inline-flex;
            align-items: center;
            vertical-align: middle;
        `;

        // Insert our button directly into the layout block next to the native call button
        nativeCallTarget.parentNode.insertBefore(btn, nativeCallTarget.nextSibling);

        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            try {
                const clipboardText = await navigator.clipboard.readText();
                const cleanNumber = clipboardText.replace(/\D/g, '');

                if (cleanNumber.length >= 7) {
                    // Locate the nearest numeric input field relative to the button layout
                    const inputField = document.querySelector('input.dialer-number') ||
                                       document.querySelector('input[placeholder*="number" i]') ||
                                       document.querySelector('input[type="text"]');

                    if (inputField) {
                        inputField.focus();

                        // Deep hook to bypass React's virtual DOM block tracking
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                        nativeInputValueSetter.call(inputField, cleanNumber);

                        // Broadcast changes down the UI engine chain
                        inputField.dispatchEvent(new Event('input', { bubbles: true }));
                        inputField.dispatchEvent(new Event('change', { bubbles: true }));

                        // Fire native Enter key sequence down the input lane
                        setTimeout(() => {
                            const keyEvents = ['keydown', 'keypress', 'keyup'];
                            keyEvents.forEach(type => {
                                const kEvent = new KeyboardEvent(type, {
                                    key: 'Enter',
                                    code: 'Enter',
                                    keyCode: 13,
                                    which: 13,
                                    bubbles: true,
                                    cancelable: true,
                                    view: window
                                });
                                inputField.dispatchEvent(kEvent);
                            });

                            // Backup click sequence down the hardware path directly onto the native button
                            ['mousedown', 'mouseup', 'click'].forEach(type => {
                                const mEvent = new MouseEvent(type, {
                                    bubbles: true,
                                    cancelable: true,
                                    view: window
                                });
                                nativeCallTarget.dispatchEvent(mEvent);
                            });
                        }, 50);

                    } else {
                        // Fallback if the UI input structure is completely unmounted/abstracted
                        alert(`Number ready (${cleanNumber}). Click inside the phone box and press enter manually.`);
                    }
                }
            } catch (err) {
                console.error('B1 Inline Dialer Intercept Error: ', err);
            }
        });
    }

    // Continuously check to insert button smoothly if B1 scripts refresh components dynamically
    setInterval(injectInlineButton, 800);
    injectInlineButton();
})();
