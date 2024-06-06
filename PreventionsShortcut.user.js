// ==UserScript==
// @name        Preventions Shortcut
// @description Adds Navigation buttons for Fit/Pap/Mam/Col/Flu 
// @namespace   https://github.com/maywoodmedical/Oscar
// @include  *casemgmt/forward.jsp?action*
// @updateURL https://github.com/myingbull/Oscar/edit/main/AllergiesAndPreventions.user.js
// @downloadURL  https://github.com/myingbull/Oscar/edit/main/AllergiesAndPreventions.user.js
// @require   http://ajax.googleapis.com/ajax/libs/jquery/1.3.1/jquery.min.js
// @updateURL https://github.com/maywoodmedical/Oscar/raw/main/PreventionsShortcut.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/main/PreventionsShortcut.user.js
// @version     1.4
// @grant       none
// ==/UserScript==

// modified from Stanscripts https://github.com/DrStanMD


function setCookie(cname, cvalue, exdays, cpath) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    //d.setTime(d.getTime() + (exdays * 5000));
    var expires = 'expires=' + d.toGMTString();
    document.cookie = cname + '=' + cvalue + '; ' + expires + '; ' + cpath
}
AA = []
AA[0] = [
    'Penicillin',
    'ID=44452&name=PENICILLINS&type=10'
]
AA[1] = [
    'Sulfonamides',
    'ID=44159&name=SULFONAMIDES&type=10'
]
AA[2] = [
    'Macrolides (Erythromicin et al)',
    'ID=46140&name=MACROLIDES&type=10'
]
AA[3] = [
    'Macrodantin',
    'ID=11499&name=MACROBID+100MG&type=13'
]
AA[4] = [
    'Latex',
    'ID=0&type=0&name=LATEX'
]
AA[5] = [
    'ACEI',
    'ID=46274&name=ANGIOTENSIN-CONVERTING+ENZYME+INHIBITORS&type=10'
]
AA[6] = [
    'ASA',
    'ID=46283&name=SALICYLATES&type=10'
]
AA[7] = [
    'Codeine',
    'ID=44212&name=CODEINE&type=8'
]
AA[8] = [
    'Morphine',
    'ID=44217&name=MORPHINE&type=8'
]
AA[9] = [
    'SBE prophylaxis',
    'ID=0&type=0&name=ANTIBIOTIC PROPHYLAXIS REQUIRED'
]
AA[10] = [
    'Environmental',
    'ID=0&type=0&name=ENVIRONMENTAL ALLERGIES'
]
AA[11] = [
    'Jehova Witness',
    'ID=0&type=0&name=NO BLOOD PRODUCTS'
] //*************ADD ALLERGY ALIAS AND URL HERE USING THE PATTERN ABOVE****************
/*
AA[10] = [
  'Envorinmental',
  'ID=0&type=0&name=Environmental Allergies'
]
AA[nn] = [
  'Alias',
  'Drug URL'
]
AA[nn] = [
  'Alias',
  'Drug URL'
]
*/
//***********************************************************************************
var myRadio = '<br></br><div id=\'RadioDiv\'>'
for (i = 0; i < AA.length; i++) {
    var myId = 'Aller' + i.toString();
    var myLabel = AA[i][0]
    var myValue = AA[i][1]
    var myRadio = myRadio + '<input name=\'AllergyR\' id=' + myId + ' type=\'radio\'     value=' + myValue + ' /><label for=' + myId + '>' + myLabel + '</label><br>'
}
myRadio = myRadio + '<input name=\'AllergyR\'  id=\'Cancel\' type=\'radio\'  value= \'cancel\' /><label for= \'Cancel\'>CANCEL</label><br></div><br></br>' //========Get Path============
var elements = (window.location.pathname.split('/', 2))
firstElement = (elements.slice(1))
vPath = ('https://' + location.host + '/' + firstElement + '/') //=====Get Parameters============
var params = {};
if (location.search) {
    var parts = location.search.substring(1).split('&');
    for (var i = 0; i < parts.length; i++) {
        var nv = parts[i].split('=');
        if (!nv[0]) continue;
        params[nv[0]] = nv[1] || true;
    }
}
if (params.demographic_no) {
    demoNo = params.demographic_no
} else {
    demoNo = params.demographicNo
}

