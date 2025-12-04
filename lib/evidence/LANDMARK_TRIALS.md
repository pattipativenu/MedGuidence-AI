# Landmark Trials Database

## Overview

The Landmark Trials Database is a curated collection of high-impact clinical trials that frequently inform clinical practice. This database provides quick access to trial metadata, key findings, and proper citations for evidence-based recommendations.

## Features

- **17+ Curated Trials**: Hand-selected landmark trials across 6 specialties
- **Full Metadata**: PMID, DOI, journal, year, population, intervention, outcomes
- **Smart Keyword Matching**: Automatically finds relevant trials based on query
- **Formatted Output**: Ready-to-inject prompt formatting for AI responses
- **Synchronous Access**: No API calls required, instant retrieval

## Included Trials

### DAPT / PCI (3 trials)
- **MASTER-DAPT** (2021) - 1-month DAPT in high bleeding risk patients
- **TWILIGHT** (2019) - Ticagrelor monotherapy after PCI
- **STOPDAPT-2** (2019) - Short vs prolonged DAPT after DES

### Heart Failure (4 trials)
- **DAPA-HF** (2019) - Dapagliflozin in HFrEF
- **EMPEROR-Reduced** (2020) - Empagliflozin in HFrEF
- **EMPEROR-Preserved** (2021) - Empagliflozin in HFpEF
- **DELIVER** (2022) - Dapagliflozin in HFpEF/HFmrEF

### CKD / Diabetes (3 trials)
- **DAPA-CKD** (2020) - Dapagliflozin in CKD
- **EMPA-KIDNEY** (2023) - Empagliflozin in CKD
- **CREDENCE** (2019) - Canagliflozin in diabetic nephropathy

### Atrial Fibrillation (2 trials)
- **NOAH-AFNET 6** (2023) - Edoxaban for subclinical AF
- **ARTESIA** (2023) - Apixaban for device-detected AF

### Stroke (1 trial)
- **NINDS rt-PA** (1995) - tPA for acute ischemic stroke

### Sepsis (1 trial)
- **ARISE** (2014) - EGDT for septic shock

## Usage

### Basic Search

```typescript
import { searchLandmarkTrials } from '@/lib/evidence/landmark-trials';

// Search by keywords
const trials = searchLandmarkTrials("DAPT high bleeding risk", 5);
// Returns: [MASTER-DAPT, TWILIGHT, STOPDAPT-2]

// Search by specialty
const hfTrials = searchLandmarkTrials("heart failure SGLT2", 5);
// Returns: [DAPA-HF, EMPEROR-Reduced, EMPEROR-Preserved, DELIVER]
```

### Get Specific Trial

```typescript
import { getTrialByAcronym } from '@/lib/evidence/landmark-trials';

const trial = getTrialByAcronym("MASTER-DAPT");
console.log(trial.pmid); // "34449185"
console.log(trial.keyFinding); // "1-month DAPT was non-inferior..."
```

### Get Trials by Specialty

```typescript
import { getTrialsBySpecialty } from '@/lib/evidence/landmark-trials';

const cardioTrials = getTrialsBySpecialty("Cardiology");
// Returns all 11 cardiology trials

const nephTrials = getTrialsBySpecialty("Nephrology");
// Returns: [DAPA-CKD, EMPA-KIDNEY, CREDENCE]
```

### Format for AI Prompt

```typescript
import { 
  searchLandmarkTrials, 
  formatLandmarkTrialsForPrompt 
} from '@/lib/evidence/landmark-trials';

const trials = searchLandmarkTrials("SGLT2 inhibitors CKD", 3);
const formatted = formatLandmarkTrialsForPrompt(trials);

// Output:
// --- LANDMARK CLINICAL TRIALS ---
// 
// ⭐ These are high-impact trials that inform current clinical practice.
// ⭐ Cite these trials when making evidence-based recommendations.
// 
// 1. **DAPA-CKD** (2020)
// - Full Name: Dapagliflozin in Patients with Chronic Kidney Disease
// - Journal: New England Journal of Medicine
// - PMID: 32970396
// - DOI: 10.1056/NEJMoa2025816
// - URL: https://www.nejm.org/doi/full/10.1056/NEJMoa2025816
// - Population: CKD patients (eGFR 25-75, UACR 200-5000) with or without diabetes (n=4,304)
// - Intervention: Dapagliflozin 10mg daily vs Placebo
// - Primary Outcome: Sustained decline in eGFR ≥50%, ESRD, or death from renal or cardiovascular causes
// - Key Finding: Dapagliflozin reduced primary outcome (9.2% vs 14.5%, HR 0.61, p<0.001)
// ...
```

## Trial Metadata Structure

Each trial includes:

