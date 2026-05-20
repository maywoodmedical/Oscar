// ==UserScript==
// @name         LabAutoTickler
// @namespace    https://github.com/maywoodmedical/Oscar
// @description  Quicklink to preventions and autotickler panel 
// @match        *://*.openosp.ca/oscar/lab/*labDisplay.jsp*
// @match        *://*.openosp.ca/oscar/dms/MultiPageDocDisplay.jsp*
// @match        *://*.openosp.ca/oscar/dms/showDocument.jsp*
// @match        *://*.openosp.ca/oscar/documentManager/showDocument.jsp*
// @match        *://*.openosp.ca/oscar/tickler/ForwardDemographicTickler.do*
// @match        *://*.openosp.ca/oscar/tickler/ticklerAdd.jsp*
// @run-at       document-end
// @allFrames    true
// @grant        none
// @version      7.5
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/LabAutotickler.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/LabAutotickler.user.js
// ==/UserScript==

(function() {
    'use strict';

    var hostPath = window.location.origin + "/oscar/";

    // --- Parse URL Parameters Safely ---
    var params = {};
    if (location.search) {
        var parts = location.search.substring(1).split('&');
        for (var i = 0; i < parts.length; i++) {
            var nv = parts[i].split('=');
            if (!nv[0]) continue;
            params[nv[0]] = decodeURIComponent(nv[1] || true);
        }
    }

    // --- Dynamic Patient ID Finder ---
    function findDemographicNo() {
        if (params.demographic_no) return params.demographic_no;
        if (params.demographicNo) return params.demographicNo;
        if (params.demographicId) return params.demographicId;

        var inputs = document.querySelectorAll('input[name="demographic_no"], input[name="demographicNo"], input[name="demog"], input[name="demographicid"]');
        if (inputs.length > 0 && inputs[0].value) return inputs[0].value;

        var links = document.querySelectorAll('a[href], a[onclick]');
        for (var i = 0; i < links.length; i++) {
            var src = links[i].getAttribute('href') || links[i].getAttribute('onclick') || '';
            var match = src.match(/demographic_no=(\d+)/) || src.match(/demographicNo=(\d+)/) || src.match(/demo=(\d+)/);
            if (match && match[1]) return match[1];
        }
        return null;
    }

    var demono = findDemographicNo();

    // --- Core UI Arrays ---
    var AA = [
        ['Mammogram', ''], ['Pap', ''], ['Colonoscopy', ''], ['PSA', ''], ['HPV', ''], ['FIT', ''], ['Bone Density', ''],
        ['<input type="text" id="myOther" name="Other" style="border:1px solid #ccc; padding:2px; width:100px;">', 'Other']
    ];

    var AB = [
        ['6 months', '182'], ['One year', '360'], ['Two years', '720'], ['Three years', '1080'], ['Five years', '1800'], ['Ten years', '3600'],
        ['<input type="text" id="Days" name="Days" size="4" style="border:1px solid #ccc; width:40px;"> <label for="Days">Months</label>', 'Months'],
        ['<input type="text" id="Years" name="Years" size="4" style="border:1px solid #ccc; width:40px;"> <label for="Years">Years</label>', 'Years'],
        ['Now', '0']
    ];

    // --- Initialize UI ---
    function init() {
        if (!demono) demono = findDemographicNo();
        if (!demono || parseInt(demono) <= 0) return;

        if (window.location.href.includes('bFirstDisp=false') || window.location.href.includes('parentAjaxId=')) return;

        if (window.location.pathname.includes('labDisplay.jsp') || window.location.pathname.includes('showDocument.jsp') || window.location.pathname.includes('MultiPageDocDisplay.jsp')) {
            
            if (document.getElementById('AutoTicklerBar')) return;

            var btnContainer = document.createElement('div');
            btnContainer.id = 'AutoTicklerBar';
            
            btnContainer.style.position = 'absolute';
            btnContainer.style.right = '10px';
            btnContainer.style.top = '60px';
            btnContainer.style.zIndex = '99999';
            btnContainer.style.display = 'flex';
            btnContainer.style.flexDirection = 'row'; 
            btnContainer.style.gap = '4px';

            function createBtn(label, onClickFn) {
                var btn = document.createElement('input');
                btn.type = 'button';
                btn.value = label;
                btn.style.marginRight = '0px';
                btn.style.cursor = 'pointer';
                btn.addEventListener('click', onClickFn);
                return btn;
            }

            btnContainer.appendChild(createBtn('AutoTickler', function() { 
                var existing = document.getElementById('TicklerInlinePanel');
                if (existing) {
                    existing.remove();
                } else {
                    showInlinePanel(); 
                }
            }));
            btnContainer.appendChild(createBtn('FIT', function() { openPrev('FOBT'); }));
            btnContainer.appendChild(createBtn('Pap', function() { openPrev('PAP'); }));
            btnContainer.appendChild(createBtn('HPV', function() { openPrev('HPV-CERVIX'); }));
            btnContainer.appendChild(createBtn('Mam', function() { openPrev('MAM'); }));
            btnContainer.appendChild(createBtn('Col', function() { openPrev('COLONOSCOPY'); }));
            btnContainer.appendChild(createBtn('BMD', function() { openPrev('BMD'); }));

            document.body.appendChild(btnContainer);
        }
    }

    function openPrev(code) {
        window.open(hostPath + 'oscarPrevention/AddPreventionData.jsp?prevention=' + code + '&demographic_no=' + demono + '&prevResultDesc=', 'prevWin', 'width=800,height=600');
    }

    // --- Inline Checkbox Selection Interface ---
    function showInlinePanel() {
        var existing = document.getElementById('TicklerInlinePanel');
        if (existing) existing.remove();

        var panel = document.createElement('div');
        panel.id = 'TicklerInlinePanel';
        panel.style.margin = '10px 0';

        var html = '<table style="width:100%; border-collapse:collapse;"><tr><td style="vertical-align:top; width:45%; line-height:1.8;">';
        
        html += '<strong>Procedure Selection:</strong><br>';
        html += '<button type="button" id="panelContinueBtn" style="font-weight:bold; margin-bottom:5px; cursor:pointer;">Continue</button> ';
        html += '<button type="button" id="panelCancelBtn" style="font-weight:bold; margin-bottom:5px; cursor:pointer;">Cancel</button><br>';
        for (var i = 0; i < AA.length; i++) {
            html += '<input name="AllergyR" id="Aller' + i + '" type="radio" value="' + AA[i][1] + '" style="margin-right:5px;" /><label for="Aller' + i + '">' + AA[i][0] + '</label><br>';
        }
        
        html += '</td><td style="width:5%; border-right:1px dashed #ccc;"></td><td style="width:5%;"></td><td style="vertical-align:top; width:45%; line-height:1.8;">';
        
        html += '<strong>Time Interval:</strong><br><br>';
        for (var j = 0; j < AB.length; j++) {
            html += '<input name="TimeR" id="Time' + j + '" type="radio" value="' + AB[j][1] + '" style="margin-right:5px;" /><label for="Time' + j + '">' + AB[j][0] + '</label><br>';
        }
        
        html += '</td></tr></table>';
        panel.innerHTML = html;

        // Targeted to append open space configuration inside div field2 container element
        var insertionTarget = document.querySelector('div.Field2, .Field2');
        if (insertionTarget) {
            insertionTarget.appendChild(panel);
        } else {
            // Safe fallback if target container context fails to load
            insertionTarget = document.querySelector('[id^="acknowledgeForm_"], #acknowledgeForm, .labSection, .main-content') || document.body;
            insertionTarget.insertBefore(panel, insertionTarget.firstChild);
        }

        var time1Radio = document.getElementById('Time1');
        if (time1Radio) time1Radio.checked = true;

        var allergen0 = document.getElementById('Aller0');
        if (allergen0) allergen0.addEventListener('click', function() { document.getElementById('Time2').checked = true; });

        var allergen1 = document.getElementById('Aller1');
        if (allergen1) allergen1.addEventListener('click', function() { document.getElementById('Time3').checked = true; });

        var allergen2 = document.getElementById('Aller2');
        if (allergen2) allergen2.addEventListener('click', function() { document.getElementById('Time5').checked = true; });

        var allergen4 = document.getElementById('Aller4');
        if (allergen4) allergen4.addEventListener('click', function() { document.getElementById('Time4').checked = true; });

        var allergen5 = document.getElementById('Aller5');
        if (allergen5) allergen5.addEventListener('click', function() { document.getElementById('Time2').checked = true; });

        var myOtherTxt = document.getElementById('myOther');
        if (myOtherTxt) myOtherTxt.addEventListener('focus', function() { document.getElementById('Aller7').checked = true; });

        var daysTxt = document.getElementById('Days');
        if (daysTxt) daysTxt.addEventListener('focus', function() { document.getElementById('Time6').checked = true; });

        var yearsTxt = document.getElementById('Years');
        if (yearsTxt) yearsTxt.addEventListener('focus', function() { document.getElementById('Time7').checked = true; });

        // Cancel button explicitly removes the panel
        document.getElementById('panelCancelBtn').addEventListener('click', function() {
            panel.remove();
        });

        document.getElementById('panelContinueBtn').addEventListener('click', function() {
            var selectedLabel = '';
            var selectedDays = '360';

            for (var k = 0; k < AB.length; k++) {
                var rBtn = document.getElementById('Time' + k);
                if (rBtn && rBtn.checked) {
                    selectedDays = rBtn.value;
                    if (selectedDays === 'Other' || selectedDays === 'Months') {
                        selectedDays = (parseInt(document.getElementById('Days').value) || 1) * 30;
                    }
                    if (selectedDays === 'Years') {
                        selectedDays = (parseInt(document.getElementById('Years').value) || 1) * 365;
                    }
                    break;
                }
            }

            for (var m = 0; m < AA.length; m++) {
                var aBtn = document.getElementById('Aller' + m);
                if (aBtn && aBtn.checked) {
                    selectedLabel = AA[m][0];
                    if (AA[m][1] === 'Other') {
                        selectedLabel = document.getElementById('myOther').value || 'Other';
                    }
                    break;
                }
            }

            if (!selectedLabel) {
                alert("Please pick a procedure workflow or click Cancel.");
                return;
            }

            panel.remove();

            var docType = window.location.pathname.includes('labDisplay.jsp') ? 'HL7' : 'DOC';

            window.open(hostPath + 'tickler/ticklerAdd.jsp?docType=' + docType + '&docId=' + (params.segmentID || '') + '&demographic_no=' + demono + '&myparam1=' + encodeURIComponent(selectedLabel) + '&myparam2=' + selectedDays, '_blank', 'width=900,height=600');

            var vPrev = '';
            var lowerLbl = selectedLabel.toLowerCase();
            if (lowerLbl === 'mammogram') vPrev = 'MAM';
            if (lowerLbl === 'pap') vPrev = 'PAP';
            if (lowerLbl === 'colonoscopy') vPrev = 'COLONOSCOPY';
            if (lowerLbl === 'fit') vPrev = 'FOBT';
            if (lowerLbl === 'hpv') vPrev = 'HPV-CERVIX';
            if (lowerLbl === 'bone density') vPrev = 'BMD';
            
            if (vPrev) {
                window.open(hostPath + 'oscarPrevention/AddPreventionData.jsp?prevention=' + vPrev + '&demographic_no=' + demono + '&prevResultDesc=&myparam1=' + encodeURIComponent(selectedLabel) + '&myparam2=' + selectedDays, '_blank', 'width=800,height=600');
            }
        });
    }

    // --- Autotickler Parameter Interceptor ---
    if (window.location.pathname.includes('ticklerAdd.jsp') || window.location.pathname.includes('ForwardDemographicTickler.do')) {
        if (params.myparam1) {
            var d = new Date();
            d.setTime(d.getTime() + (parseInt(params.myparam2) * 24 * 60 * 60 * 1000));
            var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var targetDate = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            
            setTimeout(function() {
                var dateField = document.querySelector('input[name="xml_appointment_date"], #xml_appointment_date');
                if (dateField) dateField.value = targetDate;
                
                var msgField = document.querySelector('textarea[name="ticklerMessage"], #ticklerMessage');
                if (msgField) msgField.value += " Recall for " + params.myparam1 + " repeat due in " + monthNames[d.getMonth()] + " " + d.getFullYear();
            }, 500);
        }
    }

    // Execution Cycles
    init();
    window.addEventListener('load', init);
    setTimeout(init, 1000);
    setTimeout(init, 2000);

})();
