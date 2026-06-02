// ==UserScript==
// @name         BillingTimeUnitCalculator
// @namespace    https://github.com/maywoodmedical/Oscar
// @description  Calculate the number of 15 minute units after inputting start and end times cleanly with safety interval layouts and auto-continue automation.
// @include      */oscar/billing.do?billRegion=BC&billForm*
// @include      */oscar/billing/CA/BC/billingBC.jsp?*
// @include      */oscar/billing/CA/BC/SaveBilling.do*
// @include      */oscar/CaseManagementEntry.do*
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/BillingTimeUnitCalculator.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/BillingTimeUnitCalculator.user.js
// @version      2.1
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    function calculateBillingUnits() {
        const startTimeInput = document.getElementById('serviceStartTime');
        const endTimeInput = document.getElementById('serviceEndTime');
        const resultInput = document.getElementById('xml_other1_unit');

        if (!startTimeInput || !endTimeInput || !resultInput) {
            alert('Billing time input elements could not be resolved in this view.');
            return false;
        }

        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;

        function timeToMinutes(timeStr) {
            if (!timeStr || !timeStr.includes(':')) return NaN;
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        }

        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);

        if (isNaN(startMinutes) || isNaN(endMinutes) || startMinutes >= endMinutes) {
            alert('Please enter valid start and end times (in 00:00 to 24:00 format). Start time must be earlier than end time.');
            return false;
        }

        const differenceInMinutes = endMinutes - startMinutes;
        const increments = Math.floor(differenceInMinutes / 15);

        // Display the calculated calculation value directly inside Oscar's target unit matrix
        resultInput.value = increments;

        // Trigger a native change event to ensure any background billing validations recognize the mutation
        resultInput.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }

    function injectBillingCalculatorUI() {
        const targetDiv = document.getElementById('buttonRow');

        // Safety lock: Ensure button container exists and hasn't been injected already
        if (!targetDiv || document.getElementById('tm-time-calc-btn')) return false;

        // Force structural layout constraints to align items cleanly horizontally
        targetDiv.style.display = 'flex';
        targetDiv.style.alignItems = 'center';
        targetDiv.style.gap = '5px';

        // 1. Generate Button One ("Time") -> Calculates and advances page
        const button1 = document.createElement('button');
        button1.id = 'tm-time-calc-btn';
        button1.type = 'button';
        button1.innerText = 'Time';
        button1.style.cssText = 'background-color: green; border: 1px solid green; color: white; cursor: pointer;';
        button1.className = 'btn btn-primary';

        // 2. Generate Button Two ("Units") -> Only calculates math locally
        const button2 = document.createElement('button');
        button2.id = 'tm-units-calc-btn';
        button2.type = 'button';
        button2.innerText = 'Units';
        button2.style.cssText = 'background-color: grey; border: 1px solid grey; color: white; cursor: pointer;';
        button2.className = 'btn btn-secondary';

        // Bind logic to the "Time" trigger (Calculate + Auto-Submit Form)
        button1.addEventListener('click', function(e) {
            e.preventDefault();

            // Execute calculation first
            const isCalculatedSuccessfully = calculateBillingUnits();

            // If the time evaluation passes validation checkpoints, trace and commit the master form wrapper
            if (isCalculatedSuccessfully) {
                const billingForm = document.getElementById('serviceStartTime').closest('form');
                if (billingForm) {
                    console.log("BillingTimeUnitCalculator: Calculation complete. Auto-forwarding to Continue screen.");
                    billingForm.submit();
                } else {
                    console.warn("BillingTimeUnitCalculator: Target billing form could not be mapped for auto-submission.");
                }
            }
        });

        // Bind logic to the "Units" trigger (Calculate only)
        button2.addEventListener('click', function(e) {
            e.preventDefault();
            calculateBillingUnits();
        });

        // Append components into the active DOM row
        targetDiv.appendChild(button1);
        targetDiv.appendChild(button2);

        console.log("BillingTimeUnitCalculator: Applied buttons successfully.");
        return true;
    }

    // Run structured layout discovery loops to catch the form rendering state safely
    var injectionAttempts = 0;
    var UISelectorPoll = setInterval(function() {
        injectionAttempts++;
        var success = injectBillingCalculatorUI();
        if (success || injectionAttempts > 30) {
            clearInterval(UISelectorPoll);
        }
    }, 200);

})();
