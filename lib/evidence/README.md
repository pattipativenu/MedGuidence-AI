# MedGuidance AI Evidence Engine

## Overview
The Evidence Engine is the core system that retrieves and integrates clinical evidence from multiple open, legitimate sources to support evidence-based medical decision-making.

## Architecture

### PICO-First Query Processing ✨ NEW

The Evidence Engine now uses a **PICO-first architecture** where every Doctor Mode query goes through structured extraction, generating `disease_tags` and `decision_tags` that drive all downstream modules.

**File: `pico-extractor.ts`**

#### PICO Framework
- **P (Patient/Population)**: Who is the patient? (age, gender, conditions)
- **I (Intervention)**: What treatment/test/exposure?
- **C (Comparison)**: What is the alternative? (optional)
- **O (Outcome)**: What are you trying to accomplish/measure?

#### Tag-Based Classification

The system extracts structured tags from clinical queries:

**Disease Tags** (15+ conditions):
- Cardiovascular: `AF`, `CKD`, `HF`, `CAD`, `HTN`, `STROKE`, `PCI`, `AHRE`
- Infectious: `CAP`, `SEPSIS`, `HAP`
- GI: `GI_BLEED`
- Metabolic: `DIABETES`
- Hematologic: `HBR`, `VTE`

**Decision Tags** (10+ decision types):
- `anticoagulation`, `antiplatelet`, `drug_choice`, `duration`
- `de-escalation`, `monitoring`, `dose`, `restart`, `therapy`, `LAAO`

#### Query Decomposition

Long queries (>100 words) are automatically decomposed into 3-4 focused sub-queries:
1. **Core Decision**: Primary management question (≤20 words)
2. **Complications**: Comorbidity-specific considerations
3. **Duration/Monitoring**: Follow-up and surveillance
4. **Alternatives**: Non-pharmacologic options

```typescript
import { 
  extractPICO, 
  generateTagsFromQuery, 
  decomposeQuery,
  extractDiseaseTags,
  extractDecisionTags 
} from "@/lib/evidence/pico-extractor";

// Fast synchronous tag extraction
const tags = generateTagsFromQuery("Patient with AF and CKD needs anticoagulation");
// Returns: {
//   disease_tags: ['AF', 'CKD'],
//   decision_tags: ['anticoagulation'],
//   primary_disease_tag: 'AF',
//   secondary_disease_tags: ['CKD'],
//   primary_decision_tag: 'anticoagulation',
//   secondary_decision_tags: []
// }

// Full PICO extraction (AI-powered with fallback)
const pico = await extractPICO("78-year-old woman with AF and CKD stage 4...");
// Returns: {
//   patient: "78-year-old woman with AF, CKD",
//   intervention: "anticoagulation",
//   comparison: null,
//   outcome: "stroke prevention",
//   condition: "atrial fibrillation",
//   disease_tags: ['AF', 'CKD'],
//   decision_tags: ['anticoagulation'],
//   ...
// }

// Query decomposition for long queries
const decomposition = await decomposeQuery(longQuery, pico);
// Returns: {
//   original_query: "...",
//   word_count: 150,
//   should_decompose: true,
//   sub_queries: [
//     { query: "atrial fibrillation chronic kidney disease anticoagulation guideline recommendations", category: "core_decision", target_evidence: "guideline" },
//     { query: "atrial fibrillation advanced chronic kidney disease anticoagulation outcomes", category: "complications", target_evidence: "systematic_review" },
//     ...
//   ]
// }
```

### Evidence Sources

1. **ClinicalTrials.gov API**
   - Global clinical trial registry
   - Includes completed, ongoing, and terminated trials
   - Provides trial design, interventions, outcomes, and results
   - File: `clinical-trials.ts`

2. **openFDA API**
   - FDA drug product labels (indications, dosing, contraindications, warnings)
   - FAERS adverse event reports
   - Drug recall enforcement data
   - Files: `openfda.ts`

3. **OpenAlex API**
   - Open scholarly literature catalog
   - Systematic reviews and meta-analyses
   - RCTs and observational studies
   - Citation counts and open access status
   - File: `openalex.ts`

