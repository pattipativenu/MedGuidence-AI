# Implementation Tasks: Inline Citation System

## Architecture Note

**Single Source of Truth**: All citation parsing logic lives in `CitationRenderer` + parser utilities. Doctor Mode and General Mode share the exact same parsing and rendering logic - they only differ in styling via the `mode` prop. This ensures consistency and eliminates code duplication.

## 1. Set up core data structures and types

- [x] 1.1 Create TypeScript interfaces for citation system
  - Created `lib/types/citation.ts` with all required interfaces
  - Defined ParsedReference, SourcesBadgeData, TextSegment, ParsedResponse, ValidationResult, CitationColors
  - _Requirements: All requirements (foundation)_

## 2. Implement citation parser

- [x] 2.1 Create citation marker extraction function
  - Implemented in `lib/citation/parser.ts`
  - Supports [[1]], [[1]][[2]], [[1,2,3]] formats
  - Extracts citation numbers and positions
  - Returns clean text without markers
  - _Requirements: 5.1, 5.2_

- [x] 2.2 Create reference parsing function
  - Implemented `parseReference()` in `lib/citation/parser.ts`
  - Parses reference strings into ParsedReference objects
  - Extracts title, authors, journal, year, DOI, PMID
  - Handles various citation formats
  - _Requirements: 4.3, 6.1_

- [x] 2.3 Implement URL construction logic
  - Implemented `constructReferenceURL()` in `lib/citation/parser.ts`
  - Priority: PMID > PMC > DOI > guideline URL
  - Constructs PubMed URLs: `https://pubmed.ncbi.nlm.nih.gov/{PMID}/`
  - Constructs DOI URLs: `https://doi.org/{DOI}`
  - Rejects Google search URLs
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 2.4 Implement quality badge determination
  - Implemented `determineQualityBadges()` in `lib/citation/parser.ts`
  - Detects Practice Guideline sources (WHO, CDC, NICE, AAP, ACC, AHA, ESC, KDIGO)
  - Detects Leading Journal sources (NEJM, JAMA, Lancet, BMJ, Nature, Science, Cell)
  - Detects Recent publications (last 3 years)
  - Detects Systematic Review / Meta-Analysis
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 2.5 Create main response parser
  - Implemented `parseResponseWithCitations()` in `lib/citation/parser.ts`
  - Splits response into main content and references section
  - Parses references section into ParsedReference array
  - Segments main content by sentences/paragraphs
  - Extracts citations from each segment
  - Builds citation-to-reference mapping
  - Preserves first-seen order of citations
  - Deduplicates references while maintaining first occurrence order
  - _Requirements: 5.1, 5.3, 11.1, 11.3, 11.5, 11.10_

- [x] 2.6 Write unit tests for parser
  - Created `lib/citation/__tests__/parser.test.ts`
  - Tests citation marker extraction (all formats)
  - Tests reference parsing (various formats)
  - Tests URL construction (PMID, DOI, PMC)
  - Tests quality badge determination
  - Tests citation-to-reference mapping accuracy
  - _Requirements: All Requirement 5, 6, 7, 11_

## 3. Create SourcesBadge component

