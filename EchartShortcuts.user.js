// ==UserScript==
// @name        EchartShortcuts
// @namespace   https://github.com/maywoodmedical/Oscar
// @description Various navigation buttons for echart screen including Lifelabs, Imaging, Results. Set your own specific fid (form number) or Measurement groupName
// @include     */casemgmt/forward.jsp?action=view&demographic*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @updateURL https://github.com/maywoodmedical/Oscar/raw/main/EchartShortcut.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/main/EchartShortcut.user.js
// @version 2.8
// @grant       none
// ==/UserScript==

// modified from Stanscripts https://github.com/DrStanMD

//window.moveTo(300, 100)
function setCookie(cname, cvalue, exdays, cpath)
{
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  //d.setTime(d.getTime() + (exdays * 5000));
  var expires = 'expires=' + d.toGMTString();
  document.cookie = cname + '=' + cvalue + '; ' + expires + '; ' + cpath
}
function getCookie(cname)
{
  var name = cname + '=';
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++)
  {
    var c = ca[i].trim();
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return '';
} //x = $('#enTemplate');
//x.css('background-color', 'yellow');

var myWindow = ''
var elements = (window.location.pathname.split('/', 2))
firstElement = (elements.slice(1)) //alert(firstElement)

// FIXED: Changed '//' to '/' at the end of the base path
vPath = ('https://' + location.host + '/' + firstElement + '/') 


//alert(vPath)

var myParam = location.search.split('demographicNo=') [1] //alert(myParam)
var res = myParam.indexOf('&')
var demo_no = myParam.substring(0, res) //var myWindow = window.open("","","width=200,height=100");

// Calculate centered window specs
var wWidth = 500; // Comfortable width for Oscar eForms
var wHeight = screen.availHeight; 
var wLeft = (screen.availWidth / 2) - (wWidth / 2);
var wTop = 0; // Starts at the top to use full vertical space
var windowSpecs = 'width=' + wWidth + ',height=' + wHeight + ',left=' + wLeft + ',top=' + wTop + ',toolbar=0,location=0,menubar=0,scrollbars=1,resizable=1';

var input = document.createElement('input');
input.type = 'button';
input.value = 'Lifelab';
input.onclick = showAlert;
input.setAttribute('style', 'width:60px;font-size:14px;z-index:1;position:fixed;bottom:52px;right:75px; ');
document.body.appendChild(input);
function showAlert()
{
  var myParam = location.search.split('demographicNo=') [1] //alert(myParam)
  var res = myParam.indexOf('&')
  var demo_no = myParam.substring(0, res) //alert (demo_no)
  
  // FIXED: Removed the leading '/' from '/eform/...' since vPath now handles the single slash separator
  var formPath = vPath + 'eform/efmformadd_data.jsp?fid=273&demographic_no=' + demo_no
  //alert(formPath)
  window.open(formPath, 'LifelabsForm', windowSpecs)
}
// INSERT YOU OWN MEASUREMENT UNIQUE SELECTOR  HERE
var input1 = document.createElement('input');
input1.type = 'button';
input1.value = 'Imaging';
input1.onclick = showAlert1;
input1.setAttribute('style', 'width:60px;font-size:14px;z-index:1;position:fixed;bottom:30px;right:75px; ');
document.body.appendChild(input1);
function showAlert1()
{
  var myParam = location.search.split('demographicNo=') [1] //alert(myParam)
  var res = myParam.indexOf('&')
  var demo_no = myParam.substring(0, res) //alert (demo_no)
  
  // FIXED: Removed the leading '/' from '/eform/...' here as well
  var formPath = vPath + 'eform/efmformadd_data.jsp?fid=8&demographic_no=' + demo_no
  //alert(formPath)
  window.open(formPath, 'ImagingForm', windowSpecs)
}
var input2 = document.createElement('input');
input2.type = 'button';
input2.value = 'Results';
input2.onclick = showAlert2;
input2.setAttribute('style', 'width:60px;font-size:14px;z-index:1;position:fixed;bottom:8px;right:75px; ');
document.body.appendChild(input2);
function showAlert2()
{
  $('#menu2 > a:nth-child(2)').click()
  //window.open(vPath + 'oscar/lab/CumulativeLabValues3.jsp?demographic_no=2229', 'CumulativeLabs', 'width=1000,height=500')
}
