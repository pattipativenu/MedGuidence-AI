# Evidence Brain Quality Fix - Integration Guide

This document provides step-by-step instructions for integrating the PICO-first pipeline into the evidence engine.

## Overview

All core modules have been implemented and tested:
- ✅ PICO Extractor (`lib/evidence/pico-extractor.ts`)
- ✅ Query Classifier (`lib/evidence/query-classifier.ts`)
- ✅ Evidence Ranker (`lib/evidence/evidence-ranker.ts`)
- ✅ Sufficiency Scorer (`lib/evidence/sufficiency-scorer.ts`)
- ✅ Image Selector (`lib/smart-image-query.ts`)
- ✅ Reference Formatter (`lib/evidence/reference-formatter.ts`)

## Integration Steps

### Task 11.1: Update `lib/evidence/engine.ts` to use PICO extraction

**Location**: `gatherEvidence()` function (around line 200-300)

**Changes needed**:
```typescript
// Add import at top of file
import { extractPICO, decomposeQuery, type PICOExtraction } from './pico-extractor';

// At the start of gatherEvidence function, add:
export async function gatherEvidence(query: string, mode: 'doctor' | 'general' = 'doctor'): Promise<EvidencePackage> {
  console.log(`🔍 Gathering evidence for: ${query}`);
  
  // NEW: Extract PICO components and tags
  const picoExtraction = await extractPICO(query);
  console.log(`📋 PICO Tags: diseases=[${picoExtraction.disease_tags.join(', ')}], decisions=[${picoExtraction.decision_tags.join(', ')}]`);
  
  // Store for use in downstream modules
  const tags = {
    disease_tags: picoExtraction.disease_tags,
    decision_tags: picoExtraction.decision_tags,
    primary_disease_tag: picoExtraction.primary_disease_tag,
    primary_decision_tag: picoExtraction.primary_decision_tag,
  };
  
  // Rest of existing code...
}
```

### Task 11.2: Use query decomposition for long queries

**Location**: Before database searches in `gatherEvidence()`

**Changes needed**:
```typescript
// After PICO extraction, check if query needs decomposition
const wordCount = query.split(/\s+/).length;
let searchQueries = [query]; // Default to original query

if (wordCount > 100) {
  const decomposition = await decomposeQuery(query, picoExtraction);
  if (decomposition.should_decompose && decomposition.sub_queries.length > 0) {
    searchQueries = decomposition.sub_queries.map(sq => sq.query);
    console.log(`📝 Decomposed into ${searchQueries.length} sub-queries`);
  }
}

// Use searchQueries array for PubMed, Cochrane, OpenAlex searches
// Example:
const pubmedResults = await Promise.all(
  searchQueries.map(q => comprehensivePubMedSearch(q))
);
// Flatten and deduplicate results
```

### Task 11.3: Update MeSH mapper to use classification

**Location**: `lib/evidence/mesh-mapper.ts`

**Changes needed**:
```typescript
// Add import
import { classifyQuery } from './query-classifier';

// Modify enhanceQueryWithMeSH function
export async function enhanceQueryWithMeSH(
  query: string,
  disease_tags: string[],
  decision_tags: string[]
): Promise<string> {
  // Get classification
  const classification = classifyQuery(disease_tags, decision_tags);
  
  // Use allowed_mesh_terms from classification
  const meshTerms = classification.allowed_mesh_terms;
  
  // Build enhanced query with only allowed MeSH terms
  const meshQuery = meshTerms.map(term => `"${term}"[MeSH Terms]`).join(' OR ');
  
  return `(${query}) OR (${meshQuery})`;
}
```

### Task 11.4: Update Perplexity triggering logic

**Location**: `lib/evidence/perplexity.ts` and `gatherEvidence()`

