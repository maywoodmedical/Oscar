// ==UserScript==
// @name         EchartShortcuts
// @namespace    https://github.com/maywoodmedical/Oscar
// @description  Various navigation buttons for echart screen including Lifelabs, Imaging, Results. Set your own specific fid (form number) or Measurement groupName
// @include      */casemgmt/forward.jsp?action=view&demographic*
// @updateURL    https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartShortcuts.user.js
// @downloadURL  https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/EchartShortcuts.user.js
// @version      3.0
// @grant        GM_addStyle
// ==/UserScript==

// modified from Stanscripts https://github.com/DrStanMD

(function() {
    'use strict';

    function setCookie(cname, cvalue, exdays, cpath) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = 'expires=' + d.toGMTString();
        document.cookie = cname + '=' + cvalue + '; ' + expires + '; ' + cpath;
    }

    function getCookie(cname) {
        var name = cname + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return '';
    }

    var elements = window.location.pathname.split('/', 2);
    var firstElement = elements.slice(1);
    var vPath = 'https://' + location.host + '/' + firstElement + '/';

    var myParam = location.search.split('demographicNo=')[1];
    if (!myParam) return; // Guard clause in case URL structure shifts slightly

    var res = myParam.indexOf('&');
    var demo_no = res !== -1 ? myParam.substring(0, res) : myParam;

    // Calculate centered window specs
    var wWidth = 1100; // Comfortable width for Oscar eForms
    var wHeight = screen.availHeight;
    var wLeft = 200; // Opens close to the left side of the screen
    var wTop = 0; // Starts at the top to use full vertical space
    var windowSpecs = 'width=' + wWidth + ',height=' + wHeight + ',left=' + wLeft + ',top=' + wTop + ',toolbar=0,location=0,menubar=0,scrollbars=1,resizable=1';

    // --- BUTTON 1: LIFELAB ---
    var input = document.createElement('input');
    input.type = 'button';
    input.value = 'Lifelab';
    input.onclick = function() {
        var formPath = vPath + 'eform/efmformadd_data.jsp?fid=273&demographic_no=' + demo_no;
        window.open(formPath, 'LifelabsForm', windowSpecs);
    };
    input.setAttribute('style', 'width:60px;font-size:14px;z-index:9999;position:fixed;bottom:52px;right:75px;cursor:pointer;');
    document.body.appendChild(input);

    // --- BUTTON 2: IMAGING ---
    var input1 = document.createElement('input');
    input1.type = 'button';
    input1.value = 'Imaging';
    input1.onclick = function() {
        var formPath = vPath + 'eform/efmformadd_data.jsp?fid=8&demographic_no=' + demo_no;
        window.open(formPath, 'ImagingForm', windowSpecs);
    };
    input1.setAttribute('style', 'width:60px;font-size:14px;z-index:9999;position:fixed;bottom:30px;right:75px;cursor:pointer;');
    document.body.appendChild(input1);

    // --- BUTTON 3: RESULTS ---
    var input2 = document.createElement('input');
    input2.type = 'button';
    input2.value = 'Results';
    input2.onclick = function() {
        // Converted from jQuery selection to native DOM selection for Tampermonkey safety
        var resultsLink = document.querySelector('#menu2 > a:nth-child(2)');
        if (resultsLink) {
            resultsLink.click();
        } else {
            // Fallback catch-all case if menu selectors shift slightly between Oscar themes
            var alternativeLink = document.getElementById('menu2')?.getElementsByTagName('a')[1];
            if (alternativeLink) alternativeLink.click();
        }
    };
    input2.setAttribute('style', 'width:60px;font-size:14px;z-index:9999;position:fixed;bottom:8px;right:75px;cursor:pointer;');
    document.body.appendChild(input2);

})();
