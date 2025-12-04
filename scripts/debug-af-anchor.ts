import { detectClinicalScenarios } from '../lib/evidence/guideline-anchors';

const query = "Management of Atrial Fibrillation in a patient on Hemodialysis with a recent GI bleed";

console.log(`Testing Query: "${query}"`);

const scenarios = detectClinicalScenarios(query);

console.log(`Detected Scenarios: ${scenarios.length}`);
scenarios.forEach(s => {
    console.log(`- Keywords: ${s.keywords.join(", ")}`);
    console.log(`- Primary Guideline: ${s.primaryGuidelines[0].name}`);
});

if (scenarios.length === 0) {
    console.log("❌ NO MATCH FOUND");

    // Debug individual keywords
    const { ANCHOR_GUIDELINES } = require('../lib/evidence/guideline-anchors');
    const afScenario = ANCHOR_GUIDELINES.atrial_fibrillation;

    if (afScenario) {
        console.log("\nDebugging AF Keywords:");
        afScenario.keywords.forEach((keyword: string) => {
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
            const match = regex.test(query);
            console.log(`- "${keyword}" -> Regex: /\\b${escapedKeyword}\\b/i -> Match: ${match}`);
        });
    } else {
        console.log("❌ 'atrial_fibrillation' key not found in ANCHOR_GUIDELINES");
    }
}