4. **PubMed/NCBI E-utilities**
   - Direct access to PubMed indexed articles
   - MeSH term indexing
   - Abstracts and full metadata
   - Systematic reviews and RCTs
   - File: `pubmed.ts`

5. **Europe PMC REST API**
   - 40+ million abstracts from life sciences
   - **Includes preprints** (bioRxiv, medRxiv, etc.)
   - Open access full-text articles
   - Citations and references
   - No API key required
   - File: `europepmc.ts`

6. **Cochrane Library (via PubMed)** ✨ NEW
   - Gold standard systematic reviews
   - Accessed through PubMed indexing (legitimate, free)
   - Intervention, diagnostic, and methodology reviews
   - Highest quality evidence synthesis
   - No API key required
   - File: `cochrane.ts`

7. **Landmark Trials Database** ✨ NEW
   - Curated database of 17+ high-impact clinical trials
   - Covers: DAPT, Heart Failure, CKD, AF, Stroke, Sepsis
   - Includes full metadata: PMID, DOI, URL, key findings
   - Smart keyword matching for query-relevant trials
   - File: `landmark-trials.ts`

8. **Query Classifier** ✨ NEW
   - Tag-based query classification for accurate MeSH expansion
   - Classifies queries into: cardiology/anticoagulation, cardiology/heart_failure, cardiology/dapt, infectious/pneumonia, infectious/sepsis, nephrology/ckd, lifestyle/prevention, general
   - Returns allowed and excluded MeSH terms per classification
   - Prevents off-topic MeSH expansion (e.g., no "Primary Prevention" for anticoagulation queries)
   - File: `query-classifier.ts`

9. **Future Integrations**
   - WHO ICTRP (International Clinical Trials Registry Platform)
   - NLM Open-i (medical images)

### Main Coordinator

**`engine.ts`** - Orchestrates all evidence sources:
- Runs parallel searches across all APIs
- Aggregates results into unified `EvidencePackage`
- Formats evidence for AI prompt inclusion
- Logs evidence retrieval metrics

**`guideline-anchors.ts`** - Pre-defined anchor guidelines for common scenarios:
- Detects clinical scenarios from query keywords
- Provides gold-standard guidelines for consistent answers
- Includes 10+ common scenarios (sepsis, CAP, diabetes, heart failure, etc.)
- Each scenario includes primary guidelines, key reviews, and landmark trials
- Automatically injects anchor guidelines into AI prompts for priority sourcing

## Usage

### Basic Evidence Gathering

```typescript
import { gatherEvidence, formatEvidenceForPrompt } from "@/lib/evidence/engine";

// Gather evidence for a clinical query
const evidence = await gatherEvidence(
  "Management of acute myocardial infarction",
  ["aspirin", "clopidogrel"] // Optional drug names
);

// Format for AI prompt
const promptContext = formatEvidenceForPrompt(evidence);
```

### Using Anchor Guidelines

```typescript
import { 
  getAnchorGuidelines, 
  formatAnchorGuidelinesForPrompt,
  detectClinicalScenarios 
} from "@/lib/evidence/guideline-anchors";

// Detect which clinical scenarios match the query
const scenarios = detectClinicalScenarios("patient with septic shock");
// Returns: [{ keywords: ['sepsis', 'septic shock', ...], primaryGuidelines: [...], ... }]

// Get anchor guidelines for a query
const guidelines = getAnchorGuidelines("community-acquired pneumonia treatment");
// Returns: [{ name: 'IDSA/ATS CAP Guidelines 2019', organization: '...', ... }]

// Format for AI prompt injection
const anchorPrompt = formatAnchorGuidelinesForPrompt(guidelines);
// Injects formatted guidelines with "USE THESE FIRST" instructions
```

### Using Landmark Trials Database

```typescript
import { 
  searchLandmarkTrials, 
  getTrialByAcronym,
  getTrialsBySpecialty,
  formatLandmarkTrialsForPrompt 
} from "@/lib/evidence/landmark-trials";

// Search trials by query (keyword matching)
const trials = searchLandmarkTrials("DAPT high bleeding risk", 5);
// Returns: [MASTER-DAPT, TWILIGHT, STOPDAPT-2]

// Get specific trial by acronym
const trial = getTrialByAcronym("DAPA-HF");
// Returns: { acronym: "DAPA-HF", fullName: "...", pmid: "31535829", ... }

// Get all trials for a specialty
const cardioTrials = getTrialsBySpecialty("Cardiology");
// Returns: [MASTER-DAPT, TWILIGHT, DAPA-HF, EMPEROR-Reduced, ...]

// Format for AI prompt injection
const trialsPrompt = formatLandmarkTrialsForPrompt(trials);
// Injects formatted trials with full metadata
```

