// ==UserScript==
// @name        BillingTimeUnitCalculator
// @namespace   https://github.com/maywoodmedical/Oscar
// @description Calculate the number of 15 minute units after inputting start and end times
// @include     */oscar/billing.do?billRegion=BC&billForm*
// @include     */oscar/billing/CA/BC/billingBC.jsp?*
// @include     */oscar/billing/CA/BC/SaveBilling.do*
// @include     */oscar/CaseManagementEntry.do*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @updateURL https://github.com/maywoodmedical/Oscar/raw/main/BillingTimeUnitCalculator.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/main/BillingTimeUnitCalculator.user.js
// @version 1.4
// @grant       none
// ==/UserScript==

// First Button - Time Calculation
(function() {
    'use strict';

    // Create the first button
    const button1 = document.createElement('button');
    button1.innerText = 'Time';  // Label for the button
    button1.style.backgroundColor = 'green'; // Set background color to green
    button1.style.border = '1px solid green'; // Set border color to green
    button1.style.color = 'white'; // Set text color to white
    button1.className = 'btn btn-primary'; // Add any Bootstrap classes or styles you need

    // Get the target div (buttonRow)
    const targetDiv = document.getElementById('buttonRow');
    if (targetDiv) {
        // Make sure the container uses flexbox to align the buttons side by side
        targetDiv.style.display = 'flex'; // Use flexbox for horizontal layout
        targetDiv.style.alignItems = 'center'; // Vertically center items within the row

        targetDiv.appendChild(button1); // Append the first button to the same row

        // Create a feedback div for error messages
        const feedbackDiv = document.createElement('div');
        feedbackDiv.style.color = 'red';
        targetDiv.appendChild(feedbackDiv);

        // Button click event
        button1.addEventListener('click', function() {
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

// Second Button - Units Calculation (Modified to prevent default navigation)
(function() {
    'use strict';

    // Create the second button
    const button2 = document.createElement('button');
    button2.innerText = 'Units';  // Label for the second button
    button2.style.backgroundColor = 'grey'; // Set background color to blue (different from the first button)
    button2.style.border = '1px solid grey'; // Set border color to blue
    button2.style.color = 'white'; // Set text color to white for button2
    button2.className = 'btn btn-secondary'; // Bootstrap class for secondary button style

    // Get the target div (buttonRow)
    const targetDiv = document.getElementById('buttonRow');
    if (targetDiv) {
        // Make sure the container uses flexbox to align the buttons side by side
        targetDiv.style.display = 'flex'; // Use flexbox for horizontal layout
        targetDiv.style.alignItems = 'center'; // Vertically center items within the row

        // Append the second button to the same row
        targetDiv.appendChild(button2); // Append the second button to the same row

        // Create a feedback div for error messages (optional for button2)
        const feedbackDiv = document.createElement('div');
        feedbackDiv.style.color = 'red';
        targetDiv.appendChild(feedbackDiv);

        // Button click event for the second button (similar to the first one)
        button2.addEventListener('click', function(event) {
            // Prevent the default behavior (e.g., form submission, page navigation)
            event.preventDefault();

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