- [x] 3.1 Implement SourcesBadge React component
  - Created `components/ui/sources-badge.tsx`
  - Accepts badge data and references as props
  - Displays "Sources" label (no count in visible text)
  - Applies blue styling for Doctor Mode (#3B82F6)
  - Applies purple styling for General Mode (#6366F1)
  - Includes hover and click handlers
  - _Requirements: 1.3, 1.4, 1.5, 8.1, 8.2_

- [x] 3.2 Implement hover interaction logic
  - Shows hover card on mouse enter (200ms delay)
  - Toggles hover card on click
  - Closes hover card on mouse leave (300ms delay)
  - Stores hover timeout state
  - _Requirements: 2.1, 2.2, 2.5_

- [x] 3.3 Add accessibility features
  - Added ARIA labels ("Sources badge with N references")
  - Added aria-haspopup and aria-expanded attributes
  - Supports keyboard navigation (Tab, Enter, Space, Escape)
  - _Requirements: 9.1, 9.2_

- [x] 3.4 Write unit tests for SourcesBadge
  - Created `components/ui/__tests__/sources-badge.test.tsx`
  - Tests rendering with different modes
  - Tests hover interaction timing
  - Tests click toggle behavior
  - Tests accessibility attributes
  - _Requirements: 1, 2, 8, 9_

## 4. Create HoverCard component

- [x] 4.1 Implement HoverCard React component
  - Created `components/ui/hover-card.tsx`
  - Displays reference count header
  - Renders list of references with ReferencePreview
  - Includes "View full references" button
  - Applies mode-specific border colors
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4.2 Implement viewport-aware positioning
  - Detects if hover card extends beyond viewport
  - Adjusts position to stay within bounds
  - Uses ref to measure card dimensions
  - _Requirements: 2.4, 9.4_

- [x] 4.3 Implement scrollable content for 5+ references
  - Sets max-height to 400px
  - Enables vertical scrolling
  - _Requirements: 3.5_

- [x] 4.4 Add scroll-to-references functionality
  - Implements smooth scroll to References section
  - Scrolls to first reference in group
  - _Requirements: 4.4, 11.7_

- [ ]* 4.5 Write unit tests for HoverCard
  - Test positioning logic
  - Test scrollable content
  - Test scroll-to-references
  - _Requirements: 2, 3, 4_

## 5. Create ReferencePreview component

- [x] 5.1 Implement ReferencePreview React component
  - Created `components/ui/reference-preview.tsx`
  - Displays reference number
  - Displays clickable title (if URL exists)
  - Displays authors (first 3 + "et al.")
  - Displays journal, year
  - Displays quality badges
  - Adds dividers between references
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 5.2 Implement author formatting
  - Shows exactly 3 authors maximum
  - Adds "et al." if more than 3 authors
  - Formats as "LastName FirstInitial"
  - _Requirements: 4.5_

- [ ]* 5.3 Write unit tests for ReferencePreview
  - Test author formatting (1, 2, 3, 4+ authors)
  - Test title link rendering
  - Test badge display
  - _Requirements: 3, 4_

## 6. Create ReferenceList component

- [x] 6.1 Implement ReferenceList React component
  - Created `components/ui/reference-list.tsx`
  - Displays "References" heading with icon
  - Renders list of ReferenceItem components
  - Applies mode-specific link colors
  - Adds id="references-section" for scrolling
  - _Requirements: 4.1, 4.2, 4.11, 4.12_

- [x] 6.2 Implement reference deduplication
  - Removes duplicate references
  - Preserves first occurrence order
  - Maintains citation number consistency
  - _Requirements: 11.5, 11.10_

- [ ]* 6.3 Write unit tests for ReferenceList
  - Test rendering with different modes
  - Test deduplication logic
  - Test scroll target
  - _Requirements: 4, 11_

## 7. Create ReferenceItem component

- [x] 7.1 Implement ReferenceItem React component (4-line structure)
  - Created `components/ui/reference-item.tsx`
  - **Line 1**: Reference number + Full title as clickable link
  - **Line 2**: First 3 authors + "et al." if more
  - **Line 3**: Journal badge + Year + Volume/Issue/Pages + DOI link
  - **Line 4**: Quality badges
  - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 7.2 Implement journal badge display
  - Shows journal name as badge
  - Uses abbreviations (JACC, JAMA, etc.)
  - Styles consistently across modes
  - _Requirements: 4.6_

- [x] 7.3 Implement DOI link display
  - Formats as "doi:10.xxxx/xxxxx"
  - Makes clickable to https://doi.org/{DOI}
  - Applies mode-specific link color
  - _Requirements: 4.7, 4.11, 4.12_

- [x] 7.4 Add scroll target and highlight
  - Adds id="ref-{number}" for scroll targeting
  - Adds scroll-mt-20 class for offset
  - Adds highlight animation on target
  - _Requirements: 4.9, 11.7_

- [ ]* 7.5 Write unit tests for ReferenceItem
  - Test 4-line structure rendering
  - Test author truncation
  - Test journal badge
  - Test DOI link
  - Test scroll target
  - _Requirements: 4_

## 8. Create CitationRenderer component

- [x] 8.1 Implement CitationRenderer React component
  - Created `components/ui/citation-renderer.tsx`
  - Parses content into segments with citations
  - Builds SourcesBadge data for each segment
  - Renders segments with visible text
  - Hides citation markers in DOM (for copy behavior)
  - Renders Sources badges inline
  - _Requirements: 1.1, 1.2, 1.6, 10.1, 10.2_

- [x] 8.2 Implement DOM preservation for copy behavior
  - Creates visually hidden span with sr-only class
  - Keeps [[N]](URL) markers in hidden span (included in copied text)
  - Places hidden span adjacent to Sources badge
  - Uses data attributes to store citation numbers on Sources badge
  - _Requirements: 10.1, 10.2, 10.3, 10.6, 10.8_

- [x] 8.3 Preserve text formatting
  - Maintains bold, italics, line breaks
  - Handles markdown formatting
  - _Requirements: 5.5_

- [ ]* 8.4 Write integration tests for CitationRenderer
  - Test segment parsing
  - Test badge rendering
  - Test DOM preservation
  - Test copy behavior
  - _Requirements: 1, 5, 10_

## 9. Integrate citation system into Doctor Mode

- [ ] 9.1 Update Doctor Mode response rendering
  - Uncomment CitationRenderer imports in `app/doctor/page.tsx`
  - Remove temporary citation marker removal code
  - Apply CitationRenderer to all response tabs (Clinical Analysis, Diagnosis & Logic, Treatment & Safety, Evidence Database)
  - Pass mode="doctor" prop
  - _Requirements: 1.7, 12.2_

- [ ] 9.2 Verify ReferenceList in Doctor Mode
  - Confirm ReferenceList is already imported and used
  - Verify mode="doctor" prop is passed
  - Ensure blue color scheme is applied
  - _Requirements: 4.1, 4.11, 12.2_

- [ ] 9.3 Remove old citation rendering code
  - Remove commented-out citation number rendering logic
  - Clean up temporary citation marker removal code
  - Ensure no duplicate citation rendering
  - _Requirements: 8.1, 8.4_

- [ ] 9.4 Test Doctor Mode integration
  - Run all Doctor Mode test scenarios from requirements
  - **Test with these specific questions**:
    1. "What is the first-line treatment for hypertension?"
    2. "Perioperative management of rivaroxaban for AF patient with CKD"
    3. "Treatment guidelines for community-acquired pneumonia"
    4. "DAPT duration after PCI with drug-eluting stent"
    5. "Management of chickenpox in immunocompromised children"
  - Verify inline citations, reference list, mapping, hover, copy for each
  - _Requirements: Testing Checklist - Doctor Mode_

## 10. Integrate citation system into General Mode

- [ ] 10.1 Update General Mode response rendering
  - Uncomment CitationRenderer imports in `app/general/page.tsx`
  - Remove temporary citation marker removal code
  - Apply CitationRenderer to main response content area
  - Pass mode="general" prop
  - _Requirements: 1.8, 12.3_

- [ ] 10.2 Verify ReferenceList in General Mode
  - Confirm ReferenceList is already imported and used
  - Verify mode="general" prop is passed
  - Ensure purple color scheme is applied
  - _Requirements: 4.2, 4.12, 12.3_

- [ ] 10.3 Remove old citation rendering code
  - Remove commented-out citation number rendering logic
  - Clean up temporary citation marker removal code
  - Ensure no duplicate citation rendering
  - _Requirements: 8.2, 8.4_

- [ ] 10.4 Test General Mode integration
  - Run all General Mode test scenarios from requirements
  - **Test with these specific questions**:
    1. "What are the symptoms of high blood pressure?"
    2. "How can I lower my cholesterol naturally?"
    3. "What foods should I avoid with diabetes?"
    4. "What are the side effects of aspirin?"
    5. "When should I see a doctor for a fever?"
  - Verify inline citations, reference list, mapping, hover, copy for each
  - _Requirements: Testing Checklist - General Mode_

## 11. Add validation and error handling

- [x] 11.1 Implement citation validation
  - Created `lib/citation/validator.ts`
  - Checks all citation numbers are in range
  - Checks all references have valid URLs
  - Logs errors for out-of-range citations
  - Logs warnings for missing URLs
  - _Requirements: 5.4, 6.5, 11.9_

- [x] 11.2 Add error boundaries
  - Created `components/ui/citation-error-boundary.tsx`
  - Wraps citation components in error boundaries
  - Displays fallback UI on errors
  - Logs errors for debugging
  - _Requirements: General error handling_

- [ ]* 11.3 Write validation tests
  - Test out-of-range citation handling
  - Test missing URL handling
  - Test error boundary behavior
  - _Requirements: 5, 6, 11_

## 12. Final testing and polish

- [ ] 12.1 Run cross-mode testing
  - Verify shared component architecture
  - Verify same parsing logic in both modes
  - Verify URL validation (no Google search URLs)
  - Test switching between Doctor and General modes
  - _Requirements: Testing Checklist - Cross-Mode_

- [ ] 12.2 Run accessibility testing
  - Test keyboard navigation (Tab, Enter, Space, Escape)
  - Test screen reader announcements
  - Test mobile tap interactions
  - Verify ARIA labels are correct
  - _Requirements: Testing Checklist - Accessibility_

- [x] 12.3 Performance optimization
  - Added React.memo to ReferenceItem
  - Memoized parsed references in CitationRenderer
  - Memoized Sources badge data in CitationRenderer
  - _Requirements: Performance considerations_

- [ ] 12.4 Final polish
  - Review all styling for consistency
  - Test on different screen sizes
  - Test with various response lengths
  - Verify all requirements are met
  - _Requirements: All requirements_

## 13. Checkpoint - Ensure all tests pass

- [ ] 13.1 Run all unit tests
  - Execute `npm test` or `vitest run`
  - Verify all parser tests pass
  - Verify all component tests pass
  - Fix any failing tests

- [ ] 13.2 Manual testing verification
  - Test in both Doctor and General modes
  - Verify Sources badges appear correctly
  - Verify hover cards work properly
  - Verify reference list displays correctly
  - Verify copy behavior preserves [[N]](URL) format

- [ ] 13.3 Final review
  - Ensure all tests pass
  - Ask the user if questions arise
  - Confirm all requirements are met
