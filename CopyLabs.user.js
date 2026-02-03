// ==UserScript==
// @name        LabCopyResults
// @namespace   https://github.com/maywoodmedical/Oscar
// @description left click to copy lab values automatically
// @include  *lab/CA/ALL/labDisplay.jsp?segmentID*
// @include  *lab/CA/ALL/labDisplay.jsp?demographicId*
// @include  *lab/CA/ALL/labDisplay.jsp?inWindow=true&segmentID*
// @require   http://ajax.googleapis.com/ajax/libs/jquery/1.3.1/jquery.min.js
// @updateURL https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/CopyLabs.user.js
// @downloadURL https://github.com/maywoodmedical/Oscar/raw/refs/heads/main/CopyLabs.user.js
// @version     1.3
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    let clipboard = []; // This will hold the accumulated lab names and values
    let textArea = null;  // Will store the textarea element

    // Function to accumulate lab name and value when left-clicked
    function accumulateLabValue(event) {
        // Find the numerical value and its associated lab name
        let numberElement = event.target;
        if (numberElement.tagName.toLowerCase() === 'td' && numberElement.align === 'right') {
            let labValue = numberElement.textContent.trim();
            let labLabelElement = numberElement.previousElementSibling;

            // Ensure the label is valid
            if (labLabelElement && labLabelElement.tagName.toLowerCase() === 'td') {
                let labName = labLabelElement.querySelector('a') ? labLabelElement.querySelector('a').textContent : '';
                
                // If the lab name and value exist, accumulate it
                if (labName && labValue) {
                    // Replace specific lab names
                    labName = replaceLabName(labName);
                    clipboard.push(`${labName}: ${labValue}`);
                    updateTextArea();
                    copyToClipboard(); // Automatically trigger copying to clipboard
                }
            }
        }
    }

    // Function to update the textarea with the accumulated values
    function updateTextArea() {
        if (!textArea) {
            // Create and display the textarea if it doesn't exist
            textArea = document.createElement('textarea');
            textArea.style.position = 'fixed';
            textArea.style.top = '216px';
            textArea.style.right = '10px';
            textArea.style.width = '200px';
            textArea.style.height = '55px';
            textArea.style.zIndex = '9999';
            textArea.readOnly = true;
            textArea.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';  // White with 80% opacity
            document.body.appendChild(textArea);
        }

        // Update the textarea content
        textArea.value = clipboard.join('\n');
    }

    // Function to simulate copying to clipboard using Clipboard API
    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(clipboard.join('\n'));
        } catch (err) {
            console.error('Failed to copy to clipboard: ', err);
        }
    }

    // Function to replace specific lab names with their abbreviations
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

        return replacements[labName] || labName; // Return the replaced name or original if no replacement
    }

    // Listen for left-click event to collect lab values
    document.addEventListener('click', function(event) {
        accumulateLabValue(event);
    });

})();
