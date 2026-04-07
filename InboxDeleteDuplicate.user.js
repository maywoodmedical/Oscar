// ==UserScript==
// @name        InboxDeleteDuplicate
// @namespace   OscarEMR.Automation
// @match       *://*/oscar/documentManager/showDocument.jsp*
// @match       *://*/oscar/casemgmt/forward.jsp*
// @match       *://*/oscar/oscarEncounter/IncomingEncounter.do*
// @match       *://*/oscar/documentManager/documentReport.jsp*
// @updateURL https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/InboxDeleteDuplicate.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/InboxDeleteDuplicate.user.js
// @version     10.0
// @grant       window.close
// @run-at      document-start
// ==/UserScript==

(function() {
    'use strict';

    const currentUrl = window.location.href;

    // --- PHASE 2: E-CHART / FORWARDER (SCRAPING THE ID) ---
    if (currentUrl.includes('forward.jsp') || currentUrl.includes('IncomingEncounter.do')) {
        const isPending = localStorage.getItem('oscar_delete_pending');
        const docID = localStorage.getItem('oscar_delete_docid');

        if (isPending === 'true' && docID) {
            let timer = 0;
            const poll = setInterval(() => {
                const urlParams = new URLSearchParams(window.location.search);
                const demoNo = urlParams.get('demographicNo');

                if (demoNo && demoNo !== "null") {
                    clearInterval(poll);
                    
                    // --- THE NEW CONFIRMATION STEP ---
                    const userConfirmed = confirm(`Are you sure you want to delete this document?\n\nDocument ID: ${docID}\nPatient ID: ${demoNo}`);
                    
                    if (userConfirmed) {
                        localStorage.removeItem('oscar_delete_pending');
                        const deleteUrl = window.location.origin + 
                            `/oscar/documentManager/documentReport.jsp?delDocumentNo=${docID}&function=demographic&functionid=${demoNo}&viewstatus=active`;
                        
                        window.location.replace(deleteUrl);
                    } else {
                        // If user cancels, clear the task and close this temp window
                        localStorage.removeItem('oscar_delete_pending');
                        window.close();
                    }
                }

                timer += 200;
                if (timer > 10000) clearInterval(poll);
            }, 200);
        }
        return;
    }

    // --- PHASE 3: DELETION CONFIRMATION / CLEANUP ---
    if (currentUrl.includes('delDocumentNo=')) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                // Changed from alert to a simple close since confirmation happened earlier
                window.close();
            }, 500);
        });
        return;
    }

    // --- PHASE 1: INBOX UI ---
    window.addEventListener('DOMContentLoaded', () => {
        const rotateBtn = document.querySelector('input[id^="rotate90btn_"]');
        if (!rotateBtn || document.getElementById('oscar-delete-btn')) return;

        const urlParams = new URLSearchParams(window.location.search);
        const docID = urlParams.get('segmentID');
        const echartBtn = document.querySelector('input[id^="mainEchart_"]');

        if (rotateBtn && docID && echartBtn) {
            const delBtn = document.createElement('input');
            delBtn.type = 'button';
            delBtn.id = 'oscar-delete-btn';
            delBtn.value = `Delete Duplicate`;
            delBtn.style = "margin-left: 10px; background-color: #d9534f; color: white; border: 1px solid #d43f3a; cursor: pointer; padding: 2px 8px; font-weight: bold; border-radius: 3px;";
            
            rotateBtn.parentNode.insertBefore(delBtn, rotateBtn.nextSibling);

            delBtn.onclick = function() {
                localStorage.setItem('oscar_delete_pending', 'true');
                localStorage.setItem('oscar_delete_docid', docID);
                echartBtn.click();
            };
        }
    });
})();
