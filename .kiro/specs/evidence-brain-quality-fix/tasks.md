# Implementation Plan

## ✅ COMPLETED: Core Modules (Tasks 1-10, 14)

All core modules have been implemented and tested with 329 passing tests. See `COMPLETION_SUMMARY.md` for details.

- [x] 1-9: Core module implementation (PICO Extractor, Query Classifier, Evidence Ranker, Sufficiency Scorer, Image Selector, Reference Formatter)
- [x] 10: All module tests passing
- [x] 14: Integration tests written and passing

---

## 🔄 REMAINING: Integration into Main Engine (Tasks 11-13)

The following tasks integrate the completed modules into the existing evidence engine:

- [x] 11. Integrate PICO-First Pipeline into Evidence Engine
  - [x] 11.1 Update `lib/evidence/engine.ts` to use PICO extraction
    - Import and call `extractPICO()` or `generateTagsFromQuery()` at start of `gatherEvidence()`
    - Store tags in evidence package or pass to downstream functions
    - _Requirements: 1.3, 1.4_
  - [x] 11.2 Update gatherEvidence to use query decomposition
    - Call `decomposeQuery()` for long queries (>100 words)
    - Use sub-queries for PubMed/Cochrane/OpenAlex searches
    - _Requirements: 2.4, 2.5_
  - [x] 11.3 Update MeSH mapper to use classification
    - Import `classifyQuery()` from query-classifier
    - Get allowed/excluded MeSH from classifier based on tags
    - Apply tag-based MeSH expansion in `enhanceQueryWithMeSH()`
    - _Requirements: 3.2, 3.3, 3.4_
  - [x] 11.4 Update Perplexity triggering logic
    - Import `scoreEvidenceSufficiencyWithTags()` from sufficiency-scorer
    - Check `should_call_perplexity` from enhanced sufficiency score
    - Skip Perplexity when anchors exist and score ≥50
    - Log skip message with score
    - _Requirements: 4.4, 4.5, 4.6_
  - [x] 11.5 Update formatEvidenceForPrompt to use new ranker and formatter
    - Import `rankAndFilterEvidenceWithTags()` from evidence-ranker
    - Import `formatReferences()` from reference-formatter
    - Apply tag-based ranking before formatting
    - Format references with validated URLs
    - Scan and remove any Google URLs from output
    - _Requirements: 5.1-5.7, 8.1-8.6, 9.1-9.4_

- [x] 12. Integrate Tag-Based Image Selection
  - [x] 12.1 Update `lib/medical-images.ts` to use tag-based selection
    - Import `shouldShowImages()` and `generateSmartImageQueriesWithTags()` from smart-image-query
    - Check `shouldShowImages()` before fetching images
    - Use tag-derived queries instead of raw query text
    - _Requirements: 6.1, 6.2_
  - [x] 12.2 Update image filtering to require tag matches
    - Import `isImageRelevantByTags()` from smart-image-query
    - Filter out images without disease + decision term in title
    - Return zero images for decision queries without algorithms
    - _Requirements: 6.3, 6.4, 6.5_

- [x] 13. Final Integration Checkpoint
  - Run full test suite to ensure all 329 tests still pass
  - Test end-to-end with real queries:
    - "What anticoagulation for AF with CKD?" (should suppress Perplexity, no ECG images)
    - "How long to treat CAP?" (should suppress images)
    - "What causes diabetes?" (should show images, use Perplexity if needed)
  - Verify console logs show:
    - `📋 PICO Tags: diseases=[...], decisions=[...]`
    - `✅ Skipping Perplexity - internal evidence sufficient`
    - `📷 Suppressing images for decision query`
    - `⚠️  Found X Google search URLs - removing`
  - Ask the user if questions arise.

---

## 📚 Integration Resources

- **Integration Guide**: `.kiro/specs/evidence-brain-quality-fix/INTEGRATION_GUIDE.md`
  - Step-by-step instructions with code examples
  - Verification checklist
  - Implementation notes

- **Completion Summary**: `.kiro/specs/evidence-brain-quality-fix/COMPLETION_SUMMARY.md`
  - Overview of all completed modules
  - Test results (329 passing)
  - Requirements validation

---

## 📝 Notes

- All core modules are production-ready and fully tested
- Integration should be straightforward following the guide
- Expected performance impact: +1-2s for PICO extraction, but -40% Perplexity calls
- All property-based tests validate correctness properties from design doc