```typescript
interface LandmarkTrial {
  acronym: string;           // e.g., "MASTER-DAPT"
  fullName: string;          // Full trial name
  pmid: string;              // PubMed ID
  doi: string;               // Digital Object Identifier
  journal: string;           // Publication journal
  year: number;              // Publication year
  url: string;               // Direct link to full text
  primaryOutcome: string;    // Primary endpoint
  population: string;        // Study population
  intervention: string;      // Intervention arm
  comparator: string;        // Control arm
  keyFinding: string;        // Main result
  keywords: string[];        // For search matching
  specialty: string;         // Medical specialty
}
```

## Keyword Matching Algorithm

The search function uses a weighted scoring system:

1. **Acronym match** (weight: 100) - Exact match on trial acronym
2. **Keyword match** (weight: 10) - Match on predefined keywords
3. **Full name match** (weight: 5) - Match on words in full trial name

Trials are ranked by score and top N results are returned.

## Integration with Evidence Engine

The landmark trials database is designed to integrate with the evidence engine:

```typescript
// In lib/evidence/engine.ts
import { searchLandmarkTrials, formatLandmarkTrialsForPrompt } from './landmark-trials';

export interface EvidencePackage {
  // ... existing fields
  landmarkTrials: LandmarkTrial[];
}

export async function gatherEvidence(query: string) {
  const landmarkTrials = searchLandmarkTrials(query, 5);
  
  return {
    // ... other evidence
    landmarkTrials,
  };
}

export function formatEvidenceForPrompt(evidence: EvidencePackage) {
  let formatted = "...";
  
  if (evidence.landmarkTrials.length > 0) {
    formatted += formatLandmarkTrialsForPrompt(evidence.landmarkTrials);
  }
  
  return formatted;
}
```

## Adding New Trials

To add a new landmark trial:

1. Open `lib/evidence/landmark-trials.ts`
2. Add to the `LANDMARK_TRIALS` array:

```typescript
{
  acronym: "TRIAL-NAME",
  fullName: "Full Trial Name",
  pmid: "12345678",
  doi: "10.xxxx/xxxxx",
  journal: "Journal Name",
  year: 2025,
  url: "https://journal.com/article",
  primaryOutcome: "Primary endpoint description",
  population: "Study population (n=X,XXX)",
  intervention: "Intervention description",
  comparator: "Control description",
  keyFinding: "Main result with statistics",
  keywords: ["keyword1", "keyword2", "keyword3"],
  specialty: "Cardiology" // or other specialty
}
```

## Future Enhancements

1. **Expand Database**: Add 50+ more trials across all specialties
2. **Auto-Update**: Integrate with PubMed API to detect new landmark trials
3. **Trial Comparison**: Add function to compare similar trials
4. **Meta-Analysis Integration**: Link trials to relevant meta-analyses
5. **Quality Scoring**: Add trial quality metrics (Jadad score, risk of bias)
6. **Subgroup Analysis**: Include key subgroup findings
7. **Safety Data**: Add adverse event rates and safety outcomes

## Benefits

- **Speed**: Instant access without API calls
- **Reliability**: No dependency on external services
- **Quality**: Hand-curated, high-impact trials only
- **Completeness**: Full metadata for proper citation
- **Relevance**: Smart matching finds query-relevant trials
- **Consistency**: Same query always returns same trials

## Comparison with Other Sources

| Feature | Landmark Trials DB | ClinicalTrials.gov | PubMed |
|---------|-------------------|-------------------|---------|
| Speed | Instant | 1-2 seconds | 1-2 seconds |
| Quality | High (curated) | Variable | Variable |
| Metadata | Complete | Partial | Abstract only |
| Relevance | High (matched) | Medium | Medium |
| API Required | No | Yes | Yes |
| Rate Limits | None | Yes | Yes |

## Use Cases

1. **DAPT Duration Queries**: Automatically cite MASTER-DAPT, TWILIGHT
2. **Heart Failure Management**: Reference SGLT2i trials (DAPA-HF, EMPEROR)
3. **CKD Treatment**: Cite kidney protection trials (DAPA-CKD, EMPA-KIDNEY)
4. **AF Anticoagulation**: Reference subclinical AF trials (NOAH-AFNET 6, ARTESIA)
5. **Stroke Thrombolysis**: Cite NINDS rt-PA for tPA timing

## Testing

```bash
# Test landmark trials search
npm run test:evidence:landmark-trials

# Test integration with evidence engine
npm run test:evidence:integration
```

## Compliance

All trials are:
- ✅ Published in peer-reviewed journals
- ✅ Publicly accessible (PMIDs and DOIs provided)
- ✅ Properly attributed with full citations
- ✅ High-impact (frequently cited in guidelines)

---

**Last Updated:** December 1, 2025  
**Total Trials:** 17  
**Specialties Covered:** 6 (Cardiology, Nephrology, Neurology, Infectious Disease)