/*
var input1 = document.createElement('input');
input1.type = 'button';
input1.value = 'NKDA';
input1.onclick = ButtonFunction1;
input1.setAttribute('style', 'font-size:8px;position:absolute;top:0px;right:50px;background-color: #00FF00');
document.body.appendChild(input1);

function ButtonFunction1() {
    myWindow = window.open(vPath + '/oscarRx/showAllergy.do?demographicNo=' + demoNo + '&view=All', 'myWindow');
    // Opens a new window
    setTimeout(function() {
        myWindow2 = window.open(vPath + '/oscarRx/addReaction2.do?ID=0&type=0&name=NKDA', 'myWindow2')
        myWindow.close();
    }, 200);
}
var input2 = document.createElement('input');
input2.type = 'button';
input2.value = 'OTHER';
input2.onclick = ButtonFunction2;
input2.setAttribute('style', 'font-size:8px;position:absolute;top:0px;right:100px;background-color: #FFC0CB;');
document.body.appendChild(input2);

function ButtonFunction2() {
    if (params.demographic_no) {
        var myElement = '.TopStatusBar > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1)'
        var RestoreHTML = $(myElement).html()
        $(myElement).html(myRadio)
    } else {
        var myElement = '#allergies > div:nth-child(3) > h3:nth-child(1)'
        var RestoreHTML = $(myElement).html()
        $(myElement).html(myRadio)
    }
    var addthis = '' //  input2.style.visibility = "hidden";
    document.getElementById('RadioDiv').addEventListener('click', function() {
        if (document.getElementById('Cancel').checked) {
            $(myElement).html(RestoreHTML)
        }
        for (i = 0; i < AA.length; i++) {
            xyz = 'Aller' + i
            if (document.getElementById(xyz).checked) {
                addthis = AA[i][1] //alert(addthis)
                $(myElement).html(RestoreHTML)
                myWindow = window.open(vPath + '/oscarRx/showAllergy.do?demographicNo=' + demoNo + '&view=All', 'myWindow');
                // Opens a new window
                setTimeout(function() {
                    myWindow2 = window.open(vPath + '/oscarRx/addReaction2.do?' + addthis, 'myWindow2')
                    myWindow.close();
                }, 200);
            }
        }
    });
} 
*/

var input1 = document.createElement('input');
input1.type = 'button';
input1.value = 'FIT';
input1.onclick = ButtonFunction1;
input1.setAttribute('style', 'width:30px; height:22px; font-size:10px;z-index:1;position:fixed;bottom:52px;right:165px;');
document.body.appendChild(input1);

function ButtonFunction1() {
  y = (30 / 86400) //5 seconds
  setCookie('RELOAD', 'RELOADED', y, 'path=/') //alert(input202.value)
//  myWindow = window.open(vPath + 'oscarPrevention/AddPreventionData.jsp?4=4&prevention=FOBT&demographic_no=' + demoNo + '&prevResultDesc=', 'myWindow', 'width=800, height=600');
 myWindow = window.open(vPath + 'oscarPrevention/AddPreventionData.jsp?4=4&prevention=FOBT&demographic_no=' + demoNo + '&prevResultDesc=', 'myWindow', 'width=800, height=600');
}

var input2 = document.createElement('input');
input2.type = 'button';
input2.value = 'Pap';
input2.onclick = ButtonFunction2;
input2.setAttribute('style', 'width:30px; height:22px; font-size:10px;z-index:1;position:fixed;bottom:30px;right:165px;');
document.body.appendChild(input2);

function ButtonFunction2() {
  y = (30 / 86400) //5 seconds
  setCookie('RELOAD', 'RELOADED', y, 'path=/') //alert(input202.value)
//  myWindow = window.open(vPath + 'oscarPrevention/AddPreventionData.jsp?prevention=PAP&demographic_no=' + demoNo + '&prevResultDesc=', 'myWindow', 'width=800, height=600');
 myWindow = window.open(vPath + 'oscarPrevention/AddPreventionData.jsp?1=1&prevention=PAP&demographic_no=' + demoNo + '&prevResultDesc=', 'myWindow', 'width=800, height=600');
}

