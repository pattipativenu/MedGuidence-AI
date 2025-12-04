# Design Document: Inline Citation System with Hover Cards

## Overview

This document outlines the technical design for implementing a modern inline citation system in MedGuidance AI. The system replaces traditional superscript citation numbers with interactive "Sources" badges that display reference details in hover cards. The design emphasizes clean readability, accurate citation-to-reference mapping, and seamless integration with both Doctor Mode and General Mode.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Response (Markdown)                    │
│              Contains [[1]], [[2]], [[3]] markers            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Citation Parser & Processor                     │
│  - Extract citation markers from text                        │
│  - Parse reference list from AI response                     │
│  - Build citation-to-reference mapping                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Response Renderer (React)                       │
│  - Render text with Sources badges                          │
│  - Hide [[N]] markers (keep in DOM for copy)                │
│  - Attach hover card interactions                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Reference List Component                        │
│  - Display formatted references at bottom                    │
│  - 4-line structure with badges                             │
│  - Scroll-to-reference functionality                         │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
<ResponseWithCitations mode="doctor|general">
  ├── <CitationRenderer>
  │   ├── <TextSegment>
  │   │   ├── Text content
  │   │   └── <SourcesBadge>
  │   │       └── <HoverCard>
  │   │           └── <ReferencePreview>
  │   └── ...
  └── <ReferenceList>
      └── <ReferenceItem> × N
```

## Components and Interfaces

### 1. Data Models

#### ParsedReference Interface

```typescript
interface ParsedReference {
  id: string;                    // Unique identifier (e.g., "ref-1")
  number: number;                // Reference number (1, 2, 3, etc.)
  title: string;                 // Full article title
  authors: string[];             // Array of author names
  journal: string;               // Journal/source name
  year: string;                  // Publication year
  volume?: string;               // Volume number (optional)
  issue?: string;                // Issue number (optional)
  pages?: string;                // Page range (optional)
  doi?: string;                  // DOI identifier (optional)
  pmid?: string;                 // PubMed ID (optional)
  pmcid?: string;                // PMC ID (optional)
  url: string;                   // Direct article URL
  badges: QualityBadge[];        // Array of quality badges
  isValid: boolean;              // Whether reference has valid data
}

type QualityBadge = 
  | 'Practice Guideline'
  | 'Leading Journal'
  | 'Recent'
  | 'Systematic Review'
  | 'Meta-Analysis'
  | 'Highly Cited';
```

#### SourcesBadgeData Interface

```typescript
interface SourcesBadgeData {
  id: string;                    // Unique badge identifier (e.g., "p1-s1")
  label: string;                 // Badge label ("Sources")
  refNumbers: number[];          // Array of reference numbers (e.g., [1, 2, 3])
  mode: 'doctor' | 'general';    // Mode for styling
}
```

#### TextSegment Interface

```typescript
interface TextSegment {
  id: string;                    // Unique segment identifier
  text: string;                  // Text content without citation markers
  citationNumbers: number[];     // Citation numbers in this segment
  originalText: string;          // Original text with [[N]] markers (for copy)
}
```

### 2. Core Components

#### CitationParser

**Purpose**: Parse AI response text and extract citations and references

**Location**: `lib/citation/parser.ts`

**Functions**:

```typescript
/**
 * Parse AI response and extract citations and references
 */
export function parseResponseWithCitations(
  response: string
): {
  segments: TextSegment[];
  references: ParsedReference[];
  mainContent: string;
} {
  // 1. Split response into main content and references section
  // 2. Parse references section into ParsedReference[]
  // 3. Segment main content by sentences/paragraphs
  // 4. Extract citation markers from each segment
  // 5. Return structured data
}

/**
 * Extract citation markers from text
 * Supports: [[1]], [[1]][[2]], [[1,2,3]]
 */
export function extractCitationMarkers(text: string): {
  markers: Array<{ numbers: number[]; startIndex: number; endIndex: number }>;
  cleanText: string;
} {
  // Use regex to find all citation patterns
  // Return positions and clean text
}

/**
 * Parse a single reference string into ParsedReference
 */
export function parseReference(
  refString: string,
  refNumber: number
): ParsedReference {
  // Extract title, authors, journal, year, DOI, PMID
  // Construct URL (priority: PMID > PMC > DOI)
  // Determine quality badges
  // Return structured reference
}

/**
 * Build citation-to-reference mapping
 */