### Using Query Classifier ✨ NEW

```typescript
import { 
  classifyQuery,
  isAnticoagulationQuery,
  isTreatmentQuery,
  filterMeSHTerms,
  getAdditionalMeSHForTags
} from "@/lib/evidence/query-classifier";

// Classify query based on extracted tags
const result = classifyQuery(['AF', 'CKD'], ['anticoagulation', 'drug_choice']);
// Returns: {
//   classification: 'cardiology/anticoagulation',
//   allowed_mesh_terms: ['Atrial Fibrillation', 'Anticoagulants', 'Stroke', 'Hemorrhage', ...],
//   excluded_mesh_terms: ['Primary Prevention', 'Diabetes Mellitus', 'Exercise', ...],
//   confidence: 0.85,
//   matched_rule: 'af_anticoagulation'
// }

// Check if query is anticoagulation-related
const isAnticoag = isAnticoagulationQuery(result.classification);
// Returns: true

// Check if query is a treatment question (not lifestyle/prevention)
const isTreatment = isTreatmentQuery(result.classification);
// Returns: true

// Filter MeSH terms based on classification
const filteredMeSH = filterMeSHTerms(originalTerms, result);
// Removes excluded terms, adds allowed terms

// Get additional MeSH terms for specific disease tags
const additionalMeSH = getAdditionalMeSHForTags(['CKD', 'GI_BLEED']);
// Returns: ['Renal Insufficiency, Chronic', 'Kidney Failure, Chronic', 'Gastrointestinal Hemorrhage']
```

### Supported Clinical Scenarios

The anchor guidelines system includes pre-defined scenarios for:
- **Sepsis & Severe Infections** - Surviving Sepsis Campaign 2021
- **Community-Acquired Pneumonia** - IDSA/ATS CAP Guidelines 2019
- **Type 2 Diabetes & CKD** - ADA Standards 2025, KDIGO 2022
- **Heart Failure (HFrEF)** - ACC/AHA/HFSA Guidelines 2022
- **Atrial Fibrillation** - ACC/AHA/ACCP/HRS AF Guidelines 2023
- **Hypertension** - ACC/AHA Guidelines 2017
- **Pediatric CAP** - IDSA/PIDS Guidelines 2011
- **Pulmonary Embolism** - ESC Guidelines 2019, CHEST Guidelines 2021
- **Pregnancy Hypertension** - ACOG Practice Bulletin 2020
- **Acute Coronary Syndrome** - ACC/AHA STEMI Guidelines 2023
- **Stroke** - AHA/ASA Acute Ischemic Stroke Guidelines 2019

Each scenario includes:
- Primary guidelines with full metadata (name, organization, year, URL, PMID, DOI)
- Key recommendations extracted from guidelines
- Landmark trials (e.g., DAPA-CKD, EMPEROR-Reduced, CREDENCE)
- Systematic reviews (e.g., Cochrane reviews)

## Anchor-Aware Sufficiency Scoring ✨ NEW

The Evidence Engine includes an enhanced sufficiency scoring system that intelligently determines evidence quality and controls downstream processing (like Perplexity API calls).

**File: `sufficiency-scorer.ts`**

### How It Works

1. **Base Scoring**: Calculates a 0-100 score based on evidence types present:
   - Cochrane reviews: +30 points (gold standard)
   - Clinical guidelines: +25 points
   - RCTs with results: +20 points
   - Recent articles (≥5 in last 5 years): +15 points
   - Systematic reviews (non-Cochrane): +10 points

2. **Anchor Scenario Detection**: Matches disease + decision tags to pre-defined clinical scenarios:
   - `af_ckd_anticoagulation` - AF + CKD + anticoagulation
   - `cap_sepsis_antibiotics` - CAP/Sepsis + drug choice/duration
   - `dapt_hbr` - PCI + CAD + HBR + antiplatelet
   - `hfref_management` - Heart failure + therapy
   - And 7 more scenarios...

