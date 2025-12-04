# Requirements Document

## Introduction

This feature addresses critical quality issues in the MedGuidance Evidence Brain system that cause suboptimal responses compared to OpenEvidence. The main problems are: (1) Perplexity being triggered despite having sufficient evidence from internal databases, (2) incorrect query classification leading to irrelevant MeSH expansion, (3) full query strings being used for database searches instead of PICO-extracted terms, (4) generic ECG images shown for anticoagulation decision questions, and (5) off-topic references diluting the response quality.

The solution implements a PICO-first architecture where every Doctor Mode query goes through structured extraction, generating disease_tags and decision_tags that drive all downstream modules (classification, ranking, sufficiency, images).

## Glossary

- **Evidence Brain**: The internal system that gathers evidence from 20+ medical databases (PubMed, Cochrane, Europe PMC, etc.)
- **Perplexity**: External AI search fallback used when internal evidence is insufficient
- **Anchor Guidelines**: Pre-selected gold-standard guidelines for specific clinical scenarios
- **PICO**: Patient/Population, Intervention, Comparison, Outcome - a framework for clinical questions
- **MeSH**: Medical Subject Headings - NLM's controlled vocabulary for indexing medical literature
- **Sufficiency Score**: A 0-100 score indicating whether gathered evidence is adequate for clinical decision-making
- **Query Classification**: The process of categorizing a clinical query by type (e.g., anticoagulation, lifestyle, diagnosis)
- **Disease Tags**: Extracted disease/condition identifiers from a query (e.g., AF, CKD, CAP, sepsis)
- **Decision Tags**: Extracted clinical decision types from a query (e.g., anticoagulation, duration, drug choice, de-escalation)

## Requirements

### Requirement 1: Implement PICO-First Query Processing

**User Story:** As a clinician, I want every query to be systematically analyzed using PICO extraction, so that all downstream modules (classification, ranking, images) work from structured tags rather than raw text.

#### Acceptance Criteria

1. WHEN a Doctor Mode query is received THEN the system SHALL extract PICO components: Patient/Population, Intervention, Comparison, Outcome, and primary condition
2. WHEN PICO extraction completes THEN the system SHALL generate disease_tags (e.g., [AF, CKD, GI_bleed]) and decision_tags (e.g., [anticoagulation, drug_choice, monitoring])
3. WHEN decision_tags contains multiple items THEN the system SHALL identify primary_decision_tag and secondary_decision_tags, prioritizing sources matching the main decision first
4. WHEN disease_tags and decision_tags are generated THEN the system SHALL pass them to all downstream modules: query classification, evidence ranking, sufficiency scoring, and image selection
5. WHEN a query contains multiple conditions THEN the system SHALL identify the primary_disease_tag and secondary_disease_tags for ranking purposes

### Requirement 2: Implement PICO-Based Query Decomposition

**User Story:** As a clinician with a complex multi-part question, I want the system to break down my query into focused sub-queries, so that database searches return relevant results instead of 0 hits or generic noise.

#### Acceptance Criteria

1. WHEN a clinical query exceeds 100 words THEN the system SHALL decompose it into 3-4 focused PICO-based sub-queries of ≤20 words each
2. WHEN decomposing a query THEN the system SHALL generate sub-queries for: (a) core management decision (drug/procedure choice), (b) complications/comorbidities that modify the decision, (c) duration/de-escalation or monitoring, (d) non-pharmacologic alternatives if present
3. WHEN generating each sub-query THEN the system SHALL include: disease term(s), decision concept, and key comorbidity if present
4. WHEN searching PubMed/Cochrane/OpenAlex THEN the system SHALL use the decomposed sub-queries instead of the full query string
5. WHEN sub-queries are generated THEN the system SHALL log each sub-query with its target evidence type

### Requirement 3: Fix Query Classification Using Tags

**User Story:** As a clinician asking about anticoagulation decisions, I want the system to correctly classify my query based on extracted tags, so that it uses appropriate MeSH terms and search strategies.