export function buildCitationMapping(
  segments: TextSegment[],
  references: ParsedReference[]
): Map<number, ParsedReference> {
  // Create map of citation number -> reference
  // Validate all citations have corresponding references
  // Log errors for out-of-range citations
}
```

#### SourcesBadge Component

**Purpose**: Display inline "Sources" badge with hover interaction

**Location**: `components/ui/sources-badge.tsx`

**Props**:

```typescript
interface SourcesBadgeProps {
  badge: SourcesBadgeData;
  references: ParsedReference[];
  onViewReferences?: () => void;
}
```

**Implementation**:

```typescript
export function SourcesBadge({ badge, references, onViewReferences }: SourcesBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Get references for this badge
  const badgeRefs = badge.refNumbers
    .map(num => references.find(r => r.number === num))
    .filter(Boolean);
  
  // Color scheme based on mode
  const colors = badge.mode === 'doctor' 
    ? { bg: '#3B82F6', border: '#3B82F6', link: '#2563EB' }
    : { bg: '#6366F1', border: '#6366F1', link: '#4F46E5' };
  
  // Hover handlers with delay
  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsOpen(true);
  };
  
  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setIsOpen(false), 300);
    setHoverTimeout(timeout);
  };
  
  return (
    <span className="relative inline-block ml-2">
      <button
        className="sources-badge"
        style={{ backgroundColor: colors.bg }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Sources badge with ${badgeRefs.length} references`}
      >
        {badge.label}
      </button>
      
      {isOpen && (
        <HoverCard
          references={badgeRefs}
          colors={colors}
          onViewReferences={onViewReferences}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}
    </span>
  );
}
```

#### HoverCard Component

**Purpose**: Display reference details in dropdown panel

**Location**: `components/ui/hover-card.tsx`

**Props**:

```typescript
interface HoverCardProps {
  references: ParsedReference[];
  colors: { bg: string; border: string; link: string };
  onViewReferences?: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}
```

**Implementation**:

```typescript
export function HoverCard({ references, colors, onViewReferences, onMouseEnter, onMouseLeave }: HoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Adjust position if extends beyond viewport
  useEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        cardRef.current.style.right = '0';
        cardRef.current.style.left = 'auto';
      }
    }
  }, []);
  
  return (
    <div
      ref={cardRef}
      className="hover-card"
      style={{ borderColor: colors.border }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="hover-card-header">
        {references.length} {references.length === 1 ? 'Reference' : 'References'}
      </div>
      
      <div className="hover-card-content">
        {references.map((ref, idx) => (
          <ReferencePreview
            key={ref.id}
            reference={ref}
            linkColor={colors.link}
            showDivider={idx < references.length - 1}
          />
        ))}
      </div>
      
      <button
        className="hover-card-footer"
        onClick={onViewReferences}
        style={{ color: colors.link }}
      >
        View full references ↓
      </button>
    </div>
  );
}
```

#### ReferencePreview Component

**Purpose**: Display compact reference info in hover card

**Location**: `components/ui/reference-preview.tsx`

**Implementation**:

```typescript
export function ReferencePreview({ reference, linkColor, showDivider }: ReferencePreviewProps) {
  return (
    <div className="reference-preview">
      <div className="reference-number">{reference.number}.</div>
      <div className="reference-content">
        {reference.url ? (
          <a
            href={reference.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: linkColor }}
            className="reference-title"
          >
            {reference.title}
          </a>
        ) : (
          <span className="reference-title">{reference.title}</span>
        )}
        
        <div className="reference-meta">
          {formatAuthors(reference.authors)}. {reference.journal}. {reference.year}.
        </div>
        
        {reference.badges.length > 0 && (
          <div className="reference-badges">
            {reference.badges.map(badge => (
              <span key={badge} className="quality-badge">{badge}</span>
            ))}
          </div>
        )}
      </div>
      
      {showDivider && <div className="reference-divider" />}
    </div>
  );
}

function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return 'Unknown Authors';
  if (authors.length <= 3) return authors.join(', ');
  return `${authors.slice(0, 3).join(', ')}, et al.`;
}
```

#### ReferenceList Component

**Purpose**: Display complete reference list at bottom of response

**Location**: `components/ui/reference-list.tsx`

**Props**:

```typescript
interface ReferenceListProps {
  references: ParsedReference[];
  mode: 'doctor' | 'general';
}
```

**Implementation**:

```typescript
export function ReferenceList({ references, mode }: ReferenceListProps) {
  const linkColor = mode === 'doctor' ? '#2563EB' : '#4F46E5';
  
  if (references.length === 0) return null;
  
  return (
    <div id="references-section" className="reference-list">
      <h3 className="reference-list-heading">
        <svg className="icon">...</svg>
        References
      </h3>
      
      <div className="reference-list-content">
        {references.map(ref => (
          <ReferenceItem
            key={ref.id}
            reference={ref}
            linkColor={linkColor}
          />
        ))}
      </div>
    </div>
  );
}
```

#### ReferenceItem Component

**Purpose**: Display single reference in 4-line format

**Location**: `components/ui/reference-item.tsx`

**Implementation**:

```typescript
export function ReferenceItem({ reference, linkColor }: ReferenceItemProps) {
  return (
    <div id={`ref-${reference.number}`} className="reference-item scroll-mt-20">
      {/* Line 1: Number + Title (clickable) */}
      <div className="reference-title-line">
        <span className="reference-number">{reference.number}. </span>
        {reference.url ? (
          <a
            href={reference.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: linkColor }}
            className="reference-title-link"
          >
            {reference.title}
          </a>
        ) : (
          <span className="reference-title-text">{reference.title}</span>
        )}
      </div>
      
      {/* Line 2: Authors */}
      <div className="reference-authors">
        {formatAuthors(reference.authors)}
      </div>
      
      {/* Line 3: Journal badge + Year + DOI */}
      <div className="reference-meta-line">
        <span className="journal-badge">{reference.journal}</span>
        <span className="reference-year">. {reference.year}</span>
        {reference.volume && <span>;{reference.volume}</span>}
        {reference.issue && <span>({reference.issue})</span>}
        {reference.pages && <span>:{reference.pages}</span>}
        {reference.doi && (
          <>
            . <a
              href={`https://doi.org/${reference.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: linkColor }}
            >
              doi:{reference.doi}
            </a>
          </>
        )}
      </div>
      
      {/* Line 4: Quality badges */}
      {reference.badges.length > 0 && (
        <div className="reference-quality-badges">
          {reference.badges.map(badge => (
            <span key={badge} className="quality-badge">{badge}</span>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. Citation Renderer

**Purpose**: Render response text with Sources badges

**Location**: `components/ui/citation-renderer.tsx`

**Implementation Strategy**:

```typescript
export function CitationRenderer({ content, references, mode }: CitationRendererProps) {
  // 1. Parse content into segments with citations
  const { segments } = parseResponseWithCitations(content);
  
  // 2. Build Sources badges for each segment
  const badges = segments
    .filter(seg => seg.citationNumbers.length > 0)
    .map(seg => ({
      id: seg.id,
      label: 'Sources',
      refNumbers: seg.citationNumbers,
      mode
    }));
  
  // 3. Render segments with badges
  return (
    <div className="citation-content">
      {segments.map(segment => (
        <span key={segment.id}>
          {/* Render visible text */}
          <span className="segment-text">{segment.text}</span>
          
          {/* Hidden citation markers for copy behavior */}
          <span className="citation-markers-hidden" style={{ display: 'none' }}>
            {segment.citationNumbers.map(num => {
              const ref = references.find(r => r.number === num);
              return ref ? `[[${num}]](${ref.url})` : '';
            }).join('')}
          </span>
          
          {/* Sources badge */}
          {segment.citationNumbers.length > 0 && (
            <SourcesBadge
              badge={badges.find(b => b.id === segment.id)!}
              references={references}
              onViewReferences={() => scrollToReferences()}
            />
          )}
        </span>
      ))}
    </div>
  );
}
```

## Data Models

### Reference URL Construction

**Priority Order**: PMID > PMC > DOI > Guideline URL

```typescript
function constructReferenceURL(ref: Partial<ParsedReference>): string | null {
  // Priority 1: PMID
  if (ref.pmid) {
    const pmid = ref.pmid.replace(/[^\d]/g, '');
    if (pmid) return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
  }
  
  // Priority 2: PMC
  if (ref.pmcid) {
    return `https://pmc.ncbi.nlm.nih.gov/articles/${ref.pmcid}/`;
  }
  
  // Priority 3: DOI
  if (ref.doi) {
    const doi = ref.doi.replace(/^doi:\s*/i, '').trim();
    if (doi) return `https://doi.org/${doi}`;
  }
  
  // Priority 4: Existing URL (if valid)
  if (ref.url && !ref.url.includes('google.com/search')) {
    return ref.url;
  }
  
  return null;
}
```

### Quality Badge Determination

```typescript
function determineQualityBadges(ref: ParsedReference): QualityBadge[] {
  const badges: QualityBadge[] = [];
  const titleLower = ref.title.toLowerCase();
  const journalLower = ref.journal.toLowerCase();
  
  // Practice Guideline
  if (
    titleLower.includes('guideline') ||
    journalLower.includes('who') ||
    journalLower.includes('cdc') ||
    journalLower.includes('nice') ||
    journalLower.includes('aap')
  ) {
    badges.push('Practice Guideline');
  }
  
  // Leading Journal
  const leadingJournals = ['nejm', 'jama', 'lancet', 'bmj', 'nature', 'science', 'cell'];
  if (leadingJournals.some(j => journalLower.includes(j))) {
    badges.push('Leading Journal');
  }
  
  // Recent (last 3 years)
  const currentYear = new Date().getFullYear();
  const year = parseInt(ref.year);
  if (year >= currentYear - 3) {
    badges.push('Recent');
  }
  
  // Systematic Review / Meta-Analysis
  if (titleLower.includes('systematic review')) {
    badges.push('Systematic Review');
  }
  if (titleLower.includes('meta-analysis') || titleLower.includes('meta analysis')) {
    badges.push('Meta-Analysis');
  }
  
  return badges;
}
```

## Error Handling

### Citation Validation

```typescript
function validateCitations(
  segments: TextSegment[],
  references: ParsedReference[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check all citation numbers are in range
  segments.forEach(seg => {
    seg.citationNumbers.forEach(num => {
      if (num < 1 || num > references.length) {
        errors.push(`Citation [[${num}]] out of range (max: ${references.length})`);
      }
    });
  });
  
  // Check all references have valid URLs
  references.forEach(ref => {
    if (!ref.url || ref.url.includes('google.com/search')) {
      warnings.push(`Reference ${ref.number} has no valid URL`);
    }
  });
  
  return { errors, warnings, isValid: errors.length === 0 };
}
```

## Testing Strategy

### Unit Tests

**Location**: `lib/citation/__tests__/`

1. **Parser Tests**
   - Test citation marker extraction (all formats)
   - Test reference parsing (various formats)
   - Test URL construction (PMID, DOI, PMC)
   - Test quality badge determination

2. **Component Tests**
   - Test SourcesBadge rendering
   - Test HoverCard positioning
   - Test ReferenceItem formatting
   - Test author truncation ("et al.")

3. **Integration Tests**
   - Test citation-to-reference mapping
   - Test copy behavior (DOM preservation)
   - Test mode switching (color changes)

### Property-Based Tests

**Location**: `lib/citation/__tests__/citation.pbt.test.ts`

Use `fast-check` library for property-based testing:

```typescript
import fc from 'fast-check';

describe('Citation System Properties', () => {
  it('Property 1: Citation numbers always map to correct references', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 10 }), { minLength: 1, maxLength: 10 }),
        (citationNumbers) => {
          const references = generateMockReferences(Math.max(...citationNumbers));
          const mapping = buildCitationMapping(citationNumbers, references);
          
          // Every citation number should map to a reference with the same number
          citationNumbers.forEach(num => {
            const ref = mapping.get(num);
            expect(ref?.number).toBe(num);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 2: URL construction never produces Google search URLs', () => {
    fc.assert(
      fc.property(
        fc.record({
          pmid: fc.option(fc.string()),
          doi: fc.option(fc.string()),
          url: fc.option(fc.webUrl())
        }),
        (refData) => {
          const url = constructReferenceURL(refData);
          if (url) {
            expect(url).not.toContain('google.com/search');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Performance Considerations

### Optimization Strategies

1. **Memoization**
   - Memoize parsed references to avoid re-parsing
   - Memoize Sources badge data
   - Use React.memo for ReferenceItem components

2. **Lazy Loading**
   - Render hover cards only when opened
   - Lazy load reference list (IntersectionObserver)

3. **Virtual Scrolling**
   - Use virtual scrolling for reference lists > 50 items

4. **Debouncing**
   - Debounce hover card open/close (300ms delay)

## Accessibility

### ARIA Labels

```typescript
// Sources Badge
<button
  aria-label={`Sources badge with ${count} references`}
  aria-haspopup="true"
  aria-expanded={isOpen}
>
  Sources +{count}
</button>

// Hover Card
<div
  role="tooltip"
  aria-live="polite"
>
  {/* Reference content */}
</div>

// Reference Item
<div
  id={`ref-${number}`}
  role="article"
  aria-label={`Reference ${number}: ${title}`}
>
  {/* Reference content */}
</div>
```

### Keyboard Navigation

- Tab: Focus on Sources badges
- Enter/Space: Open/close hover card
- Escape: Close hover card
- Tab within hover card: Navigate links

## Summary

This design provides a complete, production-ready architecture for the inline citation system. Key features:

- **Clean separation of concerns**: Parser, renderer, and UI components
- **Shared component architecture**: Single implementation for both modes
- **Accurate mapping**: Citation numbers always match reference numbers
- **Copy-friendly**: DOM preservation for [[N]](URL) format
- **Accessible**: Full keyboard navigation and screen reader support
- **Testable**: Unit tests and property-based tests
- **Performant**: Memoization and lazy loading strategies

The implementation follows React best practices and integrates seamlessly with the existing MedGuidance AI codebase.
