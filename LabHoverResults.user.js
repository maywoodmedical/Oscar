// ==UserScript==
// @name          Lab Hover Results
// @description   hover over labs to see instant historical overview and visual trendline
// @namespace     https://github.com/maywoodmedical/Oscar
// @match         *://maywoodmedicalclinic.openosp.ca/oscar/lab/*
// @grant         GM_xmlhttpRequest
// @grant         GM.xmlHttpRequest
// @connect       maywoodmedicalclinic.openosp.ca
// @allFrames     true
// @updateURL     
// @downloadURL   
// @version       7.0
// ==/UserScript==


(function() {
    'use strict';

    if (window.location.href.includes("DemographicLab.jsp")) {
        return; 
    }

    function getDemographicId(element) {
        const link = element.tagName === 'A' ? element : element.querySelector('a');
        if (link && link.href) {
            const match = link.href.match(/[?&]demo=(\d+)/);
            if (match) return match[1];
        }

        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get('demographicId') || urlParams.get('demo') || urlParams.get('demographicNo');
        if (urlId) return urlId;

        const hiddenDemo = document.querySelector('input[name="demo"], input[name="demographicNo"], input[name="demographicId"]');
        if (hiddenDemo && hiddenDemo.value) return hiddenDemo.value;
        
        return null;
    }

    const tooltip = document.createElement('div');
    Object.assign(tooltip.style, {
        position: 'fixed', zIndex: '2147483647', backgroundColor: 'white',
        padding: '8px', visibility: 'hidden', display: 'block',
        color: 'black', fontSize: '11px', borderRadius: '4px', 
        width: '176px', boxSizing: 'border-box',
        fontFamily: 'Verdana, Arial, Helvetica, sans-serif', pointerEvents: 'none',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)', border: '1px solid #ccc'
    });
    document.body.appendChild(tooltip);

    let labConfigs = [
        // HEMATOLOGY
        { search: "Granulocytes Immature", id: "51584-1", label: "IG", min: 0, max: 0.1 },
        { search: "Reticulocytes Immature/Total Reticulocytes", id: "33516-6", label: "IRF", min: 0.02, max: 0.15 },
        { search: "Hemoglobin Fractionation Electrophoresis", id: "49316-3", label: "Hb Electrophoresis", min: 0, max: 100 },
        { search: "Hemoglobinopathy", id: "XXX-3547", label: "Hb-pathy", min: 0, max: 0 },
        { search: "Hemoglobin A2/Total Hemoglobin", id: "4551-8", label: "HbA2", min: 2.0, max: 3.3 },
        { search: "Hemoglobin F/Total Hemoglobin", id: "4576-5", label: "HbF", min: 0, max: 2.0 },
        { search: "RBC Morphology", id: "6742-1", label: "RBC Morph", min: 0, max: 0 },
        { search: "Hemoglobin", id: "718-7", label: "Hgb", min: 115, max: 160 },
        { search: "Hematocrit", id: "4544-3", label: "HCT", min: 0.35, max: 0.48 },
        { search: "Platelet Count", id: "777-3", label: "Plt", min: 150, max: 400 },
        { search: "Reticulocytes", id: "14196-0", label: "Retic", min: 25, max: 100 },
        { search: "Neutrophils", id: "751-8", label: "Neut", min: 2.0, max: 7.5 },
        { search: "Lymphocytes", id: "731-0", label: "Lymph", min: 1.0, max: 3.5 },
        { search: "Monocytes", id: "742-7", label: "Mono", min: 0.2, max: 1.0 },
        { search: "Eosinophils", id: "711-2", label: "Eos", min: 0, max: 0.5 },
        { search: "Basophils", id: "704-7", label: "Baso", min: 0, max: 0.2 },
        { search: "WBC", id: "6690-2", label: "WBC", min: 4.0, max: 11.0 },
        { search: "RBC", id: "789-8", label: "RBC", min: 3.8, max: 5.8 },
        { search: "MCV", id: "787-2", label: "MCV", min: 82, max: 98 },
        { search: "MCH", id: "785-6", label: "MCH", min: 27, max: 33 },
        { search: "MCHC", id: "786-4", label: "MCHC", min: 320, max: 360 },
        { search: "RDW", id: "788-0", label: "RDW", min: 11.0, max: 15.0 },
        { search: "ESR", id: "4537-7", label: "ESR", min: 0, max: 20 },
        { search: "MPV", id: "32623-1", label: "MPV", min: 9.5, max: 12.5 },
        { search: "Nucleated RBCs", id: "771-6", label: "Nucleated RBCs", min: 0, max: 0 },
        { search: "Direct Antiglobulin Test, IgG Specific", id: "55776-9", label: "Direct Antiglobulin Test, IgG Specific", min: 0, max: 0 },
        { search: "Direct Antiglobulin Test, C3d Specific", id: "55774-4", label: "Direct Antiglobulin Test, C3d Specific", min: 0, max: 0 },
        { search: "Direct Antiglobulin Test, Polyspecific", id: "1007-4", label: "Direct Antiglobulin Test, Polyspecific", min: 0, max: 0 },
      
        // DIABETES & GLUCOSE
        { search: "Hemoglobin A1C/Total Hemoglobin (IFCC)", id: "XXX-2604", label: "A1C-IFCC", min: 20, max: 42 },
        { search: "Glucose 1h Post 50 g Glucose", id: "14754-6", label: "GTT 1h", min: 0, max: 7.7 },
        { search: "Hemoglobin A1c", id: "4548-4", label: "A1C", min: 4.0, max: 6.0 },
        { search: "Glucose Fasting", id: "14771-0", label: "fBG", min: 3.6, max: 6.0 },
        { search: "Glucose Random", id: "14749-6", label: "BG", min: 3.6, max: 11.0 },

        // LIPIDS
        { search: "Non HDL Cholesterol", id: "70204-3", label: "Non-HDL", min: 0, max: 3.9 },
        { search: "Chol/HDL (Risk Ratio)", id: "32309-7", label: "Chol/HDL", min: 0, max: 4.9 },
        { search: "Apolipoprotein B-100", id: "1871-3", label: "ApoB", min: 0.4, max: 1.05 },
        { search: "LDL Cholesterol", id: "39469-2", label: "LDL", min: 0, max: 3.4 },
        { search: "HDL Cholesterol", id: "14646-4", label: "HDL", min: 1.0, max: 2.2 },
        { search: "Lipoprotein(a)", id: "43583-4", label: "Lp(a)", min: 0, max: 75 },
        { search: "Triglycerides", id: "14927-8", label: "TG", min: 0, max: 1.7 },
        { search: "Cholesterol", id: "14647-2", label: "T Chol", min: 2.0, max: 5.2 },

        // RENAL & ELECTROLYTES
        { search: "Urine ACR (Albumin/Creatinine Ratio)", id: "9318-7", label: "UACr", min: 0, max: 2.0 },
        { search: "Estimated GFR", id: "33914-3", label: "eGFR", min: 60, max: 120 },
        { search: "Creatinine", id: "14682-9", label: "Creat", min: 50, max: 110 },
        { search: "Urine Creatinine", id: "14683-7", label: "UCr", min: 3.5, max: 25.0 },
        { search: "Bicarbonate", id: "1963-8", label: "Bicarb", min: 22, max: 30 },
        { search: "Anion Gap", id: "33037-3", label: "Anion Gap", min: 5, max: 14 },
        { search: "Potassium", id: "2823-3", label: "K", min: 3.5, max: 5.1 },
        { search: "Chloride", id: "2075-0", label: "Cl", min: 98, max: 107 },
        { search: "Sodium", id: "2951-2", label: "Na", min: 135, max: 145 },
        { search: "Urate", id: "14933-6", label: "Uric acid", min: 140, max: 430 },
        { search: "Urea", id: "22664-7", label: "Urea", min: 3.0, max: 8.0 },

        // LIVER, ENZYMES & PROTEINS
        { search: "Alanine Aminotransferase", id: "1742-6", label: "ALT", min: 0, max: 40 },
        { search: "Aspartate Aminotransferase", id: "1920-8", label: "AST", min: 0, max: 35 },
        { search: "Alkaline Phosphatase", id: "6768-6", label: "ALP", min: 35, max: 120 },
        { search: "Lactate Dehydrogenase", id: "2532-0", label: "LDH", min: 100, max: 225 },
        { search: "Total Bilirubin", id: "14631-6", label: "T Bili", min: 0, max: 22 },
        { search: "Direct Bilirubin", id: "14629-0", label: "Direct Bili", min: 0, max: 7 },
        { search: "Creatine Kinase", id: "2157-6", label: "CK", min: 30, max: 200 },
        { search: "Total Protein", id: "2885-2", label: "T Protein", min: 60, max: 80 },
        { search: "Gamma GT", id: "2324-2", label: "GGT", min: 0, max: 50 },
        { search: "Albumin", id: "1751-7", label: "Albumin", min: 35, max: 50 },
        { search: "Lipase", id: "3040-3", label: "Lipase", min: 0, max: 60 },

        // BONE & MINERALS
        { search: "Calcium Ionized", id: "1995-0", label: "Ca Ionized", min: 1.15, max: 1.33 },
        { search: "Magnesium", id: "2601-3", label: "Mg", min: 0.65, max: 1.05 },
        { search: "Phosphate", id: "14879-1", label: "Phos", min: 0.8, max: 1.45 },
        { search: "Calcium", id: "2000-8", label: "Ca", min: 2.15, max: 2.60 },
        { search: "Ferritin", id: "2276-4", label: "Ferritin", min: 15, max: 275 },
        { search: "Iron Binding Capacity Unsaturated", id: "22753-8", label: "UIBC", min: 20, max: 62 },
        { search: "Iron Saturation", id: "14801-5", label: "Iron Sat", min: 0.2, max: 0.5 },
        { search: "Iron", id: "14798-3", label: "Iron", min: 9, max: 30 },
        { search: "Transferrin", id: "3034-6", label: "Transferrin", min: 2, max: 4 },
        { search: "Lithium", id: "14334-7", label: "Lithium", min: 0.4, max: 0.8 },

        // CARDIAC & COAGULATION
        { search: "Natriuretic Peptide B Prohormone", id: "33762-6", label: "BNP", min: 0, max: 300 },
        { search: "Troponin T High Sensitivity", id: "67151-1", label: "Trop", min: 0, max: 14 },
        { search: "Troponin I (High Sensitivity)", id: "89579-7", label: "Trop", min: 0, max: 26 },
        { search: "Natriuretic Peptide B (BNP)", id: "30934-4", label: "BNP", min: 0, max: 100 },
        { search: "Fibrin D-Dimer FEU", id: "48065-7", label: "D-Dimer", min: 0, max: 500 },
        { search: "Activated PTT", id: "14979-9", label: "PTT", min: 25, max: 35 },
        { search: "INR", id: "6301-6", label: "INR", min: 0.9, max: 1.2 },

        // THYROID & HORMONES
        { search: "Follicle Stimulating Hormone (FSH)", id: "15067-2", label: "FSH", min: 1, max: 12 },
        { search: "Adrenocorticotropic Hormone (ACTH)", id: "14674-6", label: "ACTH", min: 2, max: 11 },
        { search: "Mullerian Inhibiting Substance", id: "48377-6", label: "AMH", min: 0.5, max: 5.0 },
        { search: "Luteinizing Hormone (LH)", id: "10501-5", label: "LH", min: 1, max: 12 },
        { search: "Sex Hormone Binding Globulin", id: "13967-5", label: "SHBG", min: 18, max: 110 },
        { search: "Testosterone Bioavailable Calculated", id: "41018-3A", label: "Bio Testo", min: 2.0, max: 12.0 },
        { search: "Testosterone Free Calculated", id: "XBC3866-7", label: "fTesto", min: 15, max: 50 },
        { search: "Insulin-Like Growth Factor-I", id: "2484-4", label: "IGF-1", min: 50, max: 300 },
        { search: "Parathyroid Hormone Intact", id: "14866-8", label: "PTH", min: 1.6, max: 6.9 },
        { search: "TSH Receptor Ab", id: "57416-0", label: "TRAB", min: 0, max: 1.75 },
        { search: "DHEA Sulphate", id: "14688-6", label: "DHEAS", min: 2, max: 10 },
        { search: "25-Hydroxyvitamin D", id: "68438-1", label: "Vit D", min: 75, max: 250 },
        { search: "Androstenedione", id: "14603-5", label: "Andro", min: 1.0, max: 10.0 },
        { search: "Vitamin B12", id: "14685-2", label: "B12", min: 150, max: 650 },
        { search: "Testosterone", id: "14913-8", label: "Testo", min: 8, max: 28 },
        { search: "Progesterone", id: "14890-8", label: "Prog", min: 0, max: 60 },
        { search: "Estradiol", id: "14715-7", label: "E2", min: 100, max: 1500 },
        { search: "Prolactin", id: "2842-3", label: "Prolactin", min: 5, max: 25 },
        { search: "T4 Free", id: "14920-3", label: "fT4", min: 10, max: 23 },
        { search: "T3 Free", id: "14928-6", label: "fT3", min: 3.5, max: 6.5 },
        { search: "Prostate", id: "2857-1", label: "PSA", min: 0, max: 4.0 },
        { search: "TSH", id: "3016-3", label: "TSH", min: 0.35, max: 5.0 },
        { search: "Vitamin A", id: "14905-4", label: "Vitamin A", min: 1, max: 3 },
        { search: "Vitamin E (Alpha Tocopherol)", id: "14590-4", label: "Vitamin E (Alpha Tocopherol)", min: 13, max: 40 },
        { search: "Vitamin E/Cholesterol", id: "59250-1", label: "Vitamin E/Cholesterol", min: 3, max: 5 },

        // INFECTIOUS DISEASE / SEROLOGY
        { search: "Urine Neisseria gonorrhoeae rRNA (PCR/NAAT)", id: "60256-5", label: "Gonorrhoaea", min: 0, max: 0 },
        { search: "Urine Chlamydia trachomatis rRNA (PCR/NAAT)", id: "42931-6", label: "Chlamydia", min: 0, max: 0 },
        { search: "Chlamydia trachomatis rRNA (PCR/NAAT)", id: "43304-5", label: "Chlamydia", min: 0, max: 0 },
        { search: "Neisseria gonorrhoeae rRNA (PCR/NAAT)", id: "43305-2", label: "Gonorrhoeae", min: 0, max: 0 },
        { search: "HIV 1+2 Ab + HIV p24 Ag (Screen)", id: "XXX-2887", label: "HIV", min: 0, max: 0 },
        { search: "Hep B Surface antibody (HBsAb)", id: "16935-9", label: "HBsAb", min: 10, max: 1000 },
        { search: "Hep B Surface antigen (HBsAg)", id: "5195-3", label: "HBsAg", min: 0, max: 0 },
        { search: "Hep B Core antibody (HBcAb)", id: "16933-4", label: "HBcAb", min: 0, max: 0 },
        { search: "Treponema pallidum Ab (EIA)", id: "24110-9", label: "Treponema EIA", min: 0, max: 0 },
        { search: "Hep B Virus DNA (PCR/NAAT)", id: "42595-9", label: "HBV DNA", min: 0, max: 0 },
        { search: "Varicella Zoster Virus Ab IgG", id: "15410-4", label: "Varicella IgG", min: 150, max: 1000 },
        { search: "Rubella Virus Ab IgG", id: "5334-8", label: "Rubella IgG", min: 10, max: 500 },
        { search: "Hepatitis C Virus Ab", id: "13955-0", label: "HCV Ab", min: 0, max: 0 },
        { search: "Helicobacter Pylori", id: "X10002", label: "H Pylori", min: 0, max: 0 },
        { search: "Hepatitis B Virus Core Ab IgG+IgM (Total)", id: "51914-0", label: "Hepatitis B Virus Core Ab IgG+IgM (Total)", min: 0, max: 0 },
        { search: "Hepatitis B Virus Surface Ab", id: "5193-8", label: "Hepatitis B Virus Surface Ab", min: 0, max: 0 },
        { search: "Hepatitis B Virus Surface Ag", id: "5196-1", label: "Hepatitis B Virus Surface Ag", min: 0, max: 0 },
        { search: "aPTT Lupus Sensitive Actual/Normal", id: "48022-8", label: "aPTT Lupus Sensitive Actual/Normal", min: 0, max: 0 },
        { search: "DRVVT,", id: "6303-2", label: "DRVVT,", min: 0, max: 0 },
        { search: "Thrombophilia Interpretation", id: "XXX-2354", label: "Thrombophilia Interpretation", min: 0, max: 0 },
        { search: "Cardiolipin Ab IgG", id: "3181-5", label: "Cardiolipin Ab IgG", min: 0, max: 20 },
        { search: "Cardiolipin Ab IgM", id: "3182-3", label: "Cardiolipin Ab IgM", min: 0, max: 20 },
        { search: "Beta 2 Glycoprotein 1 Ab IgG", id: "16135-6", label: "Beta 2 Glycoprotein 1 Ab IgG", min: 0, max: 20 },
        { search: "Beta 2 Glycoprotein 1 Ab IgM", id: "16136-4", label: "Beta 2 Glycoprotein 1 Ab IgM", min: 0, max: 20 },
        { search: "IgG", id: "2465-3", label: "IgG", min: 7, max: 16 },
        { search: "IgA", id: "2458-8", label: "IgA", min: 0.7, max: 4 },
        { search: "IgM", id: "2472-9", label: "IgM", min: 0.4, max: 2.3 },
        { search: "Cryoglobulin", id: "12203-6", label: "Cryoglobulin", min: 0, max: 0.04 },
        { search: "Proteinase 3 Ab", id: "6968-2", label: "Proteinase 3 Ab", min: 0, max: 1 },
        { search: "Myeloperoxidase Ab", id: "6969-0", label: "Myeloperoxidase Ab", min: 0, max: 1 },
        { search: "IgG Subclass 1", id: "2466-1", label: "IgG Subclass 1", min: 2.8, max: 8 },
        { search: "IgG Subclass 2", id: "2467-9", label: "IgG Subclass 2", min: 1.15, max: 5.7 },
        { search: "IgG Subclass 3", id: "2468-7", label: "IgG Subclass 3", min: 0.24, max: 1.25 },
        { search: "IgG Subclass 4", id: "2469-5", label: "IgG Subclass 4", min: 0.052, max: 1.250 },
      
        // IMMUNOLOGY & INFLAMMATION
        { search: "Extractable Nuclear Ab Screen", id: "14722-3", label: "ENA", min: 0, max: 0 },
        { search: "Tissue Transglutaminase Ab IgA", id: "31017-7", label: "anti-TTG", min: 0, max: 12 },
        { search: "C Reactive Protein (High Sensitivity)", id: "30522-7", label: "hsCRP", min: 0, max: 2.0 },
        { search: "Cyclic Citrullinated Peptide Ab", id: "32218-0", label: "anti-CCP", min: 0, max: 20 },
        { search: "Nuclear Ab Titre and Pattern", id: "XXX-2435", label: "ANA", min: 0, max: 0 },
        { search: "Fecal Calprotectin", id: "38445-3", label: "Calpro", min: 0, max: 50 },
        { search: "C Reactive Protein", id: "1988-5", label: "CRP", min: 0, max: 8.0 },
        { search: "Rheumatoid Factor", id: "11572-5", label: "RF", min: 0, max: 14 },
        { search: "Nuclear Ab Titre", id: "5048-4", label: "ANA", min: 0, max: 0 },
        { search: "Complement C3", id: "4485-9", label: "C3", min: 0.9, max: 1.8 },
        { search: "Complement C4", id: "4498-2", label: "C4", min: 0.15, max: 0.5 },
        { search: "Tacrolimus", id: "11253-2", label: "Tacrolimus", min: 4, max: 15 },
        { search: "DNA Double Strand Ab", id: "5130-0", label: "DNA Double Strand Ab", min: 0, max: 4 },
        { search: "Extractable Nuclear Ab Screen", id: "14722-3", label: "Extractable Nuclear Ab Screen", min: 0, max: 0 },
        { search: "Smith Ab", id: "5356-1", label: "Smith Ab", min: 0, max: 1 },
        { search: "Ribonucleoprotein Ab", id: "5301-7", label: "Ribonucleoprotein Ab", min: 0, max: 1 },
        { search: "Sjogrens Syndrome-A Ab", id: "5351-2", label: "Sjogrens Syndrome-A Ab", min: 0, max: 1 },
        { search: "Sjogrens Syndrome-B Ab", id: "5353-8", label: "Sjogrens Syndrome-B Ab", min: 0, max: 1 },
        { search: "Scl70 Ab", id: "5348-8", label: "Scl70 Ab", min: 0, max: 1 },
        { search: "Jo-1 Ab", id: "5234-0", label: "Jo-1 Ab", min: 0, max: 1 },
        { search: "HLA B27", id: "26043-0", label: "HLA B27", min: 0, max: 0 },
        { search: "HLA-B*58:01", id: "79711-8", label: "HLA-B*58:01", min: 0, max: 0 },
        { search: "IgE", id: "19113-0", label: "IgE", min: 0, max: 107 },
        { search: "Light Chains Kappa Free", id: "36916-5", label: "Light Chains Kappa Free", min: 3.3, max: 19.4 },
        { search: "Light Chains Lambda Free", id: "33944-0", label: "Light Chains Lambda Free", min: 5.7, max: 26.3 },
        { search: "Light Chains Kappa Free/Light Chains Lambda Free", id: "48378-4", label: "Light Chains Kappa Free/Light Chains Lambda Free", min: 0.26, max: 1.65 },

        // ONCOLOGY & PREGNANCY
        { search: "Choriogonadotropin Intact+Beta Subunit", id: "45194-8", label: "bhCG", min: 0, max: 5 },
        { search: "Occult Blood Immunochemical", id: "58453-2", label: "FIT", min: 0, max: 100 },
        { search: "Alpha-1-Fetoprotein", id: "1834-1", label: "AFP", min: 0, max: 8 },
        { search: "Carcinoembryonic Ag", id: "XBC3679-9", label: "CEA", min: 0, max: 3.0 },
        { search: "Cancer Antigen 19-9", id: "XBC3671-7", label: "CA 19-9", min: 0, max: 37 },
        { search: "Cancer Antigen 125", id: "XBC3673-5", label: "CA 125", min: 0, max: 35 },
        { search: "HCG Serum", id: "21198-7", label: "bhCG", min: 0, max: 5 },

        // URINALYSIS / GASES
        { search: "Specific Gravity", id: "2965-2", label: "Sp. Grav", min: 1.005, max: 1.030 },
        { search: "Specific Gravity", id: "5811-5", label: "Sp. Grav", min: 1.005, max: 1.030 },
        { search: "Urine Hemoglobin", id: "5794-3", label: "U Hgb", min: 0, max: 0 },
        { search: "Carbon Dioxide", id: "2028-9", label: "CO2", min: 22, max: 30 },
        { search: "Protein", id: "5804-0", label: "U Prot", min: 0, max: 0.15 },
        { search: "Glucose", id: "22705-8", label: "U Gluc", min: 0, max: 0.8 },
        { search: "Ketones", id: "2514-8", label: "U Keto", min: 0, max: 0 },
        { search: "Bilirubin", id: "5770-3", label: "U Bili", min: 0, max: 0 },
        { search: "Nitrite", id: "5802-4", label: "Nitrite", min: 0, max: 0 },
        { search: "Leukocytes", id: "5799-2", label: "U Leuks", min: 0, max: 0 },
        { search: "Casts", id: "9842-6", label: "Casts", min: 0, max: 0 },
        { search: "pH", id: "5803-2", label: "pH", min: 5.0, max: 8.0 },
        { search: "Squamous Epithelial Cells", id: "11277-1", label: "Squamous Epithelial Cells", min: 0, max: 0 },
        { search: "Non-Squamous Epithelial Cells", id: "41284-1", label: "Non-Squamous Epithelial Cells", min: 0, max: 0 },
        { search: "Hyaline Casts", id: "46135-0", label: "Hyaline Casts", min: 0, max: 0 },
        { search: "Pathological Casts", id: "78740-8", label: "Pathological Casts", min: 0, max: 0 },
        { search: "Granular Casts", id: "46134-3", label: "Granular Casts", min: 0, max: 0 },
        { search: "Crystals", id: "38459-4", label: "Crystals", min: 0, max: 0 },
        { search: "RBC Morphology", id: "6742-1", label: "RBC Morphology", min: 0, max: 0 },
    ];

    labConfigs.sort((a, b) => b.search.length - a.search.length);

    let currentHoveredCell = null;
    let hoverTimeout = null;

    function generateSparkline(values, isLatestAbnormal, config) {
        if (values.length < 2) return "";
        const width = 160; 
        const height = 35;
        
        const dataMin = Math.min(...values); 
        const dataMax = Math.max(...values);
        const viewMin = Math.min(dataMin, config.min) * 0.85; 
        const viewMax = Math.max(dataMax, config.max) * 1.15;
        const viewRange = viewMax - viewMin || 1;

        const getX = (i) => (i / (values.length - 1)) * width;
        const getY = (val) => height - ((val - viewMin) / viewRange) * height;
        const rev = [...values].reverse();
        const points = rev.map((val, i) => `${getX(i)},${getY(val)}`).join(" ");
        
        const yTop = getY(config.max);
        const yBottom = getY(config.min);
        const rangeBox = `<rect x="0" y="${Math.min(yTop, yBottom)}" width="${width}" height="${Math.abs(yBottom - yTop)}" fill="#f0f0f0" />`;

        const dotColor = isLatestAbnormal ? "red" : "black";

        return `<div style="margin:4px 0 8px 0; width: 160px;">
            <svg width="${width}" height="${height}" style="overflow:visible; background:transparent;">
                ${rangeBox}
                <polyline fill="none" stroke="black" stroke-width="1.5" points="${points}" stroke-linejoin="round" stroke-linecap="round" />
                <circle cx="${width}" cy="${getY(rev[rev.length-1])}" r="3" fill="${dotColor}" stroke="white" stroke-width="0.5" />
            </svg>
        </div>`;
    }

    function scan() {
        document.querySelectorAll('tr td:first-child:not([data-hooked])').forEach(cell => {
            const cellText = cell.innerText.trim();
            if (!cellText || cell.querySelector('input, button')) return;

            for (let config of labConfigs) {
                if (cellText.toLowerCase().includes(config.search.toLowerCase())) {
                    cell.setAttribute('data-hooked', 'true');
                    cell.style.cursor = "help";

                    cell.addEventListener('mouseenter', () => {
                        clearTimeout(hoverTimeout);
                        hoverTimeout = setTimeout(() => {
                            currentHoveredCell = cell;
                            const pId = getDemographicId(cell); 
                            if (!pId) return;
                            const url = `/oscar/lab/CA/ON/labValues.jsp?testName=${encodeURIComponent(config.search)}&demo=${pId}&labType=HL7&identifier=${config.id}`;
                            getData(url, config);
                        }, 200);
                    });

                    cell.addEventListener('mousemove', (e) => {
                        const buffer = 15;
                        const tipWidth = tooltip.offsetWidth || 176;
                        const tipHeight = tooltip.offsetHeight || 200;

                        let x = e.clientX + buffer;
                        let y = e.clientY + buffer;

                        if (x + tipWidth > window.innerWidth) {
                            x = e.clientX - tipWidth - buffer;
                        }

                        if (y + tipHeight > window.innerHeight) {
                            y = e.clientY - tipHeight - buffer;
                        }

                        x = Math.max(5, x);
                        y = Math.max(5, y);

                        tooltip.style.left = x + 'px';
                        tooltip.style.top = y + 'px';
                    });
                    
                    cell.addEventListener('mouseleave', () => { 
                        clearTimeout(hoverTimeout);
                        currentHoveredCell = null;
                        tooltip.style.visibility = 'hidden'; 
                    });
                    break; 
                }
            }
        });
    }

    function getData(url, config) {
        const gmFunc = (typeof GM_xmlhttpRequest !== 'undefined') ? GM_xmlhttpRequest : GM.xmlHttpRequest;
        gmFunc({ method: "GET", url: url, onload: (res) => parseHTML(res.responseText, config) });
    }

    function parseHTML(htmlText, config) {
        if (!currentHoveredCell) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        const rows = doc.querySelectorAll('tr');
        let resultsHtml = ""; let dataPoints = []; let count = 0; let latestAbnormal = false;

        for (let i = 0; i < rows.length; i++) {
            if (count >= 20) break;

            const tds = rows[i].querySelectorAll('td');
            if (tds.length >= 6) {
                const rawDate = tds[5].innerText.trim();
                if (/^\d{4}/.test(rawDate) && !rows[i].innerText.includes("Patient Name")) {
                    const valStr = tds[1].innerText.trim();
                    const valNum = parseFloat(valStr.replace(/[^\d.-]/g, ''));
                    const abnFlag = tds[2].innerText.trim().toUpperCase(); 
                    const isAbnormal = (abnFlag !== '' && abnFlag !== 'N' && abnFlag !== 'NORMAL');

                    if (count === 0) latestAbnormal = isAbnormal;
                    if (!isNaN(valNum)) dataPoints.push(valNum);

                    resultsHtml += `<div style="display:flex; font-size:10px; border-bottom:1px solid #eee; padding:1px 0;">
                        <span style="color:#666; width:70px;">${rawDate.split(' ')[0]}</span>
                        <span style="flex-grow:1; text-align:right; padding-right:2px; ${isAbnormal ? 'color:red; font-weight:bold;' : ''}">${valStr}</span>
                    </div>`;
                    count++;
                }
            }
        }

        if (count > 0) {
            const spark = count > 1 ? generateSparkline(dataPoints, latestAbnormal, config) : "";
            tooltip.innerHTML = `<b style="font-size:11px; display:block; margin-bottom:4px;">${config.label} History</b><div style="width:160px;">${spark}${resultsHtml}</div>`;
            tooltip.style.visibility = 'visible';
        } else {
            tooltip.style.visibility = 'hidden';
        }
    }

// 1. Define the interval variable so we can change it
let scanTimer = setInterval(scan, 200); // Fast scan (twice per second) at start

// 2. Set a timer to switch to "Idle Mode" after 5 seconds
setTimeout(() => {
    clearInterval(scanTimer); // Stop the fast scan
    
    // 3. Start a slow "Idle Scan" once every 5 seconds 
    // This catches any data that was delayed or loaded via user interaction
    scanTimer = setInterval(scan, 5000); 
    
    console.log("Lab Hover: Switched to Idle Mode (5s interval) to save CPU.");
}, 5000);
})();