var input3 = document.createElement('input');
input3.type = 'button';
input3.value = 'HPV';
input3.onclick = ButtonFunction3;
input3.setAttribute('style', 'width:30px; height:22px; font-size:10px;z-index:1;position:fixed;bottom:8px;right:165px;');
document.body.appendChild(input3);

function ButtonFunction3() {
  y = (30 / 86400) //5 seconds
  setCookie('RELOAD', 'RELOADED', y, 'path=/') //alert(input202.value)
  //  myWindow = window.open(vPath + 'oscarPrevention/AddPreventionData.jsp?prevention=HPV-CERVIX&demographic_no=' + demoNo + '&prevResultDesc=', 'myWindow', 'width=800, height=600');
 myWindow = window.open(vPath + 'oscarPrevention/AddPreventionData.jsp?4=4&prevention=HPV-CERVIX&demographic_no=' + demoNo + '&prevResultDesc=', 'myWindow', 'width=800, height=600');
}

var input4 = document.createElement('input');
input4.type = 'button';
input4.value = 'Mam';
input4.onclick = ButtonFunction4;
input4.setAttribute('style', 'width:30px; height:22px; font-size:10px;z-index:1;position:fixed;bottom:52px;right:135px;');
document.body.appendChild(input4);

function ButtonFunction4() {
  y = (30 / 86400) //5 seconds
  setCookie('RELOAD', 'RELOADED', y, 'path=/') //alert(input202.value)
//  myWindow = window.open(vPath + 'oscarPrevention/AddPreventionData.jsp?4=4&prevention=MAM&demographic_no=' + demoNo + '&prevResultDesc=', 'myWindow', 'width=800, height=600');
 myWindow = window.open(vPath + 'oscarPrevention/AddPreventionData.jsp?4=4&prevention=MAM&demographic_no=' + demoNo + '&prevResultDesc=', 'myWindow', 'width=800, height=600');
}

var input5 = document.createElement('input');
input5.type = 'button';
input5.value = 'Col';
input5.onclick = ButtonFunction5;
input5.setAttribute('style', 'width:30px; height:22px; font-size:10px;z-index:1;position:fixed;bottom:30px;right:135px;');
document.body.appendChild(input5);

function ButtonFunction5() {
  y = (30 / 86400) //5 seconds
  setCookie('RELOAD', 'RELOADED', y, 'path=/') //alert(input202.value)
//  myWindow = window.open(vPath + 'oscarPrevention/AddPreventionData.jsp?4=4&prevention=COLONOSCOPY&demographic_no=' + demoNo + '&prevResultDesc=', 'myWindow', 'width=800, height=600');
 myWindow = window.open(vPath + 'oscarPrevention/AddPreventionData.jsp?4=4&prevention=COLONOSCOPY&demographic_no=' + demoNo + '&prevResultDesc=', 'myWindow', 'width=800, height=600');
}


var input6 = document.createElement('input');
input6.type = 'button';
input6.value = 'Flu';
input6.onclick = ButtonFunction6;
input6.setAttribute('style', 'width:30px; height:22px; font-size:10px;z-index:1;position:fixed;bottom:8px;right:135px;');
document.body.appendChild(input6);

function ButtonFunction6() {
  y = (30 / 86400) //5 seconds
  setCookie('RELOAD', 'RELOADED', y, 'path=/') //alert(input202.value)
//  myWindow = window.open(vPath + 'oscarPrevention/AddPreventionData.jsp?4=4&prevention=Flu&demographic_no=' + demoNo + '&prevResultDesc=', 'myWindow', 'width=800, height=600');
 myWindow = window.open(vPath + 'oscarPrevention/AddPreventionData.jsp?4=4&prevention=Flu&demographic_no=' + demoNo + '&prevResultDesc=', 'myWindow', 'width=800, height=600');
}