3. **Anchor Boosting**: When ≥3 anchor guidelines exist for a detected scenario, score is boosted to ≥70 (GOOD level)

4. **Perplexity Control**: Skips external Perplexity API calls when:
   - Score ≥50 (sufficient internal evidence)
   - OR anchor scenario detected with non-empty anchor pack

### Usage

```typescript
import { 
  scoreEvidenceSufficiency,
  scoreEvidenceSufficiencyWithTags,
  detectAnchorScenario,
  shouldCallPerplexity,
  ANCHOR_SCENARIOS,
  ANCHOR_SCENARIO_MAPPING
} from "@/lib/evidence/sufficiency-scorer";

// Basic sufficiency scoring
const basicScore = scoreEvidenceSufficiency(evidencePackage);
// Returns: { score: 55, level: 'good', reasoning: [...], breakdown: {...} }

// Enhanced tag-aware scoring
const enhancedScore = scoreEvidenceSufficiencyWithTags(
  evidencePackage,
  ['AF', 'CKD'],           // disease_tags
  ['anticoagulation']      // decision_tags
);
// Returns: {
//   score: 70,
//   level: 'good',
//   reasoning: ['Anchor scenario "af_ckd_anticoagulation" with 3 anchor guidelines'],
//   breakdown: {...},
//   anchor_count: 3,
//   matching_reviews: 2,
//   matching_trials: 5,
//   should_call_perplexity: false,  // Skipped - anchors sufficient
//   rerank_needed: false,
//   anchor_scenario: 'af_ckd_anticoagulation'
// }

// Check if Perplexity should be called
const callPerplexity = shouldCallPerplexity(score, anchorScenario, anchorCount);
// Returns: false (when anchors exist or score ≥50)
```

### Supported Anchor Scenarios

| Scenario | Disease Tags | Decision Tags |
|----------|--------------|---------------|
| `af_ckd_anticoagulation` | AF, CKD | anticoagulation, drug_choice, dose |
| `af_anticoagulation` | AF | anticoagulation, drug_choice, dose |
| `cap_sepsis_antibiotics` | CAP, SEPSIS | drug_choice, duration, de-escalation |
| `cap_duration` | CAP | duration, de-escalation |
| `dapt_hbr` | PCI, CAD, HBR | antiplatelet, duration, de-escalation |
| `hfpef_ckd` | HF, CKD | drug_choice, therapy |
| `hfref_management` | HF | drug_choice, therapy |
| `ahre_anticoagulation` | AHRE, AF | anticoagulation |
| `gi_bleed_anticoagulation_restart` | GI_BLEED, AF | restart, anticoagulation |
| `sepsis` | SEPSIS | drug_choice, duration, therapy |
| `diabetes_ckd` | DIABETES, CKD | drug_choice, therapy |

### Quality Levels

| Level | Score Range | Interpretation |
|-------|-------------|----------------|
| Excellent | 70-100 | Strong evidence base, high confidence |
| Good | 50-69 | Adequate evidence, well-supported |
| Limited | 30-49 | Limited evidence, use caution |
| Insufficient | 0-29 | Very limited, specialist consultation recommended |

## Evidence Hierarchy

The system prioritizes evidence according to clinical standards:

1. **Guidelines & Consensus Statements** (Highest)
   - IDSA, NICE, ADA, ACC/AHA, ESC, Surviving Sepsis Campaign
   - Always cite with full name and year (e.g., "Surviving Sepsis Campaign 2021")
2. **Systematic Reviews & Meta-Analyses**
   - Cochrane Library (gold standard)
   - JAMA, Lancet, BMJ systematic reviews
3. **Randomized Controlled Trials (RCTs)**
   - Cite specific trials by name (DAPA-CKD, EMPEROR-Reduced, CREDENCE)
4. **Observational Cohorts**
5. **Case Series & Case Reports**
6. **Expert Opinion / Mechanism-Only** (Lowest)

## Evidence Utilization Best Practices

