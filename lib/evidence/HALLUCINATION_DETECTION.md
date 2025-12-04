# Hallucination Detection System

## Overview

The hallucination detection system validates AI-generated medical responses to ensure they cite only real, relevant evidence from the provided evidence package. It prevents common issues identified in the validation report.

## Key Detection Areas

### 1. Off-Topic Reference Detection

**Problem**: AI cites papers that don't directly address the clinical question.

**Examples from Validation Report**:
- ❌ MINOCA imaging studies cited in DAPT duration questions
- ❌ Exercise/HIIT studies cited in antibiotic questions
- ❌ Biomarker studies (procalcitonin) cited in antibiotic choice questions
- ❌ Duration studies cited in initial regimen questions
- ❌ Pathophysiology papers cited in treatment questions

**Detection Method**:
```typescript
import { detectOffTopicReferences } from '@/lib/evidence/hallucination-detector';

const offTopicRefs = detectOffTopicReferences(query, references);
// Returns references with <30% keyword overlap or known off-topic patterns
```

**Semantic Detection** (optional, uses embeddings):
```typescript
import { detectOffTopicReferencesWithSemantics } from '@/lib/evidence/hallucination-detector';

const offTopicRefs = await detectOffTopicReferencesWithSemantics(
  query, 
  references,
  0.5 // minimum similarity threshold
);
```

### 2. False "No Guideline" Claims

**Problem**: AI claims "no guideline exists" when guidelines are actually in the evidence package.

**Examples from Validation Report**:
- ❌ "No guideline for sepsis antibiotics" → FALSE (Surviving Sepsis Campaign 2021 exists)
- ❌ "Insufficient evidence for CAP treatment" → FALSE (IDSA/ATS CAP 2019 exists)
- ❌ "No consensus on AF anticoagulation" → FALSE (ACC/AHA/ACCP/HRS 2023 exists)

**Detection Method**:
```typescript
import { detectFalseNoGuidelineClaims } from '@/lib/evidence/hallucination-detector';

const falseClaims = detectFalseNoGuidelineClaims(responseText, evidence);
// Checks for "no guideline" phrases when guidelines exist in evidence
```

### 3. Fabricated Reference Detection

**Problem**: AI invents PMIDs or DOIs that don't exist in the evidence package.

**Detection Method**:
```typescript
import { detectFabricatedReferences } from '@/lib/evidence/hallucination-detector';

const fabricated = detectFabricatedReferences(responseText, evidence);
// Validates all PMIDs and DOIs against evidence package
```

### 4. Google Search URL Detection

**Problem**: AI uses generic Google search URLs instead of direct article links.

**Example from Validation Report**:
- ❌ `https://www.google.com/search?q=Surviving+Sepsis+Campaign+2021`
- ✅ `https://www.sccm.org/SurvivingSepsisCampaign/Guidelines`

**Detection Method**:
```typescript
import { detectGoogleURLReferences } from '@/lib/evidence/hallucination-detector';

const googleRefs = detectGoogleURLReferences(responseText, evidence);
// Finds Google URLs and suggests correct URLs from evidence
```

### 5. Reference Distribution Validation

**Problem**: Unbalanced reference distribution (too many low-quality sources, missing guidelines).

**Required Distribution** (from validation report):
- ✓ 1-2 major guidelines (ACC/AHA, ESC, IDSA, KDIGO, Surviving Sepsis)
- ✓ 1-2 Cochrane reviews or meta-analyses
- ✓ 2-3 pivotal RCTs or key observational studies
- ✓ No more than 1-2 "Other/Unknown" sources
- ✓ Total: 6-10 references

**Detection Method**:
```typescript
import { validateReferenceDistribution } from '@/lib/evidence/hallucination-detector';

const distribution = validateReferenceDistribution(responseText);
// Returns distribution breakdown and validation issues
```

## Comprehensive Report

Generate a full hallucination detection report:

```typescript
import { generateHallucinationReport, formatHallucinationReport } from '@/lib/evidence/hallucination-detector';

const report = await generateHallucinationReport(
  query,
  responseText,
  evidence,
  true // use semantic analysis (optional)
);

console.log(formatHallucinationReport(report));
```

