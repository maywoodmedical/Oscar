// ==UserScript==
// @name        Billing Time Calculator
// @namespace   https://github.com/maywoodmedical/Oscar
// @description Calculate the number of 15 minute units after inputting start and end times
// @include     */oscar/billing.do?billRegion=BC&billForm*
// @include     */oscar/billing/CA/BC/billingBC.jsp?*
// @include     */oscar/billing/CA/BC/SaveBilling.do*
// @include     */oscar/CaseManagementEntry.do*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @updateURL https://github.com/maywoodmedical/Oscar/raw/main/BillingTimeUnitCalculator.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/main/BillingTimeUnitCalculator.user.js
// @version 1.2
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    // Create the button
    const button = document.createElement('button');
    button.innerText = 'Time';
    button.style.backgroundColor = 'green'; // Set background color to green
    button.style.border = '1px solid green'; // Set border color to green
    button.className = 'btn btn-primary'; // Add any Bootstrap classes or styles you need
     
          // Get the target div (buttonRow)
    const targetDiv = document.getElementById('buttonRow');
    if (targetDiv) {
        targetDiv.appendChild(button); // Append the button to the target div

        // Create a feedback div for error messages
        const feedbackDiv = document.createElement('div');
        feedbackDiv.style.color = 'red';
        targetDiv.appendChild(feedbackDiv);
      

        // Button click event
        button.addEventListener('click', function() {
            const startTimeInput = document.getElementById('serviceStartTime');
            const endTimeInput = document.getElementById('serviceEndTime');
            const resultInput = document.getElementById('xml_other1_unit');

            const startTime = startTimeInput.value;
            const endTime = endTimeInput.value;

            // Function to convert time string to minutes
            function timeToMinutes(timeStr) {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + minutes;
            }

            const startMinutes = timeToMinutes(startTime);
            const endMinutes = timeToMinutes(endTime);

            if (isNaN(startMinutes) || isNaN(endMinutes) || startMinutes >= endMinutes) {
                alert('Please enter valid start and end times (in 00:00 to 24:00 format). Start time must be earlier than end time.');
                return;
            }

            const differenceInMinutes = endMinutes - startMinutes;
            const increments = Math.floor(differenceInMinutes / 15);

            // Display the result
            resultInput.value = increments;
        });
    }
})();