**Response Length & Style:**
- Target 300-400 words MAXIMUM for clinical responses
- Match professional clinical response standards (concise, high-density)
- Write for peer clinicians (doctor-to-doctor tone)
- Eliminate repetition across sections
- Focus on actionable decisions, not background pathophysiology
- Skip sections that don't add value to the specific question

**Reference Quality Standards:**
- Use 6-10 high-quality references per answer (not just 3-4)
- Include at least 2 major guidelines by full name
- Include at least 1 Cochrane or systematic review
- Cite specific landmark trials when available
- Use diverse sources (not just BMJ Best Practice)
- Reference list must contain ONLY sources explicitly cited in the text

**URL and Citation Requirements:**
- ✅ Always use actual URLs from evidence sources (e.g., https://pubmed.ncbi.nlm.nih.gov/12345678, https://www.nejm.org/doi/10.1056/...)
- ❌ Never create Google search URLs (e.g., https://www.google.com/search?q=...)
- Every evidence item includes a direct URL - use it
- Each reference must have a real PMID or DOI (not fabricated)
- Reference list must contain ONLY sources explicitly cited in the text
- **URL Construction Strategy**: Multi-strategy approach ensures valid citation URLs:
  1. Extract URLs from reference text (filters out search engine URLs)
  2. Construct from DOI, PMID, PMCID, or Bookshelf ID
  3. Render as non-clickable text if no valid URL available (see `lib/utils/citation-url-builder.ts`)

**Clinical Score Integration:**
When mentioning risk scores, always include:
- The numerical score value
- The corresponding risk percentage
- Example: "CURB-65 score of 2 (≈9% 30-day mortality)"

**Source Synthesis:**
- Aggregate results from multiple studies using pattern-based synthesis
- Example: "Meta-analyses consistently show..." instead of "Study X found... Study Y found..."
- Show consensus across multiple guidelines
- Example: "Both Surviving Sepsis Campaign[[1]] and IDSA/ATS CAP Guidelines[[2]] recommend..."
- Avoid citing just one source per statement

**Dosing Guidance:**
- Only include specific doses if directly relevant to the question
- Don't list every possible regimen unless specifically asked
- Focus on guideline-recommended first-line options

## API Rate Limits & Best Practices

### ClinicalTrials.gov
- No authentication required
- Rate limit: ~100 requests/minute
- Best practice: Cache results, limit to 5-10 trials per query

### openFDA
- No authentication required
- Rate limit: 240 requests/minute (1000/hour with API key)
- Best practice: Batch drug queries when possible

### OpenAlex
- No authentication required
- Rate limit: Polite pool (10 req/sec with email in User-Agent)
- Best practice: Include email in User-Agent header

### PubMed/NCBI
- Optional API key (increases rate limit from 3 to 10 req/sec)
- Set `NCBI_API_KEY` environment variable
- Best practice: Use ESummary for basic info, EFetch for abstracts

### Europe PMC
- No authentication required
- No strict rate limits (reasonable use)
- Best practice: Use `resultType=core` for full metadata
- Supports advanced queries with field search (AUTH:, TITLE:, etc.)

### Cochrane Library
- Accessed via PubMed (no separate API key needed)
- Uses same rate limits as PubMed (3-10 req/sec)
- Searches for "Cochrane Database Syst Rev" journal
- Best practice: Prioritize Cochrane reviews as gold standard evidence

## Error Handling

All API functions:
- Return empty arrays on failure (never throw)
- Log errors to console for debugging
- Allow the system to continue with partial evidence

## Anchor Guidelines System

### Overview

The anchor guidelines system provides pre-defined, gold-standard clinical guidelines for common scenarios. This ensures consistent, high-quality responses by prioritizing authoritative sources.

### How It Works

1. **Scenario Detection**: Query keywords are matched against pre-defined clinical scenarios
2. **Guideline Retrieval**: Relevant anchor guidelines are retrieved with full metadata
3. **Prompt Injection**: Guidelines are formatted and injected into the AI prompt with "USE THESE FIRST" instructions
4. **Priority Sourcing**: AI prioritizes anchor guidelines over general evidence search results
5. **Conflict Resolution**: When multiple guidelines apply, AI must integrate ALL of them and explicitly resolve conflicts by preferring the most recent or multi-society guideline

### Supported Scenarios

| Scenario | Keywords | Primary Guidelines |
|----------|----------|-------------------|
| Sepsis | sepsis, septic shock, severe infection | Surviving Sepsis Campaign 2021 |
| CAP | pneumonia, cap, lung infection | IDSA/ATS CAP Guidelines 2019 |
| Diabetes & CKD | diabetes, t2d, ckd, diabetic kidney disease | ADA Standards 2025, KDIGO 2022 |
| Heart Failure | heart failure, hfref, reduced ejection fraction | ACC/AHA/HFSA Guidelines 2022 |
| Atrial Fibrillation | atrial fibrillation, afib, af | ACC/AHA/ACCP/HRS AF Guidelines 2023 |
| Hypertension | hypertension, high blood pressure, htn | ACC/AHA Guidelines 2017 |
| Pediatric CAP | pediatric pneumonia, child pneumonia | IDSA/PIDS Guidelines 2011 |
| Pregnancy HTN | preeclampsia, pregnancy hypertension | ACOG Practice Bulletin 2020 |
| ACS | acs, stemi, nstemi, myocardial infarction | ACC/AHA STEMI Guidelines 2023 |
| Stroke | stroke, cva, ischemic stroke, tpa | AHA/ASA Acute Ischemic Stroke Guidelines 2019 |
| Pulmonary Embolism | pulmonary embolism, pe, massive pe, submassive pe | ESC Guidelines 2019, CHEST Guidelines 2021 |
| DAPT High Bleeding Risk | dapt, dual antiplatelet, precise-dapt, hbr, des, pci, ccs | ACC/AHA CCD Guidelines 2023, MASTER-DAPT, PRECISE-DAPT Score |

### Landmark Trials Database

The system includes a curated database of 17+ high-impact clinical trials that frequently inform clinical practice:

**DAPT / PCI Trials:**
- MASTER-DAPT (2021) - 1-month DAPT in high bleeding risk
- TWILIGHT (2019) - Ticagrelor monotherapy after PCI
- STOPDAPT-2 (2019) - Short vs prolonged DAPT

**Heart Failure Trials:**
- DAPA-HF (2019) - Dapagliflozin in HFrEF
- EMPEROR-Reduced (2020) - Empagliflozin in HFrEF
- EMPEROR-Preserved (2021) - Empagliflozin in HFpEF
- DELIVER (2022) - Dapagliflozin in HFpEF/HFmrEF

**CKD / Diabetes Trials:**
- DAPA-CKD (2020) - Dapagliflozin in CKD
- EMPA-KIDNEY (2023) - Empagliflozin in CKD
- CREDENCE (2019) - Canagliflozin in diabetic nephropathy

**Atrial Fibrillation Trials:**
- NOAH-AFNET 6 (2023) - Edoxaban for subclinical AF
- ARTESIA (2023) - Apixaban for device-detected AF

**Other Specialties:**
- NINDS rt-PA (1995) - tPA for acute ischemic stroke
- ARISE (2014) - EGDT for septic shock

Each trial includes:
- Full name and acronym
- PMID, DOI, and direct URL
- Journal and publication year
- Population, intervention, comparator
- Primary outcome and key finding
- Keywords for smart matching

### Guideline Metadata

Each anchor guideline includes:
- **Name**: Full guideline name with year
- **Organization**: Issuing organization(s)
- **Year**: Publication year
- **URL**: Official guideline URL
- **PMID**: PubMed ID (if available)
- **DOI**: Digital Object Identifier (if available)
- **Summary**: Brief description of guideline scope
- **Key Recommendations**: Extracted key clinical recommendations

### Adding New Scenarios

To add a new clinical scenario:

1. Open `lib/evidence/guideline-anchors.ts`
2. Add a new entry to the `ANCHOR_GUIDELINES` object:

```typescript
new_scenario: {
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  primaryGuidelines: [
    {
      name: 'Guideline Name with Year',
      organization: 'Issuing Organization',
      year: 2025,
      url: 'https://official-guideline-url.org',
      pmid: '12345678',
      doi: '10.xxxx/xxxxx',
      summary: 'Brief description of guideline scope and purpose.',
      keyRecommendations: [
        'First key recommendation',
        'Second key recommendation',
        'Third key recommendation',
      ],
    },
  ],
  keyReviews: [
    {
      title: 'Cochrane Review Title',
      source: 'Cochrane Database Syst Rev',
      pmid: '87654321',
      doi: '10.1002/14651858.CDxxxxxx',
    },
  ],
  keyTrials: [
    {
      name: 'TRIAL-NAME',
      pmid: '11223344',
      summary: 'Brief summary of trial findings',
    },
  ],
},
```

3. The scenario will be automatically detected and used in future queries

### Benefits

- **Consistency**: Same query always gets same authoritative guidelines
- **Quality**: Pre-vetted, gold-standard sources
- **Speed**: Instant retrieval (synchronous, no API calls)
- **Reliability**: No dependency on external API availability
- **Completeness**: Includes key recommendations and landmark trials
- **Conflict Resolution**: Built-in rules for handling guideline disagreements (prefer most recent or multi-society guidelines)

## Future Enhancements

1. **Caching Layer**
   - Redis/memory cache for frequently queried evidence
   - TTL: 24 hours for clinical trials, 7 days for literature

2. **Evidence Quality Scoring**
   - Assign confidence scores based on source quality
   - Weight by study design, sample size, recency

3. **MedGemma Integration**
   - Extract clinical entities from images
   - Generate targeted evidence queries from X-rays/CT/MRI

4. **Citation Management**
   - Generate proper citations (AMA, Vancouver style)
   - Create clickable reference links

5. **Real-time Updates**
   - WebSocket connections for long-running evidence searches
   - Progressive evidence loading

6. **Expanded Anchor Guidelines**
   - Add more clinical scenarios (COPD, asthma, DVT/PE, etc.)
   - Include specialty-specific guidelines (oncology, neurology, etc.)
   - Auto-update guidelines when new versions are published

7. **Expanded Landmark Trials Database**
   - Add 50+ more trials across all specialties
   - Include oncology trials (KEYNOTE, CheckMate series)
   - Add neurology trials (DAWN, DEFUSE-3)
   - Include respiratory trials (TORCH, UPLIFT)
   - Auto-update with new landmark trials

## Testing

### Unit Tests
```bash
# Run all evidence system tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### Integration Testing
```bash
# Test all 18 evidence sources comprehensively
npx tsx scripts/test-all-evidence-sources.ts

# Verify evidence-only configuration (no Google Search)
npx tsx scripts/verify-evidence-only.ts
```

### Configuration Verification

The `verify-evidence-only.ts` script validates that the system is properly configured to use only evidence-based databases:

```bash
npx tsx scripts/verify-evidence-only.ts
```

**Checks performed:**
1. **Chat Route Configuration** - Verifies Google Search is disabled/commented out
2. **Evidence Engine** - Confirms evidence databases (PubMed, Cochrane, etc.) are configured
3. **System Prompts** - Validates evidence-only citation rules are enforced
4. **Search Function Usage** - Ensures `getGeminiWithSearch()` is not called in active code

**Exit codes:**
- `0` - All checks passed (evidence-only mode confirmed)
- `1` - Critical failure (Google Search may be active)

This comprehensive test script validates:
- All 18 evidence sources return valid results
- URLs are properly formatted (no Google search URLs)
- PMIDs/DOIs are present where applicable
- Error handling works correctly
- Sample query: "atrial fibrillation anticoagulation"

**Tested Sources:**
1. PubMed
2. Europe PMC
3. Cochrane
4. ClinicalTrials.gov
5. OpenAlex
6. Semantic Scholar
7. PMC Full-Text
8. DailyMed
9. AAP Guidelines
10. RxNorm
11. WHO Guidelines
12. CDC Guidelines
13. NICE Guidelines
14. BMJ Best Practice
15. Cardiovascular Guidelines
16. StatPearls/NCBI Books
17. Landmark Trials
18. Perplexity AI

## Compliance

All evidence sources are:
- ✅ Publicly accessible
- ✅ Free to use (no licensing fees)
- ✅ Legitimate medical/scientific databases
- ✅ Properly attributed in responses

We do NOT use:
- ❌ Proprietary databases (UpToDate, Micromedex, etc.)
- ❌ Competitor APIs or proprietary services
- ❌ Scraped content
- ❌ Unverified sources
