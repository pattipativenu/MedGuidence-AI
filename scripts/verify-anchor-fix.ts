
// Mock external modules to speed up test
const mockSearch = async () => [];
const mockSearchWithCount = async () => ({ totalResults: 0, healthTopics: [], drugInfo: [] });
const mockSearchDrugs = async () => ({ drugs: [], classes: [], interactions: [] });

// Mock the heavy imports
import * as engine from '../lib/evidence/engine';

// We need to intercept the actual calls or just accept they will run.
// Since we can't easily mock internal functions of a module without a library like proxyquire or jest,
// we will just run it and expect it to be slow, but we'll check the result.

async function runTest() {
    const query = "Management of Atrial Fibrillation in a patient on Hemodialysis with a recent GI bleed";
    console.log(`🔍 Testing gatherEvidence with query: "${query}"`);

    try {
        const evidence = await engine.gatherEvidence(query);

        console.log("\n📊 Evidence Guidelines Result:");
        console.log(`Total Guidelines: ${evidence.guidelines.length}`);

        const anchors = evidence.guidelines.filter(g => g.type === 'Anchor Guideline');
        console.log(`Anchor Guidelines: ${anchors.length}`);

        anchors.forEach(a => {
            console.log(`- ✅ Found Anchor: ${a.title} (${a.source})`);
        });

        if (anchors.length > 0) {
            console.log("\n✅ SUCCESS: Anchor guidelines were correctly integrated!");
        } else {
            console.log("\n❌ FAILURE: No anchor guidelines found in the output.");
        }

    } catch (error) {
        console.error("Test failed with error:", error);
    }
}

runTest();