#### Acceptance Criteria

1. WHEN decision_tags include "anticoagulation" OR "drug_choice" AND disease_tags include "AF" THEN the system SHALL classify the query as "cardiology/anticoagulation" NOT "lifestyle/prevention"
2. WHEN a query is classified as "cardiology/anticoagulation" THEN the system SHALL restrict MeSH expansion to: "Atrial Fibrillation", "Anticoagulants", "Stroke", "Hemorrhage", "Kidney Failure, Chronic"
3. WHEN a query is classified as "cardiology/anticoagulation" THEN the system SHALL NOT add "Primary Prevention", "Diabetes Mellitus", or lifestyle-related MeSH terms
4. WHEN disease_tags include CKD/ESRD alongside AF THEN the system SHALL add "Renal Insufficiency, Chronic" to MeSH expansion

### Requirement 4: Fix Perplexity Triggering with Anchor-Aware Sufficiency

**User Story:** As a clinician, I want MedGuidance to use its internal Evidence Brain databases first and only call Perplexity when truly necessary, so that I get high-quality curated references instead of generic web search results.

#### Acceptance Criteria

1. WHEN the query matches a recognized anchor scenario (including AF+CKD, CAP/sepsis, DAPT/HBR, HFpEF+CKD, AHRE, and other defined scenarios) THEN the system SHALL compute sufficiency only from: anchor guidelines for that scenario, 1-2 systematic reviews/meta-analyses, and 1-3 pivotal trials or cohorts in the same condition/decision
2. WHEN the Evidence Brain has ≥3 anchor guidelines matching the clinical scenario THEN the system SHALL set evidence sufficiency score to at least 70 (GOOD level)
3. WHEN sufficiency is initially <50 but anchors exist THEN the system SHALL rerun ranking using only sources whose disease_tags AND decision_tags match before declaring "insufficient evidence"
4. WHEN the sufficiency score is ≥50 (GOOD or EXCELLENT) THEN the system SHALL NOT call Perplexity API
5. WHEN a scenario has a defined anchor pack THEN the system SHALL NOT call Perplexity unless the pack is empty or older than 10 years AND no recent PubMed/PMC items are found
6. WHEN Perplexity is skipped due to sufficient internal evidence THEN the system SHALL log "Skipping Perplexity - internal evidence sufficient (score: X/100)"

### Requirement 5: Improve Off-Topic Reference Filtering with Tag Matching

**User Story:** As a clinician, I want references that directly address my clinical question, so that off-topic guidelines don't dilute the response quality.

#### Acceptance Criteria

1. WHEN a candidate reference's disease_tags do not overlap the query's primary_disease_tags THEN the system SHALL assign relevance score <10 and exclude it
2. WHEN ranking evidence for a query with recognized anchor scenario THEN the system SHALL hard-boost: anchor guidelines, matching systematic reviews, and pivotal trials for that scenario
3. WHEN ranking evidence THEN the system SHALL hard-penalize any reference whose primary focus does not match the query's primary focus (e.g., diabetes guidelines for AF+CKD anticoagulation)
4. WHEN the final reference list is generated THEN the system SHALL ensure ≥80% of references directly address the clinical question (disease_tags AND decision_tags overlap)
5. WHEN <5 total references remain after tag filtering THEN the system SHALL relax the ≥80% rule to allow high-quality broader reviews rather than returning too few citations
6. WHEN primary studies (RCT or cohort) exist for the scenario THEN the system SHALL include at least 2 primary studies in the final reference list, not only guidelines
7. WHEN composing the final reference list THEN the system SHALL limit it to 6-10 items, chosen by highest relevance and evidence level, to avoid long noisy lists

### Requirement 6: Fix Image Selection for Decision Questions

**User Story:** As a clinician asking about treatment decisions, I want to see relevant decision algorithms or no images at all, so that generic teaching images don't clutter my response.

#### Acceptance Criteria

