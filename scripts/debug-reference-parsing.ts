
// Mock the parseReference function from app/doctor/page.tsx
// We need to copy the logic here because we can't easily import from a Next.js page component in a standalone script

function parseReference(reference: string) {
    let title = '';
    let authors = '';
    let journal = '';
    let year = '';
    let volume = '';
    let pages = '';
    let doi = '';
    let pmid = '';
    let bookshelfId = '';
    let pmcid = '';
    let source = '';
    let url = '';
    let isValid = true;

    // Clean up the reference string
    reference = reference.trim();

    // Remove leading numbering (e.g., "1. ", "2. ", "- ")
    reference = reference.replace(/^[\d\.\-\s]+/, '');

    // Extract URL if present (markdown link or raw URL)
    const markdownLinkMatch = reference.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/);
    const rawUrlMatch = reference.match(/(https?:\/\/[^\s]+)/);

    if (markdownLinkMatch) {
        title = markdownLinkMatch[1];
        url = markdownLinkMatch[2];
        // Remove the link from the reference to parse the rest
        reference = reference.replace(markdownLinkMatch[0], '').trim();
    } else if (rawUrlMatch) {
        url = rawUrlMatch[0];
        // If the URL is at the end, remove it
        reference = reference.replace(rawUrlMatch[0], '').trim();
    }

    // Extract Year (4 digits in parentheses or standalone)
    const yearMatch = reference.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
        year = yearMatch[0];
    }

    // Extract DOI
    const doiMatch = reference.match(/doi:\s*(\S+)/i) || reference.match(/10\.\d{4,}\/\S+/);
    if (doiMatch) {
        doi = doiMatch[1] || doiMatch[0];
        // Clean trailing punctuation
        doi = doi.replace(/[.,;)]+$/, '');
    }

    // Extract PMID
    const pmidMatch = reference.match(/PMID:?\s*(\d+)/i);
    if (pmidMatch) {
        pmid = pmidMatch[1];
    }

    // Heuristic parsing for Title, Authors, Journal if not already found
    if (!title) {
        // Split by dots or newlines
        const parts = reference.split(/[.\n]+/).map(p => p.trim()).filter(p => p);

        if (parts.length > 0) {
            // Assume first part is title if it's long enough, otherwise authors
            if (parts[0].length > 50 || parts[0].includes('Guideline') || parts[0].includes('Study') || parts[0].includes('Trial')) {
                title = parts[0];
                if (parts.length > 1) authors = parts[1]; // Fallback
            } else {
                authors = parts[0];
                if (parts.length > 1) title = parts[1];
            }
        }
    }

    // If we still don't have a title, use the whole reference string (truncated)
    if (!title) {
        title = reference;
    }

    // Detect badges
    const leadingJournals = ['New England Journal of Medicine', 'NEJM', 'Lancet', 'JAMA', 'Nature', 'Science', 'BMJ', 'Cell', 'Circulation', 'European Heart Journal'];
    const refLower = reference.toLowerCase();
    const titleLower = title.toLowerCase();
    const badgeMatches = reference.match(/\[([^\]]+)\]/g); // Detect badges

    let isLeadingJournal = leadingJournals.some(lj =>
        (journal && journal.toLowerCase().includes(lj.toLowerCase())) ||
        reference.toLowerCase().includes(lj.toLowerCase())
    );
    let isSystematicReview = refLower.includes('systematic review') ||
        refLower.includes('meta-analysis') ||
        refLower.includes('cochrane') ||
        titleLower.includes('systematic review') ||
        titleLower.includes('meta-analysis');

    let isOpenAccess = refLower.includes('open access') ||
        refLower.includes('pmc') ||
        refLower.includes('free full text');

    let isPracticeGuideline = false;
    let isNewResearch = false;
    let isRCT = false;

    // Check badges first
    if (badgeMatches) {
        badgeMatches.forEach(badge => {
            const content = badge.replace(/[\[\]]/g, '').toLowerCase();
            if (content.includes('leading journal')) isLeadingJournal = true;
            if (content.includes('systematic review')) isSystematicReview = true;
            if (content.includes('open access')) isOpenAccess = true;
            if (content.includes('practice guideline') || content.includes('guideline')) isPracticeGuideline = true;
            if (content.includes('new research') || content.includes('recent')) isNewResearch = true;
            if (content.includes('rct') || content.includes('clinical trial')) isRCT = true;
        });
    }

    // Fallback: Check title for keywords if no badges found
    if (!isPracticeGuideline) {
        isPracticeGuideline = titleLower.includes('guideline') ||
            titleLower.includes('consensus') ||
            titleLower.includes('position paper') ||
            titleLower.includes('scientific statement') ||
            titleLower.includes('standards of care');
    }

    // Refined source detection
    if (!source) {
        if (refLower.includes('heart.org') || refLower.includes('american heart') || refLower.includes('circulation') || refLower.includes('stroke') || titleLower.includes('american heart association') || titleLower.includes('aha/')) source = 'aha';
        else if (refLower.includes('acc.org') || refLower.includes('american college of cardiology') || refLower.includes('jacc') || titleLower.includes('acc/') || titleLower.includes('american college of cardiology')) source = 'acc';
        else if (refLower.includes('escardio') || refLower.includes('european society of cardiology') || refLower.includes('eur heart j') || titleLower.includes('esc ') || titleLower.includes('european society of cardiology')) source = 'esc';
        else if (refLower.includes('diabetes.org') || refLower.includes('diabetes care') || refLower.includes('ada standards') || titleLower.includes('american diabetes association')) source = 'ada';
        else if (refLower.includes('kdigo') || refLower.includes('kidney disease')) source = 'kdigo';
        else if (refLower.includes('chest') || refLower.includes('chestnet')) source = 'chest';
        else if (refLower.includes('cochrane')) source = 'cochrane';
        else if (refLower.includes('jama')) source = 'jama';
        else if (refLower.includes('nejm') || refLower.includes('new england')) source = 'nejm';
        else if (refLower.includes('lancet')) source = 'lancet';
        else if (refLower.includes('bmj')) source = 'bmj';
        else if (refLower.includes('nature')) source = 'nature';
        else if (refLower.includes('science')) source = 'science';
        else if (refLower.includes('fda.gov') || refLower.includes('dailymed')) source = 'fda';
        else if (refLower.includes('cdc.gov') || refLower.includes('cdc ')) source = 'cdc';
        else if (refLower.includes('who.int') || refLower.includes('world health')) source = 'who';
        else if (refLower.includes('nice.org.uk') || refLower.includes('nice guideline')) source = 'nice';
        else if (refLower.includes('nih.gov') || refLower.includes('pubmed') || refLower.includes('ncbi')) source = 'nih';
        else if (refLower.includes('acg ') || titleLower.includes('acg ') || titleLower.includes('american college of gastroenterology')) source = 'acg';
        else if (refLower.includes('ehra') || titleLower.includes('european heart rhythm association')) source = 'ehra';
    }

    return {
        title,
        authors,
        journal,
        year,
        volume,
        pages,
        doi,
        pmid,
        bookshelfId,
        pmcid,
        source,
        url,
        isLeadingJournal,
        isSystematicReview,
        isOpenAccess,
        isPracticeGuideline,
        isNewResearch,
        isRCT,
        isValid
    };
}

// Test cases from the user's response
const testReferences = [
    ". 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation. 2023.",
    "[2021 European Heart Rhythm Association Practical Guide on the Use of Non-Vitamin K Antagonist Oral Anticoagulants in Patients with Atrial Fibrillation](https://doi.org/10.1093/europace/euab217). 2021. doi:10.1093/europace/euab217.",
    ". ACG Clinical Guideline: Upper Gastrointestinal Bleeding in Patients on Antithrombotic Agents.",
    ". ESC Guidelines for the management of atrial fibrillation."
];

console.log("--- Testing Reference Parsing ---");
testReferences.forEach((ref, idx) => {
    console.log(`\nReference ${idx + 1}: ${ref}`);
    const parsed = parseReference(ref);
    console.log(JSON.stringify(parsed, null, 2));
});
