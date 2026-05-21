// ==UserScript==
// @name        EchartEformSearchBar
// @namespace   https://github.com/maywoodmedical/Oscar
// @description Automatically loads and filters all eForms using background fetching without requiring manual caching pages
// @include     *action=view&demographic*
// @include     *maywoodmedicalclinic.openosp.ca/oscar/oscarEncounter/*
// @include     *efmformslistadd.jsp*
// @include     *maywoodmedicalclinic.openosp.ca/oscar/eform/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1.3.1/jquery.min.js
// @updateURL   https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartEformSearchBar.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartEformSearchBar.user.js
// @version     5.3
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
        var oneDay = 24 * 60 * 60 * 1000; // 24 hours

        var cachedData = localStorage.getItem(cacheKey);
        var lastSync = localStorage.getItem(timeKey);

        if (cachedData && lastSync && (now - lastSync < oneDay)) {
            console.log("eForm Search Bar: Local cache is fresh. Skipping fetch.");
            return;
        }

        console.log("eForm Search Bar: Initializing background sync...");
        var targetUrl = vPath + "eform/efmformslistadd.jsp?parentAjaxId=eforms";

        $.ajax({
            url: targetUrl,
            type: 'GET',
            success: function(htmlResponse) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(htmlResponse, 'text/html');
                var links = doc.querySelectorAll("a[onclick*='popupPage']");
                var eFormCache = [];

                if (links.length > 0) {
                    links.forEach(function(el) {
                        var onClickText = el.getAttribute("onclick") || "";
                        var urlMatch = onClickText.match(/popupPage\('(.*?)'/);
                        
                        if (urlMatch && urlMatch[1]) {
                            var rawUrl = urlMatch[1]; 
                            
                            // ISOLATION FIX: Extract JUST the Form ID (fid) number and discard everything else
                            var fidMatch = rawUrl.match(/fid=(\d+)/);
                            if (fidMatch && fidMatch[1]) {
                                var cleanFid = fidMatch[1];
                                
                                var formName = el.innerText || el.textContent;
                                formName = formName.replace(/[\n\r\t\*]/g, "").trim();

                                if (formName && !formName.toLowerCase().includes("delete") && !formName.toLowerCase().includes("edit")) {
                                    // Save only the strict form ID number instead of a messy URL path string
                                    eFormCache.push({ name: formName, fid: cleanFid });
                                }
                            }
                        }
                    });

                    if (eFormCache.length > 0) {
                        localStorage.setItem(cacheKey, JSON.stringify(eFormCache));
                        localStorage.setItem(timeKey, now.toString());
                        console.log("eForm Search Bar Sync Success: Indexed " + eFormCache.length + " forms.");
                        
                        if (typeof populateDropdown === "function") {
                            populateDropdown();
                        }
                    }
                }
            },
            error: function(err) {
                console.error("eForm Search Bar: Sync failed.", err);
            }
        });
    }

    // ==========================================
    // PART 1: RUNNING ON THE EFORM LIST PAGE
    // ==========================================
    if (location.pathname.includes("efmformslistadd.jsp") || location.search.includes("parentAjaxId=eforms")) {
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
        
        var demoNo = params.demographic_no || params.demographicNo || "";
        if (demoNo === "null" || demoNo === true) demoNo = "";
        
        var appointId = params.appointment || "";
        if (appointId === "null" || appointId === true) appointId = "";

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

        document.getElementById("referral_name").addEventListener("input", function(event) {
            var selectedName = $(this).val();
            var cachedData = localStorage.getItem("oscar_eform_directory");

            if (cachedData) {
                var forms = JSON.parse(cachedData);
                var matchedForm = forms.find(function(f) {
                    return f.name === selectedName;
                });

                if (matchedForm) {
                    // CRITICAL FIX: Build the URL perfectly cleanly from scratch using just the ID
                    var targetFid = matchedForm.fid;
                    var finalLaunchUrl = vPath + "eform/efmformadd_data.jsp?fid=" + targetFid;
                    
                    if (demoNo) {
                        finalLaunchUrl += "&demographic_no=" + demoNo;
                    }
                    if (appointId) {
                        finalLaunchUrl += "&appointment=" + appointId;
                    }
                    
                    finalLaunchUrl += "&parentAjaxId=eforms";
                    
                    window.open(finalLaunchUrl);
                    $(this).val("");
                    this.focus();
                }
            }
        });
    });
})();
