// ==UserScript==
// @name           Consults Default
// @namespace      https://github.com/maywoodmedical/Oscar
// @description    Sets the default for Consults Appointment Instructions
// @include        *oscar/oscarEncounter/oscarConsultationRequest/ConsultationFormRequest.jsp*
// @require   http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @updateURL https://github.com/maywoodmedical/Oscar/raw/main/ConsultsDefault.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/main/ConsultsDefault.user.js
// @version 1.1
// ==/UserScript==

//========Get Path============
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
} //alert(params.docType)

var theDefault = 'MSP Numbers: Dr. Hoi Ling Irene Iu ("iu" NOT "Lu") 30205, Dr. Hsu-An Ann Lin 60768, Dr. Louis Wang 37475, Dr. Xuan (Linda) Wang 37588, Dr. Jeffrey Leong J2776. Thank you for informing the patient of their appointment details and forwarding us a copy.';
var theOptions = document.getElementsByName('appointmentInstructions')[0].options;
for (var theOption of theOptions) {
    if (typeof(theOption) == 'object') {
        if (theOption.text == theDefault) {
            theOption.selected = true;
            break;
        }
    }
}
