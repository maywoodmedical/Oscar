// ==UserScript==
// @name         EchartAddressPageScraper
// @namespace    http://tampermonkey.net/
// @version      2.9
// @description  pulls the address from the master file and displays it in the echart header
// @author       You
// @match        *://maywoodmedicalclinic.openosp.ca/oscar/casemgmt/forward.jsp*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @connect      maywoodmedicalclinic.openosp.ca
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartAddressPageScraper.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartAddressPageScraper.user.js
// ==/UserScript==

(function() {
    'use strict';

    const urlParams = new URLSearchParams(window.location.search);
    const demoNo = urlParams.get('demographicNo');
    if (!demoNo) return;

    const masterUrl = `https://maywoodmedicalclinic.openosp.ca/oscar/demographic/demographiccontrol.jsp?demographic_no=${demoNo}&displaymode=edit&dboperation=search_detail`;

    const toTitleCase = (str) => {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    };

    const makeRequest = (options) => {
        if (typeof GM_xmlhttpRequest !== 'undefined') return GM_xmlhttpRequest(options);
        if (typeof GM !== 'undefined' && GM.xmlHttpRequest) return GM.xmlHttpRequest(options);
    };

    makeRequest({
        method: "GET",
        url: masterUrl,
        onload: function(response) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(response.responseText, "text/html");

            const getInfoByLabel = (labelText) => {
                const allLi = Array.from(doc.querySelectorAll('#contactInformation li'));
                const targetLi = allLi.find(li => li.textContent.includes(labelText));
                return targetLi ? targetLi.querySelector('.info')?.textContent.trim() : '';
            };

            const street = toTitleCase(getInfoByLabel('Address(')); 
            const city = toTitleCase(getInfoByLabel('City:'));
            const postal = getInfoByLabel('Postal :');

            // Removed province from the parts array
            const parts = [street, city, postal].filter(part => part && part.length > 0);
            const fullAddress = parts.join(', ');

            if (fullAddress.length > 3) {
                const targetContainer = document.getElementById('patient-label');
                const nextAppt = document.getElementById('patient-next-appointment');

                if (targetContainer && nextAppt) {
                    const existing = document.getElementById('patient-address');
                    if (existing) existing.remove();

                    const addressWrapper = document.createElement('div');
                    addressWrapper.id = "patient-address";
                    
                    addressWrapper.style.display = "inline-block";
                    addressWrapper.style.verticalAlign = "top";
                    addressWrapper.style.margin = "0 10px 0 0";
                    addressWrapper.style.padding = "0";
                    addressWrapper.style.textAlign = "left";
                    
                    addressWrapper.innerHTML = `
                        <div class="label" style="margin: 0; padding: 0; display: block; text-align: left;">address</div>
                        <div style="margin: 0; padding: 0; display: block; text-align: left; white-space: nowrap;">${fullAddress}</div>
                    `;
                    
                    targetContainer.insertBefore(addressWrapper, nextAppt);
                }
            }
        }
    });
})();
