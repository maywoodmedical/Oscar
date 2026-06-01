// ==UserScript==
// @name         EchartEformSearchBar
// @namespace    https://github.com/maywoodmedical/Oscar
// @description  Zero-Cache Dynamic eForm Search Bar for Oscar EMR Echarts with 250ms Debounce
// @include      *action=view&demographic*
// @include      *maywoodmedicalclinic.openosp.ca/oscar/casemgmt/*
// @include      *maywoodmedicalclinic.openosp.ca/oscar/oscarEncounter/*
// @include      *efmformslistadd.jsp*
// @include      *maywoodmedicalclinic.openosp.ca/oscar/eform/*
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartEformSearchBar.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartEformSearchBar.user.js
// @version      8.1
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var vPath = location.protocol + '//' + location.host + '/oscar/';

    // =========================================================================
    // PART 1: AUTO-POPULATE LOGIC (TRIGGERS INSTANTLY ON USER TYPING)
    // =========================================================================
    function queryLiveOscarForms(searchString, datalistElement) {
        var searchUrl = vPath + "eform/efmformslistadd.jsp?parentAjaxId=eforms";

        // Query Oscar's live eform list directly
        fetch(searchUrl)
            .then(function(response) {
                if (!response.ok) throw new Error('API Unreachable');
                return response.text();
            })
            .then(function(htmlResponse) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(htmlResponse, 'text/html');
                var links = doc.querySelectorAll("a[onclick*='popupPage']");

                // Clear out stale datalist items before adding fresh ones
                datalistElement.innerHTML = "";

                var matchedCount = 0;
                var cleanSearch = searchString.toLowerCase().trim();

                links.forEach(function(el) {
                    var formName = el.innerText || el.textContent;
                    formName = formName.replace(/[\n\r\t\*]/g, "").trim();

                    // If the form name matches what the user is typing, extract its attributes
                    if (formName.toLowerCase().includes(cleanSearch)) {
                        var onClickText = el.getAttribute("onclick") || "";
                        var urlMatch = onClickText.match(/popupPage\('(.*?)'/);

                        if (urlMatch && urlMatch[1]) {
                            var rawUrl = urlMatch[1];
                            var fidMatch = rawUrl.match(/fid=(\d+)/);

                            if (fidMatch && fidMatch[1] && matchedCount < 15) { // Cap results at 15 to keep it fast
                                var option = document.createElement('option');
                                option.value = formName;
                                option.setAttribute('data-fid', fidMatch[1]);
                                datalistElement.appendChild(option);
                                matchedCount++;
                            }
                        }
                    }
                });
            })
            .catch(function(err) {
                console.error("eForm Search Bar direct query failed: ", err);
            });
    }

    // ==========================================
    // PART 2: PLACEMENT & STRUCTURAL LAYOUT DETECTOR
    // ==========================================
    function tryInjectSearchBar() {
        if (document.getElementById('referral_name')) return true;

        var anchorContainer = document.getElementById('cppBoxes') ||
                              document.querySelector('.container-fluid') ||
                              document.getElementById('cpp_panel') ||
                              document.querySelector('.leftPanel');

        if (!anchorContainer) return false;

        // Safely pull necessary URL variables from parent frames
        var searchSource = location.search || (window.parent && window.parent.location.search) || "";
        var params = {};
        if (searchSource) {
            var parts = searchSource.substring(1).split('&');
            for (var i = 0; i < parts.length; i++) {
                var nv = parts[i].split('=');
                if (!nv[0]) continue;
                params[nv[0]] = nv[1] || true;
            }
        }

        var demoNo = params.demographicNo || params.demographic_no || "";
        if (demoNo === "null" || demoNo === true) demoNo = "";

        var appointId = params.appointmentNo || params.appointment || "";
        if (appointId === "null" || appointId === true) appointId = "";

        if (!demoNo && window.top) {
            demoNo = window.top.demographicNo || "";
        }

        // Build the physical search elements
        var searchContainer = document.createElement('div');
        searchContainer.style.cssText = 'display: inline-block; vertical-align: middle; margin: 5px; z-index: 9999;';
        searchContainer.innerHTML = "<input id='referral_name' list='CP' name='referral_name' placeholder='Search live eForms...' type='text' autocomplete='off' style='color:black; background-color:#fff; border:1px solid #ccc; padding:4px; width:202px; font-size:12px; border-radius:3px;'><datalist id='CP'></datalist>";

        anchorContainer.appendChild(searchContainer);

        var searchInput = document.getElementById("referral_name");
        var datalist = document.getElementById("CP");

        if (searchInput && datalist) {
            var debounceTimer;

            // As the user types, query Oscar directly to populate the dropdown on-the-fly
            searchInput.addEventListener("input", function(event) {
                var currentInputVal = this.value;

                // Reset the timer on every keystroke
                clearTimeout(debounceTimer);

                if (currentInputVal.length >= 2) {
                    // Set a 250ms delay window before executing the network request
                    debounceTimer = setTimeout(function() {
                        queryLiveOscarForms(currentInputVal, datalist);
                    }, 250);
                }

                // Match exact selection to launch the eForm window
                var options = datalist.querySelectorAll('option');
                var matchedOption = Array.from(options).find(function(opt) {
                    return opt.value === currentInputVal;
                });

                if (matchedOption) {
                    var targetFid = matchedOption.getAttribute('data-fid');
                    var finalLaunchUrl = vPath + "eform/efmformadd_data.jsp?fid=" + targetFid;

                    if (demoNo) finalLaunchUrl += "&demographic_no=" + demoNo;
                    if (appointId) finalLaunchUrl += "&appointment=" + appointId;
                    finalLaunchUrl += "&parentAjaxId=eforms";

                    window.open(finalLaunchUrl, '_blank', 'width=1100,height=' + screen.availHeight + ',resizable=1,scrollbars=1');
                    this.value = "";
                    this.focus();
                }
            });
        }
        return true;
    }

    // Keep checking until the layout frames build completely
    var injectionAttempts = 0;
    var pollForLayout = setInterval(function() {
        injectionAttempts++;
        var success = tryInjectSearchBar();
        if (success || injectionAttempts > 50) {
            clearInterval(pollForLayout);
        }
    }, 300);

})();