**Changes needed**:
```typescript
// In gatherEvidence, after gathering evidence:
import { scoreEvidenceSufficiencyWithTags } from './sufficiency-scorer';

// Calculate sufficiency with tags
const sufficiencyScore = scoreEvidenceSufficiencyWithTags(
  evidencePackage,
  tags.disease_tags,
  tags.decision_tags,
  detectAnchorScenario(tags) // Helper function to detect anchor scenarios
);

console.log(`📊 Evidence sufficiency: ${sufficiencyScore.score}/100 (${sufficiencyScore.level})`);

// Only call Perplexity if needed
if (sufficiencyScore.should_call_perplexity) {
  console.log(`🔍 Calling Perplexity - internal evidence insufficient`);
  const perplexityResult = await searchPerplexityMedical(query);
  evidencePackage.perplexityResult = perplexityResult;
} else {
  console.log(`✅ Skipping Perplexity - internal evidence sufficient (score: ${sufficiencyScore.score}/100)`);
  evidencePackage.perplexityResult = null;
}
```

### Task 11.5: Use new ranker and formatter in formatEvidenceForPrompt

**Location**: `formatEvidenceForPrompt()` function in `engine.ts`

**Changes needed**:
```typescript
// Add imports
import { rankAndFilterEvidenceWithTags, type TagBasedRankingConfig } from './evidence-ranker';
import { formatReferences, findGoogleSearchURLs } from './reference-formatter';

// In formatEvidenceForPrompt function:
export function formatEvidenceForPrompt(
  evidence: EvidencePackage,
  tags: { disease_tags: string[], decision_tags: string[], primary_disease_tag: string, primary_decision_tag: string }
): string {
  // Combine all evidence into single array
  const allEvidence = [
    ...evidence.pubmedArticles,
    ...evidence.cochraneReviews,
    ...evidence.guidelines,
    // ... other sources
  ];
  
  // Apply tag-based ranking
  const rankingConfig: TagBasedRankingConfig = {
    disease_tags: tags.disease_tags,
    decision_tags: tags.decision_tags,
    primary_disease_tag: tags.primary_disease_tag,
    primary_decision_tag: tags.primary_decision_tag,
    secondary_decision_tags: [],
    anchor_scenario: detectAnchorScenario(tags),
    boost_anchors: true,
    penalize_off_topic: true,
    min_references: 5,
    max_references: 10,
  };
  
  const rankedEvidence = rankAndFilterEvidenceWithTags(allEvidence, rankingConfig, 10);
  
  // Format references with validated URLs
  const formattedRefs = formatReferences(rankedEvidence);
  
  // Verify no Google URLs
  const googleURLs = findGoogleSearchURLs(formattedRefs);
  if (googleURLs.length > 0) {
    console.warn(`⚠️  Found ${googleURLs.length} Google search URLs - removing`);
    // Filter them out
  }
  
  // Build formatted string
  return formattedRefs.map((ref, i) => 
    `${i + 1}. [${ref.title}](${ref.url})\n   ${ref.authors} - ${ref.journal} (${ref.year})\n   ${ref.source_badge} ${ref.quality_badges.join(' ')}`
  ).join('\n\n');
}
```

## Task 12: Integrate Tag-Based Image Selection

### Task 12.1: Update `lib/medical-images.ts`

**Location**: Main image fetching function

**Changes needed**:
```typescript
// Add imports
import { 
  shouldShowImages, 
  generateSmartImageQueriesWithTags,
  isImageRelevantByTags,
  type TagBasedImageConfig 
} from './smart-image-query';

// Modify main function to accept tags
export async function fetchMedicalImages(
  query: string,
  tags: { disease_tags: string[], decision_tags: string[] },
  mode: 'doctor' | 'general' = 'doctor'
): Promise<MedicalImage[]> {
  // Create config
  const config: TagBasedImageConfig = {
    disease_tags: tags.disease_tags,
    decision_tags: tags.decision_tags,
    has_imaging_modality: detectImagingModality(query),
    is_decision_query: tags.decision_tags.length > 0,
  };
  
  // Check if we should show images
  if (!shouldShowImages(config)) {
    console.log('📷 Suppressing images for decision query');
    return [];
  }
  
  // Generate tag-based queries
  const imageQueries = await generateSmartImageQueriesWithTags(query, config, mode);
  
  // Fetch images
  const images = await fetchImagesFromQueries(imageQueries);
  
  // Filter by tag relevance
  return images.filter(img => {
    const relevance = isImageRelevantByTags(img.title, config);
    return relevance.relevant;
  });
}

function detectImagingModality(query: string): boolean {
  const imagingTerms = ['ct', 'mri', 'x-ray', 'xray', 'ultrasound', 'echo', 'echocardiogram'];
  const queryLower = query.toLowerCase();
  return imagingTerms.some(term => queryLower.includes(term));
}
```

