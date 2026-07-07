// ==UserScript==
// @name        LabCopyResults
// @namespace   https://github.com/maywoodmedical/Oscar
// @description left click to copy lab values automatically into a clipboard to then paste into echart easily
// @match       *://*.openosp.ca/oscar/lab/CA/ALL/labDisplay.jsp*
// @match       *://maywoodmedicalclinic.openosp.ca/oscar/lab/CA/ALL/labDisplay.jsp*
// @updateURL   https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/CopyLabs.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/CopyLabs.user.js
// @version     2.0
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    let clipboard = [];
    let textArea = null;

    // Helper to format the structured clipboard object into the desired text layout
    function formatClipboard(entries) {
        return entries.map(entry => {
            if (entry.history.length > 0) {
                const historyStr = entry.history.map(h => `${h.val}${h.date ? ` [${h.date}]` : ''}`).join(', ');
                return `${entry.name} ${entry.initial} (${historyStr})`;
            }
            return `${entry.name} ${entry.initial}`;
        }).join('\n');
    }

    // Helper to extract column header date from the main table
    function getMainPageDate(cell) {
        const table = cell.closest('table');
        if (!table) return '';
        const cellIndex = cell.cellIndex;
        const headerRow = table.querySelector('tr');
        if (headerRow && headerRow.cells[cellIndex]) {
            const headerText = headerRow.cells[cellIndex].textContent.trim();
            const match = headerText.match(/\d{4}-\d{2}-\d{2}/);
            return match ? match[0] : headerText;
        }
        return '';
    }

    // Process a lab insertion or trend append
    function addLabToClipboard(labName, labValue, labDate) {
        let matched = clipboard.find(item => item.name === labName);

        if (matched) {
            matched.history.push({ val: labValue, date: labDate });
        } else {
            clipboard.push({ name: labName, initial: labValue, history: [] });
        }
        updateTextArea();
        copyToClipboard();
    }

    // Listen for copy actions executed inside the Hover script iframe/window
    window.addEventListener('labTrendAdded', function(e) {
        if (e.detail && e.detail.labName) {
            addLabToClipboard(e.detail.labName, e.detail.labValue, e.detail.labDate);
        }
    });

    function accumulateLabValue(event) {
        let numberElement = event.target;
        if (numberElement.tagName.toLowerCase() === 'td' && numberElement.align === 'right') {
            let labValue = numberElement.textContent.trim();
            let labLabelElement = numberElement.previousElementSibling;

            if (labLabelElement && labLabelElement.tagName.toLowerCase() === 'td') {
                let labName = labLabelElement.querySelector('a') ? labLabelElement.querySelector('a').textContent : '';

                if (labName && labValue) {
                    labName = replaceLabName(labName);
                    const labDate = getMainPageDate(numberElement);
                    addLabToClipboard(labName, labValue, labDate);
                }
            }
        }
    }

    function updateTextArea() {
        if (!textArea) {
            textArea = document.createElement('textarea');
            textArea.style.position = 'fixed';
            textArea.style.top = '216px';
            textArea.style.right = '10px';
            textArea.style.width = '200px';
            textArea.style.height = '55px';
            textArea.style.zIndex = '9999';
            textArea.readOnly = true;
            textArea.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
            document.body.appendChild(textArea);
        }
        textArea.value = formatClipboard(clipboard);
    }

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(formatClipboard(clipboard));
        } catch (err) {
            console.error('Failed to copy to clipboard: ', err);
        }
    }

    function replaceLabName(labName) {
        const replacements = {
            'Hemoglobin': 'Hgb',
            'Hematocrit': 'HCT',
            'Platelet Count': 'Plt',
            'Neutrophils': 'Neut',
            'Lymphocytes': 'Lymph',
            'Monocytes': 'Mono',
            'Eosinophils': 'Eos',
            'Basophils': 'Baso',
            'Estimated GFR': 'eGFR',
            'Hemoglobin A1c': 'A1C',
            'Glucose Random': 'BG',
            'Glucose Fasting': 'fBG',
            'Urate': 'Uric acid',
            'Alanine Aminotransferase': 'ALT',
            'Aspartate Aminotransferase': 'AST',
            'Cholesterol': 'T Chol',
            'LDL Cholesterol': 'LDL',
            'HDL Cholesterol': 'HDL',
            'Triglycerides': 'TG',
            'Chol/HDL (Risk Ratio)': 'Chol/HDL',
            'Non HDL Cholesterol': 'Non-HDL',
            'C Reactive Protein': 'CRP',
            'Sodium': 'Na',
            'Potassium': 'K',
            'Calcium': 'Ca',
            'Calcium Ionized': 'Ca Ionized',
            'Magnesium': 'Mg',
            'Phosphate': 'Phos',
            'Chloride': 'Cl',
            'Bicarbonate': 'Bicarb',
            'Total Bilirubin': 'T Bili',
            'Conjugated Bilirubin': 'Direct Bili',
            'Gamma GT': 'GGT',
            'Alkaline Phosphatase': 'ALP',
            'Lactate Dehydrogenase': 'LDH',
            'Total Protein': 'T Protein',
            'Urine ACR (Albumin/Creatinine Ratio)': 'UACr',
            'Nuclear Ab Titre and Pattern': 'ANA',
            'Cyclic Citrullinated Peptide Ab': 'anti-CCP',
            'Hep B Core antibody (HBcAb)': 'HBcAb',
            'Hep B Surface antigen (HBsAg)': 'HBsAg',
            'Hep B Surface antibody (HBsAb)': 'HBsAb',
            'Creatine Kinase': 'CK',
            'Natriuretic Peptide B (BNP)': 'BNP',
            'Natriuretic Peptide B Prohormone': 'BNP',
            '25-Hydroxyvitamin D': 'Vit D',
            'Iron Saturation': 'Iron Sat',
            'Fibrin D-Dimer FEU': 'D-Dimer',
            'Nuclear Ab Titre': 'ANA',
            'Rheumatoid Factor': 'RF',
            'Follicle Stimulating Hormone (FSH)': 'FSH',
            'Luteinizing Hormone (LH)': 'LH',
            'DHEA Sulphate': 'DHEAS',
            'Adrenocorticotropic Hormone (ACTH)': 'ACTH',
            'C Reactive Protein (High Sensitivity)': 'hsCRP',
            'Complement C3': 'C3',
            'Complement C4': 'C4',
            'Extractable Nuclear Ab Screen': 'ENA',
            'Tissue Transglutaminase Ab IgA': 'anti-TTG',
            'Chlamydia trachomatis rRNA (PCR/NAAT)': 'Chlamydia',
            'Neisseria gonorrhoeae rRNA (PCR/NAAT)': 'Gonorrhoeae',
            'Choriogonadotropin Intact+Beta Subunit': 'bhCG',
            'HCG Serum': 'bhCG',
            'Urine Chlamydia trachomatis rRNA (PCR/NAAT)': 'Chlamydia',
            'Urine Neisseria gonorrhoeae rRNA (PCR/NAAT)': 'Gonorrhoaea',
            'Mullerian Inhibiting Substance': 'AMH',
            'Vitamin B12': 'B12',
            'Helicobacter Pylori': 'H Pylori',
            'Treponema pallidum Ab (EIA)': 'Treponema EIA',
            'Hepatitis B Virus Surface Ag': 'HBsAg',
            'Hepatitis C Virus Ab': 'HCV Ab',
            'HIV 1+2 Ab + HIV p24 Ag (Screen)': 'HIV',
            'Rubella Virus Ab IgG': 'Rubella IgG',
            'Varicella Zoster Virus Ab IgG': 'Varicella IgG',
            'T4 Free': 'fT4',
            'T3 Free': 'fT3',
            'Parathyroid Hormone Intact': 'PTH',
            'Activated PTT': 'PTT',
            'Carcinoembryonic Ag': 'CEA',
            'Cancer Antigen 19-9': 'CA 19-9',
            'Alpha-1-Fetoprotein': 'AFP',
            'Occult Blood Immunochemical': 'FIT',
            'Troponin T High Sensitivity': 'Trop',
            'Troponin I (High Sensitivity)': 'Trop',
            'Insulin-Like Growth Factor-I': 'IGF-1',
        };
        return replacements[labName] || labName;
    }

    document.addEventListener('click', function(event) {
        accumulateLabValue(event);
    });
})();
