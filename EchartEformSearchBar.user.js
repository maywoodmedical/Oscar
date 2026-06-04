// ==UserScript==
// @name         EchartEformSearchBar
// @namespace    https://github.com/maywoodmedical/Oscar
// @description  Zero-Cache Dynamic eForm Search Bar for Oscar EMR Echarts with 200ms Debounce
// @include      *action=view&demographic*
// @include      *maywoodmedicalclinic.openosp.ca/oscar/casemgmt/forward.jsp?action=view&demographicNo=*
// @include      *efmformslistadd.jsp*
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartEformSearchBar.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartEformSearchBar.user.js
// @version      8.14
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var vPath = location.protocol + '//' + location.host + '/oscar/';

    // =========================================================================
    // PART 0: AUTO-EXPAND LIST ON EFORM LIST PAGE
    // =========================================================================
    function expandEformListToAll() {
        if (location.pathname.includes('efmformslistadd.jsp')) {
            var lengthSelect = document.querySelector('select[name="efmTable_length"]');
            if (lengthSelect && lengthSelect.value !== "-1") {
                lengthSelect.value = "-1";
                var event = new Event('change', { bubbles: true });
                lengthSelect.dispatchEvent(event);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', expandEformListToAll);
    } else {
        expandEformListToAll();
    }

    if (location.pathname.includes('efmformslistadd.jsp')) {
        var pageObserver = new MutationObserver(function(mutations, obs) {
            var lengthSelect = document.querySelector('select[name="efmTable_length"]');
            if (lengthSelect) {
                expandEformListToAll();
                obs.disconnect();
            }
        });
        pageObserver.observe(document.body, { childList: true, subtree: true });
    }

    // =========================================================================
    // PART 1: AUTO-POPULATE LOGIC (TRIGGERS INSTANTLY ON USER TYPING)
    // =========================================================================
    function queryLiveOscarForms(searchString, datalistElement) {
        var searchUrl = vPath + "eform/efmformslistadd.jsp?parentAjaxId=eforms";

        fetch(searchUrl)
            .then(function(response) {
                if (!response.ok) throw new Error('API Unreachable');
                return response.text();
            })
            .then(function(htmlResponse) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(htmlResponse, 'text/html');
                var links = doc.querySelectorAll("a[onclick*='popupPage']");

                datalistElement.innerHTML = "";

                var matchedCount = 0;
                var cleanSearch = searchString.toLowerCase().trim();

                links.forEach(function(el) {
                    var formName = el.innerText || el.textContent;
                    formName = formName.replace(/[\n\r\t\*]/g, "").trim();

                    if (formName.toLowerCase().includes(cleanSearch)) {
                        var onClickText = el.getAttribute("onclick") || "";
                        var urlMatch = onClickText.match(/popupPage\('(.*?)'/);

                        if (urlMatch && urlMatch[1]) {
                            var rawUrl = urlMatch[1];
                            var fidMatch = rawUrl.match(/fid=(\d+)/);

                            if (fidMatch && fidMatch[1] && matchedCount < 15) {
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
        if (document.getElementById('oscar_live_eform_search')) return true;

        // Look for the CareConnect targets
        var careConnectBtn = document.querySelector("input[onclick*='callCareConnect']") ||
                             document.querySelector("input[title*='Care Connect']") ||
                             document.querySelector("input[value='CareConnect']");

        var anchorContainer = null;
        var insertBeforeTarget = null;

        if (careConnectBtn) {
            anchorContainer = careConnectBtn.parentNode;
            insertBeforeTarget = careConnectBtn;
        } else {
            // If CareConnect isn't found, check if the general eChart panel layout containers exist yet
            var globalFallback = document.getElementById('cppBoxes') ||
                                 document.querySelector('.container-fluid') ||
                                 document.getElementById('cpp_panel') ||
                                 document.querySelector('.leftPanel');

            // If even the base layout wrappers aren't built, exit this specific frame check and try again next poll
            if (!globalFallback) return false;

            // If we are past 25 attempts (~5+ seconds of page load) and CareConnect still hasn't arrived,
            // default to the global layout fallback so the search bar isn't lost permanently.
            if (injectionAttempts >= 25) {
                anchorContainer = globalFallback;
            } else {
                return false;
            }
        }

        if (!anchorContainer) return false;

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

        // Expanded param checks to cover exact case sensitivity options found on forward.jsp
        var demoNo = params.demographicNo || params.demographic_no || "";
        if (demoNo === "null" || demoNo === true) demoNo = "";

        var appointId = params.appointmentNo || params.appointment || "";
        if (appointId === "null" || appointId === true) appointId = "";

        if (!demoNo && window.top) {
            demoNo = window.top.demographicNo || "";
        }

        var searchContainer = document.createElement('div');
        // Applied the explicit width and layout rules safely to the container and the internal input tag
        searchContainer.style.cssText = 'display: inline-block; vertical-align: bottom; margin-right: 4px; width: 250px;';
        searchContainer.innerHTML = "<input id='oscar_live_eform_search' list='CP' name='oscar_live_eform_search' placeholder='Search eForms...' type='text' autocomplete='off' style='width: 100%; box-sizing: border-box;'><datalist id='CP'></datalist>";

        if (insertBeforeTarget) {
            anchorContainer.insertBefore(searchContainer, insertBeforeTarget);
        } else {
            anchorContainer.appendChild(searchContainer);
        }

        var searchInput = document.getElementById("oscar_live_eform_search");
        var datalist = document.getElementById("CP");

        if (searchInput && datalist) {
            var debounceTimer;

            searchInput.addEventListener("input", function(event) {
                var currentInputVal = this.value;

                clearTimeout(debounceTimer);

                if (currentInputVal.length >= 2) {
                    debounceTimer = setTimeout(function() {
                        queryLiveOscarForms(currentInputVal, datalist);
                    }, 200);
                }

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

    var injectionAttempts = 0;
    var pollForLayout = setInterval(function() {
        injectionAttempts++;
        var success = tryInjectSearchBar();
        if (success) {
            clearInterval(pollForLayout);
        }
    }, 250);

})();