**Report Structure**:
```typescript
interface HallucinationReport {
  offTopicReferences: OffTopicReference[];
  falseNoGuidelineClaims: FalseNoGuidelineClaim[];
  fabricatedReferences: FabricatedReference[];
  googleURLReferences: GoogleURLReference[];
  referenceDistribution: ReferenceDistribution;
  overallScore: number; // 0-100, higher is better
  hasCriticalIssues: boolean;
  summary: string;
}
```

**Scoring**:
- 90-100: ✅ Excellent - No significant issues
- 70-89: ⚠️ Good - Minor issues, review recommended
- 50-69: ⚠️ Fair - Multiple issues, revision recommended
- 0-49: ❌ Poor - Critical issues, major revision required

**Deductions**:
- -10 per off-topic reference
- -20 per false "no guideline" claim
- -15 per fabricated reference
- -10 per Google URL
- -5 per reference distribution issue

## Integration with Evidence Engine

The hallucination detection rules are integrated into the evidence engine prompt at `lib/evidence/engine.ts`:

```typescript
formatted += "### 3. EVIDENCE USAGE & HALLUCINATION PREVENTION (CRITICAL)\n\n";
formatted += "**A. USE ONLY PROVIDED EVIDENCE**\n";
// ... detailed instructions
formatted += "**B. OFF-TOPIC REFERENCE PREVENTION**\n";
// ... off-topic patterns
formatted += "**C. FALSE 'NO GUIDELINE' CLAIMS PREVENTION**\n";
// ... guideline validation
formatted += "**D. GOOGLE URL PREVENTION (CRITICAL ERROR)**\n";
// ... URL formatting rules
formatted += "**E. MANDATORY SOURCES**\n";
// ... anchor guidelines, landmark trials
formatted += "**F. REFERENCE DISTRIBUTION (6-10 TOTAL)**\n";
// ... distribution requirements
formatted += "**G. EVIDENCE HIERARCHY**\n";
// ... prioritization rules
```

## Testing

Run the test script to validate the detection system:

```bash
npx tsx scripts/test-hallucination-detector.ts
```

**Test Cases**:
1. Off-topic reference detection (biomarker studies in antibiotic questions)
2. False "no guideline" claims (when guidelines exist)
3. Fabricated reference detection (invalid PMIDs/DOIs)
4. Google URL detection (search URLs vs direct links)
5. Reference distribution validation (balanced vs unbalanced)
6. Comprehensive report generation

## Common Off-Topic Patterns

The system detects these known off-topic patterns:

| Pattern | Irrelevant For | Reason |
|---------|---------------|--------|
| MINOCA | DAPT, stent, antiplatelet | Different entity |
| HIIT/exercise | Sepsis, antibiotics, ICU | Not acute care |
| Imaging | Drug dosing, antibiotics | Different domain |
| Pediatric | Adult questions | Different population |
| Biomarkers | Antibiotic choice | Monitoring, not selection |
| Duration | Initial regimen | Different question |
| Pathophysiology | Treatment | Mechanism, not therapy |
| Diagnostic criteria | Management | Different phase |

## Best Practices

1. **Always validate responses** before returning to users
2. **Use semantic analysis** for complex queries (slower but more accurate)
3. **Log detection results** for continuous improvement
4. **Update off-topic patterns** as new issues are discovered
5. **Enforce mandatory sources** (Anchor Guidelines, Cochrane reviews)
6. **Check reference distribution** to ensure balanced evidence
7. **Validate URLs** to prevent Google search links

## Future Enhancements

1. **Real-time validation** during AI generation (streaming)
2. **Automatic correction** of detected issues
3. **Learning from user feedback** to improve detection
4. **Integration with citation validator** for end-to-end validation
5. **Semantic clustering** to detect related off-topic patterns
6. **Confidence scores** for each detection type

## References

- Validation Report: `EVIDENCE_VALIDATION_REPORT.md`
- Citation Validator: `lib/evidence/citation-validator.ts`
- Semantic Reranker: `lib/evidence/semantic-reranker.ts`
- Evidence Engine: `lib/evidence/engine.ts`