## Task 13: Final Checkpoint

Run all tests to ensure integration doesn't break existing functionality:

```bash
npm test
```

Expected: All 329+ tests should pass.

## Task 14: Integration Testing

Create end-to-end integration test in `lib/evidence/__tests__/integration.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { gatherEvidence, formatEvidenceForPrompt } from '../engine';
import { extractPICO } from '../pico-extractor';
import { findGoogleSearchURLs } from '../reference-formatter';

describe('Evidence Brain Quality Fix - Integration', () => {
  it('should handle AF+CKD anticoagulation query correctly', async () => {
    const query = 'What anticoagulation should I use for a patient with atrial fibrillation and stage 4 chronic kidney disease?';
    
    // Extract PICO
    const pico = await extractPICO(query);
    
    // Verify tags
    expect(pico.disease_tags).toContain('AF');
    expect(pico.disease_tags).toContain('CKD');
    expect(pico.decision_tags).toContain('anticoagulation');
    
    // Gather evidence
    const evidence = await gatherEvidence(query, 'doctor');
    
    // Verify Perplexity was NOT called (should have sufficient internal evidence)
    expect(evidence.perplexityResult).toBeNull();
    
    // Format evidence
    const formatted = formatEvidenceForPrompt(evidence, {
      disease_tags: pico.disease_tags,
      decision_tags: pico.decision_tags,
      primary_disease_tag: pico.primary_disease_tag,
      primary_decision_tag: pico.primary_decision_tag,
    });
    
    // Verify no Google URLs
    const refs = extractReferencesFromFormatted(formatted);
    const googleURLs = refs.filter(url => url.includes('google.com/search'));
    expect(googleURLs.length).toBe(0);
    
    // Verify images are suppressed (decision query without imaging)
    const images = await fetchMedicalImages(query, {
      disease_tags: pico.disease_tags,
      decision_tags: pico.decision_tags,
    }, 'doctor');
    
    // Should have zero generic ECG images
    const ecgImages = images.filter(img => 
      img.title.toLowerCase().includes('ecg') && 
      !img.title.toLowerCase().includes('anticoagulation')
    );
    expect(ecgImages.length).toBe(0);
  }, 60000); // 60 second timeout for API calls
});
```

## Implementation Notes

1. **Backward Compatibility**: All changes should be backward compatible. The engine should work with or without tags.

2. **Error Handling**: Wrap PICO extraction in try-catch and fall back to original behavior if it fails.

3. **Logging**: Add console.log statements to track the PICO-first pipeline execution.

4. **Testing**: Test each integration point individually before running full integration tests.

5. **Performance**: PICO extraction adds ~1-2 seconds. Consider caching results for repeated queries.

## Verification Checklist

- [ ] PICO extraction runs at start of gatherEvidence
- [ ] Tags are passed to all downstream modules
- [ ] Query decomposition works for long queries (>100 words)
- [ ] MeSH mapper uses classification to restrict terms
- [ ] Perplexity is skipped when internal evidence is sufficient
- [ ] Evidence ranker uses tag-based ranking
- [ ] Reference formatter validates URLs (no Google search URLs)
- [ ] Image selector suppresses images for decision queries
- [ ] All existing tests still pass
- [ ] Integration test passes for AF+CKD query

## Status

**Modules Implemented**: ✅ All 6 core modules complete with tests
**Integration**: 📋 Documented in this guide
**Next Step**: Apply changes to `lib/evidence/engine.ts` and `lib/medical-images.ts`
