// ==UserScript==
// @name        EchartEformSearchBar
// @namespace   https://github.com/maywoodmedical/Oscar
// @description adds a search bar for eforms in the echart
// @include    *efmformslistadd.jsp*
// @include     */casemgmt/forward.jsp?action=view&demographic*
// @require   http://ajax.googleapis.com/ajax/libs/jquery/1.3.1/jquery.min.js
// @updateURL https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartEformSearchBar.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartEformSearchBar.user.js
// @version     2.0
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    var vPath = location.protocol + '//' + location.host + '/oscar/';

    // Helper function to silently fetch and cache all eForms via background AJAX
    function silentlyFetchAllEforms() {
        var cacheKey = "oscar_eform_directory";
        var timeKey = "oscar_eform_directory_timestamp";
        var now = new Date().getTime();
        var oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        var cachedData = localStorage.getItem(cacheKey);
        var lastSync = localStorage.getItem(timeKey);

        // Safety gate: Skip background request if data exists and is less than 24 hours old
        if (cachedData && lastSync && (now - lastSync < oneDay)) {
            console.log("eForm Search Bar: Local cache is fresh (less than 24h old). Skipping background fetch.");
            return;
        }

        console.log("eForm Search Bar: Initializing silent background directory fetch...");
        
        // Target the master list page directly using standard parameters that output the full list
        var targetUrl = vPath + "eform/efmformslistadd.jsp?parentAjaxId=eforms";

        $.ajax({
            url: targetUrl,
            type: 'GET',
            success: function(htmlResponse) {
                // Parse the string response into a hidden DOM element
                var parser = new DOMParser();
                var doc = parser.parseFromString(htmlResponse, 'text/html');
                
                // Grab all popupPage target anchor links found inside the raw webpage response
                var links = doc.querySelectorAll("a[onclick*='popupPage']");
                var eFormCache = [];

                if (links.length > 0) {
                    links.forEach(function(el) {
                        var onClickText = el.getAttribute("onclick") || "";
                        var urlMatch = onClickText.match(/popupPage\('(.*?)'/);
                        
                        if (urlMatch && urlMatch[1]) {
                            var rawUrl = urlMatch[1]; 
                            var cleanUrl = rawUrl.replace(/&demographic_no=\d+/, "")
                                                 .replace(/&appointment=[^&]*/, "");
                            
                            var formName = el.innerText || el.textContent;
                            formName = formName.replace(/[\n\r\t\*]/g, "").trim();

                            if (formName && !formName.toLowerCase().includes("delete") && !formName.toLowerCase().includes("edit")) {
                                eFormCache.push({ name: formName, link: cleanUrl });
                            }
                        }
                    });

                    if (eFormCache.length > 0) {
                        localStorage.setItem(cacheKey, JSON.stringify(eFormCache));
                        localStorage.setItem(timeKey, now.toString());
                        console.log("eForm Search Bar Silent Sync Success: Saved " + eFormCache.length + " items background style.");
                        
                        // Force update the dropdown visual layout instantly if on the eChart page
                        if (typeof populateDropdown === "function") {
                            populateDropdown();
                        }
                    }
                }
            },
            error: function(err) {
                console.error("eForm Search Bar: Background synchronization fetch failed.", err);
            }
        });
    }

    // ==========================================
    // PART 1: RUNNING ON THE EFORM LIST PAGE (Fallback Sync Entry)
    // ==========================================
    if (location.pathname.includes("efmformslistadd.jsp") || location.search.includes("parentAjaxId=eforms")) {
        // If you happen to visit the main page anyway, let it force-set a manual override cache update
        var forceShowAll = setInterval(function() {
            var lengthDropdown = document.querySelector("select[name='efmTable_length']");
            if (lengthDropdown) {
                clearInterval(forceShowAll);
                if (lengthDropdown.value !== "-1") {
                    lengthDropdown.value = "-1";
                    var event = document.createEvent('HTMLEvents');
                    event.initEvent('change', true, false);
                    lengthDropdown.dispatchEvent(event);
                }
            }
        }, 100);
        setTimeout(function() { clearInterval(forceShowAll); }, 4000);
        return; 
    }

    // ==========================================
    // PART 2: RUNNING ON THE MAIN PATIENT ECHART
    // ==========================================
    $(document).ready(function() {
        if ($('#referral_name').length > 0) return; 

        // Fire off our silent background network fetch validation sequence
        silentlyFetchAllEforms();

        var params = {}; 
        if (location.search) {
            var parts = location.search.substring(1).split('&');
            for (var i = 0; i < parts.length; i++) {
                var nv = parts[i].split('=');
                if (!nv[0]) continue;
                params[nv[0]] = nv[1] || true;
            }
        }
        var demoNo = params.demographic_no || params.demographicNo;

        // Setup the search input bar layout template frame
        var searchbar = "<input id='referral_name' list='CP' name='referral_name' placeholder='Search eForms...' type='text' autocomplete='off' style='color:black; background-color:#fff; border:1px solid #ccc; padding:3px; margin-left:5px;'><datalist id='CP'></datalist>";
        $('#cppBoxes').append(searchbar);
        $('#referral_name').width("202px");

        window.populateDropdown = function() {
            var cachedData = localStorage.getItem("oscar_eform_directory");
            if (cachedData) {
                var forms = JSON.parse(cachedData);
                var datalist = $('#CP');
                datalist.empty(); 
                
                forms.forEach(function(form) {
                    datalist.append($("<option>").attr('value', form.name));
                });
            }
        };

        populateDropdown();

        // Execution monitor: Listens for text input selection triggers
        document.getElementById("referral_name").addEventListener("input", function(event) {
            var selectedName = $(this).val();
            var cachedData = localStorage.getItem("oscar_eform_directory");

            if (cachedData) {
                var forms = JSON.parse(cachedData);
                var matchedForm = forms.find(function(f) {
                    return f.name === selectedName;
                });

                if (matchedForm) {
                    var baseFormUrl = matchedForm.link; 
                    var finalLaunchUrl = vPath + "eform/" + baseFormUrl + "&demographic_no=" + demoNo + "&appointment=null&parentAjaxId=eforms";
                    
                    window.open(finalLaunchUrl);
                    $(this).val("");
                    this.focus();
                }
            }
        });
    });
})();

