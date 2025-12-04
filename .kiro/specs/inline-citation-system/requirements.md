# Requirements Document: Inline Citation System with Hover Cards

## Introduction

MedGuidance AI needs a modern, user-friendly citation system that displays evidence sources inline within medical responses. Instead of traditional superscript numbers, the system will use hover-enabled "Sources" badges that show reference details in a dropdown card. This improves readability while maintaining full citation transparency.

## Glossary

- **Sources Badge**: An inline pill/chip displaying "Sources" that appears after sentences containing citations, indicating evidence-backed statements
- **Hover Card**: A dropdown panel that appears when hovering over or clicking a Sources badge, displaying the list of references with metadata
- **Citation Number**: The numeric identifier (e.g., [[1]], [[2]]) linking text to specific references in the evidence database
- **Reference Metadata**: Information about a source including title, authors, journal, year, DOI, PMID, and quality badges
- **Quality Badge**: Visual indicators showing reference characteristics (e.g., "Practice Guideline", "Leading Journal", "Recent")
- **Doctor Mode**: Professional medical interface using blue color scheme (#3B82F6)
- **General Mode**: Consumer health interface using purple/indigo color scheme (#6366F1)
- **ParsedReference**: TypeScript interface containing structured reference data (title, authors, journal, year, doi, pmid, url, badges)
- **SourcesBadgeData**: TypeScript interface containing badge information (id, label, refNumbers array)

## Reference List Structure Example

Each reference in the References section MUST follow this exact 4-line structure:

```
6. [2025 AHA/ACC/ACS/ASNC/HRS/SCA/SCCT/SCMR/SVM Guideline for Perioperative Cardiovascular Management for Noncardiac Surgery: A Report of the American College of Cardiology/American Heart Association Joint Committee on Clinical Practice Guidelines](https://doi.org/10.1016/j.jacc.2025.06.013)

Thompson A, Fleischmann KE, Smilowitz NR, et al.

🔵 Journal of the American College of Cardiology. 2025;84(19):1869-1969. doi:10.1016/j.jacc.2025.06.013

📋 Practice Guideline ⭐ Leading Journal
```

**Line 1**: Full article title as clickable link (blue in Doctor Mode, purple in General Mode)
**Line 2**: First 3 authors + "et al." (if more than 3 authors)
**Line 3**: Journal badge + Year + Volume/Issue/Pages + DOI link
**Line 4**: Quality badges (Practice Guideline, Leading Journal, Recent, etc.)

## Requirements

### Requirement 1: Inline Sources Badge Display (Both Modes)

**User Story:** As a clinician or patient using either Doctor Mode or General Mode, I want to see which statements are evidence-backed without cluttering the text with numbers, so that I can read naturally while knowing sources are available.

#### Acceptance Criteria

1. WHEN the AI generates a response with citations in Doctor Mode THEN the system SHALL parse citation markers ([[1]], [[2]], etc.) and display Sources badges inline
2. WHEN the AI generates a response with citations in General Mode THEN the system SHALL parse citation markers ([[1]], [[2]], etc.) and display Sources badges inline
3. WHEN a text segment contains one or more citations THEN the system SHALL display a "Sources" badge immediately after that segment
4. WHEN displaying the Sources badge in Doctor Mode THEN the system SHALL use blue styling (#3B82F6 background with white text)
5. WHEN displaying the Sources badge in General Mode THEN the system SHALL use purple/indigo styling (#6366F1 background with white text)
6. WHEN the Sources badge is rendered THEN the system SHALL remove the original citation markers ([[1]], [[2]]) from the visible text to maintain clean readability
7. WHEN the system is in Doctor Mode THEN the inline Sources badges SHALL appear in all response tabs (Clinical Analysis, Diagnosis & Logic, Treatment & Safety, Evidence Database)
8. WHEN the system is in General Mode THEN the inline Sources badges SHALL appear in the main response content area

### Requirement 2: Hover Card Interaction

**User Story:** As a user, I want to hover over or click a Sources badge to see which references support that statement, so that I can quickly verify evidence without scrolling to the bottom.

#### Acceptance Criteria

1. WHEN a user hovers over a Sources badge THEN the system SHALL display a hover card within 200ms showing the list of references
2. WHEN a user clicks a Sources badge THEN the system SHALL toggle the hover card open/closed state
3. WHEN the hover card is displayed THEN the system SHALL position it below the badge without covering important text
4. WHEN the hover card extends beyond the viewport THEN the system SHALL adjust positioning to remain fully visible
5. WHEN a user moves the mouse away from both the badge and hover card THEN the system SHALL close the hover card after 300ms delay

### Requirement 3: Hover Card Content Structure

**User Story:** As a user, I want to see clear, structured information about each reference in the hover card, so that I can quickly assess the quality and relevance of sources.

#### Acceptance Criteria

1. WHEN the hover card displays a reference THEN the system SHALL show the reference number, clickable title (as a link), authors, journal, and year
2. WHEN a reference has a valid URL (PMID, DOI, or guideline link) THEN the system SHALL make the title a clickable link that opens in a new tab
3. WHEN a reference has quality badges (e.g., "Practice Guideline", "Leading Journal") THEN the system SHALL display them as small pills below the citation metadata
4. WHEN multiple references are shown in the hover card THEN the system SHALL separate them with subtle dividers for clarity
5. WHEN the hover card contains more than 5 references THEN the system SHALL make the card scrollable with a maximum height of 400px

### Requirement 4: Reference List Structure and Layout (Both Modes)

**User Story:** As a user in either Doctor Mode or General Mode, I want to see a well-structured reference list at the bottom of the response with complete citation details, so that I can verify sources and access the original articles.

#### Acceptance Criteria

1. WHEN the AI response includes citations in Doctor Mode THEN the system SHALL display a "References" section at the bottom with all unique references
2. WHEN the AI response includes citations in General Mode THEN the system SHALL display a "References" section at the bottom with all unique references
3. WHEN displaying a reference THEN the system SHALL use a 4-line structure:
   - **Line 1**: Reference number + Full article title as a clickable link (opens article page in new tab)
   - **Line 2**: First 3 authors (formatted as "LastName FirstInitial") + "et al." if more authors exist
   - **Line 3**: Journal/source name as a badge + Year + DOI link (if available)
   - **Line 4**: Quality badges (Practice Guideline, Leading Journal, Recent, etc.)
4. WHEN displaying the article title THEN the system SHALL make the entire title text a clickable link that opens the article URL
5. WHEN displaying authors THEN the system SHALL show exactly 3 authors maximum, followed by "et al." if there are more than 3 authors
6. WHEN displaying the journal/source THEN the system SHALL show it as a badge (e.g., "JACC" for Journal of American College of Cardiology, "JAMA" for Journal of the American Medical Association)
7. WHEN a DOI is available THEN the system SHALL display it as a clickable link in the format "doi:10.xxxx/xxxxx"
8. WHEN displaying references THEN the system SHALL use the exact same numbering as the inline citations (citation [[1]] in text = Reference 1 in list)
9. WHEN a user clicks on citation [[1]] in the text THEN clicking "View full references" SHALL scroll to Reference 1 in the list
10. WHEN a reference has no valid URL THEN the system SHALL display the title as plain text without making it clickable
11. WHEN displaying the References section in Doctor Mode THEN the system SHALL use blue accent colors (#2563EB) for title links and DOI links
12. WHEN displaying the References section in General Mode THEN the system SHALL use purple/indigo accent colors (#4F46E5) for title links and DOI links

### Requirement 5: Citation Parsing and Grouping

**User Story:** As a developer, I want the system to intelligently parse and group citations by sentence, so that Sources badges appear in logical positions.

#### Acceptance Criteria

1. WHEN parsing AI response text THEN the system SHALL identify all citation markers in formats: [[1]], [[1]][[2]], [[1,2,3]]
2. WHEN multiple citations appear consecutively THEN the system SHALL group them into a single Sources badge
3. WHEN citations span multiple sentences THEN the system SHALL create separate Sources badges for each sentence
4. WHEN a citation number is invalid or out of range THEN the system SHALL exclude it from the Sources badge count
5. WHEN generating Sources badges THEN the system SHALL preserve the original text formatting (bold, italics, line breaks)

### Requirement 6: Reference Metadata Validation

**User Story:** As a user, I want all reference links to point to actual articles, not search pages, so that I can access the source directly.

#### Acceptance Criteria

1. WHEN extracting reference URLs THEN the system SHALL prioritize in order: PMID > PMC > DOI > guideline URL
2. WHEN a reference has a PMID THEN the system SHALL construct the URL as `https://pubmed.ncbi.nlm.nih.gov/{PMID}/`
3. WHEN a reference has a DOI THEN the system SHALL construct the URL as `https://doi.org/{DOI}`
4. WHEN a reference URL contains "google.com/search" THEN the system SHALL reject it and use fallback URL construction
5. WHEN no valid URL can be constructed THEN the system SHALL display the reference without a clickable link

### Requirement 7: Quality Badge Display

**User Story:** As a clinician, I want to see quality indicators for each reference, so that I can quickly assess the strength of evidence.

#### Acceptance Criteria

1. WHEN a reference is from a practice guideline (WHO, CDC, NICE, AAP) THEN the system SHALL display a "Practice Guideline" badge
2. WHEN a reference is from a leading journal (NEJM, JAMA, Lancet, BMJ) THEN the system SHALL display a "Leading Journal" badge
3. WHEN a reference is published within the last 3 years THEN the system SHALL display a "Recent" badge
4. WHEN a reference is a systematic review or meta-analysis THEN the system SHALL display a "Systematic Review" or "Meta-Analysis" badge
5. WHEN displaying quality badges THEN the system SHALL use consistent styling: small pills with light background and dark text

### Requirement 8: Mode-Specific Styling

**User Story:** As a user, I want the citation system to match the visual style of the mode I'm using, so that the interface feels cohesive.

#### Acceptance Criteria

1. WHEN in Doctor Mode THEN the system SHALL use blue color scheme: Sources badge (#3B82F6), hover card border (#3B82F6), links (#2563EB)
2. WHEN in General Mode THEN the system SHALL use purple/indigo color scheme: Sources badge (#6366F1), hover card border (#6366F1), links (#4F46E5)
3. WHEN displaying quality badges THEN the system SHALL use neutral gray styling regardless of mode
4. WHEN hovering over interactive elements THEN the system SHALL provide visual feedback (darker shade, underline for links)
5. WHEN the hover card is open THEN the system SHALL display a subtle shadow and border to distinguish it from the background

### Requirement 9: Accessibility and Responsiveness

**User Story:** As a user on any device, I want the citation system to work smoothly and be accessible, so that I can use it regardless of my device or abilities.

#### Acceptance Criteria

1. WHEN using keyboard navigation THEN the system SHALL allow focusing on Sources badges with Tab key and opening hover cards with Enter/Space
2. WHEN using a screen reader THEN the system SHALL announce "Sources badge with N references" and read hover card content
3. WHEN viewing on mobile devices THEN the system SHALL make Sources badges tappable and hover cards scrollable
4. WHEN the hover card extends beyond screen width THEN the system SHALL adjust positioning to fit within viewport
5. WHEN multiple hover cards could overlap THEN the system SHALL close the previous card before opening a new one

### Requirement 10: Copy Behavior and DOM Preservation

**User Story:** As a user, I want to copy the response text with inline citation links preserved, so that I can share evidence-backed information with proper attribution.

#### Acceptance Criteria

1. WHEN rendering the response THEN the system SHALL keep citation markers [[N]](URL) in the DOM/markdown structure even though they are visually hidden
2. WHEN a Sources badge is displayed THEN the system SHALL hide the underlying [[N]] markers with CSS (display: none or visibility: hidden) but keep them in the DOM
3. WHEN a user copies response text THEN the system SHALL include inline citation links in the format [[N]](URL) from the preserved DOM structure
4. WHEN copying text with Sources badges THEN the copied text SHALL contain [[N]](URL) format instead of "Sources" badges
5. WHEN copying the References section THEN the system SHALL include full citation metadata with clickable links in markdown format
6. WHEN pasting copied text into a markdown editor THEN the system SHALL preserve the [[N]](URL) link format
7. WHEN copying multiple paragraphs THEN the system SHALL maintain the relationship between inline citations and the reference list
8. WHEN implementing the render layer THEN the system SHALL use a data attribute (e.g., data-citation-numbers="1,2,3") on the Sources badge to preserve citation information

### Requirement 11: Citation-to-Reference Mapping Accuracy

**User Story:** As a user, I want citation numbers in the text to always match the correct reference in the list, so that I can trust the sources and avoid confusion.

#### Acceptance Criteria

1. WHEN the AI generates citation [[1]] in the response text THEN the system SHALL ensure it maps to Reference 1 in the References section
2. WHEN the AI generates citation [[2]] in the response text THEN the system SHALL ensure it maps to Reference 2 in the References section
3. WHEN displaying references in the list THEN the system SHALL maintain the exact order that citations first appear in the text
4. WHEN a citation number appears multiple times in the text THEN the system SHALL always link to the same reference entry
5. WHEN building the References section THEN the system SHALL deduplicate references while preserving the first occurrence order
6. WHEN a user clicks a Sources badge containing [[1]][[2]][[3]] THEN the hover card SHALL display References 1, 2, and 3 in that exact order
7. WHEN a user clicks "View full references" from a hover card THEN the system SHALL scroll to the first reference number in that group
8. WHEN testing citation mapping THEN the system SHALL verify that every citation number in the text has a corresponding reference entry with the same number
9. WHEN a citation number is out of range (e.g., [[99]] when only 10 references exist) THEN the system SHALL log an error and exclude it from display
10. WHEN the system encounters duplicate reference content THEN the system SHALL reuse the existing reference number instead of creating a new entry

### Requirement 12: Dual-Mode Implementation

**User Story:** As a developer, I want a single citation system implementation that works seamlessly in both Doctor Mode and General Mode, so that we maintain code consistency and reduce duplication.

#### Acceptance Criteria

1. WHEN implementing the citation system THEN the system SHALL use a shared component architecture that accepts a "mode" prop to determine styling
2. WHEN rendering in Doctor Mode THEN the system SHALL apply blue color scheme to all citation elements (Sources badges, hover cards, reference links)
3. WHEN rendering in General Mode THEN the system SHALL apply purple/indigo color scheme to all citation elements (Sources badges, hover cards, reference links)
4. WHEN parsing citations THEN the system SHALL use the same parsing logic regardless of mode
5. WHEN displaying the References section THEN the system SHALL use the same layout and structure in both modes, with only color differences
6. WHEN a user switches between modes THEN the citation system SHALL maintain consistent behavior and functionality
7. WHEN testing the citation system THEN the system SHALL verify correct rendering in both Doctor Mode (`/doctor` route) and General Mode (`/general` route)


## Data Model Requirements

### ParsedReference Interface

The system SHALL use a shared `ParsedReference` type with the following structure:

```typescript
interface ParsedReference {
  id: string;                    // Unique identifier
  number: number;                // Reference number (1, 2, 3, etc.)
  title: string;                 // Article title
  authors: string[];             // Array of author names
  journal: string;               // Journal/source name
  year: string;                  // Publication year
  doi?: string;                  // DOI identifier (optional)
  pmid?: string;                 // PubMed ID (optional)
  pmcid?: string;                // PMC ID (optional)
  url: string;                   // Direct article URL
  badges: QualityBadge[];        // Array of quality badges
  isValid: boolean;              // Whether reference has valid data
}
```

### SourcesBadgeData Interface

The system SHALL use a `SourcesBadgeData` type for badge components:

```typescript
interface SourcesBadgeData {
  id: string;                    // Unique badge identifier (e.g., "p1-s1")
  label: string;                 // Badge label (e.g., "Sources")
  refNumbers: number[];          // Array of reference numbers (e.g., [1, 2, 3])
  mode: 'doctor' | 'general';    // Mode for styling
}
```

## Testing Checklist

### Doctor Mode Testing (`/doctor` route)

Test the following scenarios in Doctor Mode to verify correct implementation:

1. **Inline Citations Test**
   - [ ] Ask: "What is the first-line treatment for type 2 diabetes?"
   - [ ] Verify: Blue "Sources" badges appear after cited statements
   - [ ] Verify: Citation markers [[1]], [[2]] are hidden from visible text
   - [ ] Verify: Hover over badge shows reference details in blue-bordered card

2. **Reference List Test**
   - [ ] Ask: "What are the ACC/AHA guidelines for hypertension management?"
   - [ ] Verify: References section appears at bottom with blue links
   - [ ] Verify: Article titles are clickable and open correct URLs
   - [ ] Verify: First 3 authors shown + "et al." if more exist
   - [ ] Verify: Journal badges and quality badges display correctly

3. **Citation Mapping Test**
   - [ ] Ask: "Explain perioperative management of rivaroxaban"
   - [ ] Verify: Citation [[1]] in text maps to Reference 1 in list
   - [ ] Verify: Citation [[2]] in text maps to Reference 2 in list
   - [ ] Verify: Clicking "View full references" scrolls to correct reference

4. **Hover Card Test**
   - [ ] Ask: "What are the treatment options for atrial fibrillation?"
   - [ ] Verify: Hover card appears within 200ms
   - [ ] Verify: Hover card shows reference number, title, authors, journal, year
   - [ ] Verify: Quality badges appear in hover card
   - [ ] Verify: Hover card closes after 300ms when mouse leaves

5. **Copy Behavior Test**
   - [ ] Ask: "What is the recommended dose of metformin?"
   - [ ] Copy response text to clipboard
   - [ ] Paste into text editor
   - [ ] Verify: Citations appear as [[1]](URL) format
   - [ ] Verify: References section includes full metadata

### General Mode Testing (`/general` route)

Test the following scenarios in General Mode to verify correct implementation:

1. **Inline Citations Test**
   - [ ] Ask: "What are the symptoms of diabetes?"
   - [ ] Verify: Purple "Sources" badges appear after cited statements
   - [ ] Verify: Citation markers [[1]], [[2]] are hidden from visible text
   - [ ] Verify: Hover over badge shows reference details in purple-bordered card

2. **Reference List Test**
   - [ ] Ask: "How can I lower my blood pressure naturally?"
   - [ ] Verify: References section appears at bottom with purple links
   - [ ] Verify: Article titles are clickable and open correct URLs
   - [ ] Verify: First 3 authors shown + "et al." if more exist
   - [ ] Verify: Journal badges and quality badges display correctly

3. **Citation Mapping Test**
   - [ ] Ask: "What foods should I avoid with high cholesterol?"
   - [ ] Verify: Citation [[1]] in text maps to Reference 1 in list
   - [ ] Verify: Citation [[2]] in text maps to Reference 2 in list
   - [ ] Verify: Clicking "View full references" scrolls to correct reference

4. **Hover Card Test**
   - [ ] Ask: "What are the side effects of statins?"
   - [ ] Verify: Hover card appears within 200ms
   - [ ] Verify: Hover card shows reference number, title, authors, journal, year
   - [ ] Verify: Quality badges appear in hover card
   - [ ] Verify: Hover card closes after 300ms when mouse leaves

5. **Copy Behavior Test**
   - [ ] Ask: "What is a healthy diet for heart health?"
   - [ ] Copy response text to clipboard
   - [ ] Paste into text editor
   - [ ] Verify: Citations appear as [[1]](URL) format
   - [ ] Verify: References section includes full metadata

### Cross-Mode Testing

1. **Shared Component Test**
   - [ ] Verify: Same parsing logic works in both modes
   - [ ] Verify: Same reference structure in both modes (only colors differ)
   - [ ] Verify: Same hover card behavior in both modes

2. **URL Validation Test**
   - [ ] Verify: No Google search URLs appear in references
   - [ ] Verify: PMID links go to `https://pubmed.ncbi.nlm.nih.gov/{PMID}/`
   - [ ] Verify: DOI links go to `https://doi.org/{DOI}`
   - [ ] Verify: Invalid URLs are excluded

3. **Accessibility Test**
   - [ ] Verify: Tab key focuses on Sources badges
   - [ ] Verify: Enter/Space opens hover cards
   - [ ] Verify: Screen reader announces "Sources badge with N references"
   - [ ] Verify: Mobile devices can tap badges and scroll hover cards