1. WHEN decision_tags include "drug_choice", "duration", "de-escalation", or "anticoagulation" AND no imaging modality appears in the query THEN the system SHALL default to zero images unless a matching decision algorithm is found
2. WHEN generating image search queries THEN the system SHALL derive them from disease_tags + decision_tags (e.g., "atrial fibrillation chronic kidney disease anticoagulation algorithm") NOT from generic disease terms alone
3. WHEN no directly relevant decision algorithm is found THEN the system SHALL return zero images rather than generic teaching images (ECG, CXR, spectrum charts, hospital-acquired pneumonia infographics)
4. WHEN filtering images THEN the system SHALL require image titles to contain BOTH a disease term from disease_tags AND a decision concept from decision_tags
5. WHEN the query is any treatment/management question (CAP duration, DAPT decisions, HFpEF therapy, AF anticoagulation, etc.) THEN the system SHALL apply these image suppression rules, not just for AF+CKD scenarios

### Requirement 7: Fix Citation Enrichment for Anchor Guidelines

**User Story:** As a clinician, I want all references to have real PMIDs or DOIs, so that I can verify and access the cited sources.

#### Acceptance Criteria

1. WHEN enriching an anchor guideline or landmark trial THEN the system SHALL look it up by known PMID/DOI from the anchor table or landmark-trials list, NOT by fuzzy title search
2. WHEN an anchor guideline is included in the response THEN the system SHALL use the pre-defined URL from the anchor database, not generate a Google search URL
3. WHEN citation enrichment returns "low title match" (<50%) for a non-anchor item THEN the system SHALL drop that reference rather than keep a fuzzy match
4. WHEN enrichment fails for an item not in anchor/landmark tables THEN the system SHALL exclude it from the final reference list rather than guess
5. WHEN composing the final reference list THEN the system SHALL only include items that have real PMID, DOI, or verified guideline URL

### Requirement 8: Implement Proper Reference Formatting with Clickable Links

**User Story:** As a clinician, I want references to be properly formatted with article titles as clickable links that open directly to the article page (not search pages), with author names, publication year, and source badges, so that I can easily verify and read the cited sources.

#### Acceptance Criteria

1. WHEN formatting a reference THEN the system SHALL display it in this structure: (a) Article title as a clickable hyperlink, (b) Author names (first author et al. if >3 authors), (c) Journal/Source name, (d) Publication year, (e) Source badge (PubMed, Cochrane, Clinical Trial, etc.)
2. WHEN generating a reference URL THEN the system SHALL use direct article URLs only: PubMed (https://pubmed.ncbi.nlm.nih.gov/[PMID]), PMC (https://pmc.ncbi.nlm.nih.gov/articles/[PMCID]), DOI (https://doi.org/[DOI]), or verified guideline URLs
3. WHEN a reference URL is generated THEN the system SHALL verify it points to the actual article page, NOT a Google search page or generic search results
4. WHEN displaying source badges THEN the system SHALL show: [PubMed], [Cochrane], [Clinical Trial], [Guideline], [Meta-Analysis], [Systematic Review], and quality badges like [Gold Standard], [Recent], [Highly Cited], [Practical Guidance]
5. WHEN a reference lacks a valid direct URL THEN the system SHALL exclude it from the reference list rather than show a broken or search-page link
6. WHEN the user clicks a reference link THEN the system SHALL open the exact article page where the user can read the full reference content

### Requirement 9: Eliminate Google Search URLs from References

**User Story:** As a clinician, I want zero Google search URLs in my references, so that every citation leads directly to the source article.

#### Acceptance Criteria

1. WHEN generating reference URLs THEN the system SHALL NEVER use google.com/search URLs under any circumstances
2. WHEN a reference would have a Google search URL THEN the system SHALL either find the real article URL or exclude the reference entirely
3. WHEN validating the final reference list THEN the system SHALL scan for and remove any references containing "google.com/search" in their URLs
4. WHEN an anchor guideline or landmark trial is cited THEN the system SHALL use the pre-stored verified URL from the database, not generate any search URL
