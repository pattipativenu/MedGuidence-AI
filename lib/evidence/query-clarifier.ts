/**
 * Query Clarifier - Structured Query Understanding for Evidence Brain
 * 
 * This module transforms fuzzy natural language queries into structured
 * ClarifiedQuery objects that drive all downstream evidence retrieval.
 * 
 * WHY THIS EXISTS:
 * - Raw text → tags is noisy (extracts CAD, VTE from unrelated queries)
 * - No explicit decision_type means classification rules compete equally
 * - guideline_bodies aren't extracted, so "KDIGO" is just text
 * - No structured P/I/C/O means PICO extractor has to guess
 * 
 * WHAT IT DOES:
 * - Uses LLM to extract structured clinical question components
 * - Identifies decision type (diagnosis, treatment, guideline, prognosis, workup)
 * - Extracts guideline bodies (KDIGO, ACC/AHA, ESC, etc.)
 * - Identifies key drugs and biomarkers
 * - Validates output against known entities
 * 
 * INTEGRATION POINT:
 * - Called after abbreviation expansion (Step 2)
 * - Before PICO tag extraction (Step 3)
 * - Output used by: classifier, MeSH mapper, sufficiency scorer
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// ============================================================================
// INTERFACES
// ============================================================================

export interface ClarifiedQuery {
  clinical_question: string;          // Single focused question (1 sentence)
  population: string;                 // P: Patient/Population
  intervention_or_index: string;      // I: Intervention or Index condition
  comparator: string | null;          // C: Comparison (optional)
  outcomes: string[];                 // O: Outcomes of interest
  decision_type: 'diagnosis' | 'treatment' | 'guideline' | 'prognosis' | 'workup';
  guideline_bodies: string[];         // e.g., ['KDIGO', 'ACC/AHA', 'ESC']
  key_drugs: string[];                // e.g., ['patiromer', 'apixaban']
  key_biomarkers: string[];           // e.g., ['potassium', 'eGFR', 'troponin']
  has_medical_observations: boolean;  // Does query contain vitals/labs/imaging?
  timeframe?: string;                 // e.g., '2024', 'recent', 'last 5 years'
  confidence: number;                 // 0-1: LLM confidence in extraction
}

export interface QueryClarificationResult {
  clarified: ClarifiedQuery;
  validation_warnings: string[];      // Issues found during validation
  fallback_used: boolean;             // True if pattern-based fallback was used
}

// ============================================================================
// KNOWN ENTITIES FOR VALIDATION
// ============================================================================

/**
 * Known guideline bodies - used for validation
 * Add new organizations as they're encountered
 */
const KNOWN_GUIDELINE_BODIES = [
  // Nephrology
  'KDIGO', 'KDOQI', 'NKF',
  // Cardiology
  'ACC/AHA', 'ACC', 'AHA', 'ESC', 'CCS',
  // Infectious Disease
  'IDSA', 'ESCMID', 'SHEA',
  // Endocrinology
  'ADA', 'AACE', 'Endocrine Society',
  // Pulmonary
  'ATS', 'ERS', 'CHEST',
  // Oncology
  'NCCN', 'ASCO', 'ESMO',
  // Hematology
  'ASH', 'ISTH',
  // Gastroenterology
  'ACG', 'AGA', 'ASGE',
  // Neurology
  'AAN', 'EAN',
  // Pediatrics
  'AAP',
  // International
  'WHO', 'CDC', 'NICE', 'SIGN',
  // Specialty
  'Surviving Sepsis Campaign', 'GOLD', 'GINA',
];

/**
 * Decision type keywords for pattern-based fallback
 */
const DECISION_TYPE_PATTERNS: Record<string, string[]> = {
  'guideline': ['guideline', 'recommendation', 'consensus', 'statement', 'standards of care', 'practice guideline'],
  'diagnosis': ['diagnosis', 'diagnostic', 'differential', 'workup', 'evaluation', 'rule out', 'ddx'],
  'treatment': ['treatment', 'therapy', 'management', 'drug', 'medication', 'intervention', 'approach to managing'],
  'prognosis': ['prognosis', 'outcome', 'survival', 'mortality', 'risk', 'prediction'],
  'workup': ['workup', 'evaluation', 'assessment', 'investigation', 'testing', 'screening'],
};

// ============================================================================
// QUERY CLARIFICATION FUNCTIONS
// ============================================================================

/**
 * Clarify a clinical query using LLM extraction
 * 
 * @param query - Raw user query (after abbreviation expansion)
 * @param expandedQuery - Query with abbreviations expanded
 * @param disease_tags - Preliminary disease tags (optional, for context)
 * @param decision_tags - Preliminary decision tags (optional, for context)
 * @param observations - Medical observations (optional, from observation extractor)
 * @returns Structured ClarifiedQuery object
 */
export async function clarifyQuery(
  query: string,
  expandedQuery: string,
  disease_tags?: string[],
  decision_tags?: string[],
  observations?: any // MedicalObservationSummary from observation-extractor
): Promise<QueryClarificationResult> {
  console.log('🔍 Query Clarification: Starting structured extraction...');
  
  try {
    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  No GEMINI_API_KEY - using pattern-based fallback');
      return patternBasedClarification(query, expandedQuery, disease_tags, decision_tags, observations);
    }
    
    // Use LLM to extract structured query
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.1, // Low temperature for structured extraction
        maxOutputTokens: 1000,
      }
    });
    
    const prompt = buildClarificationPrompt(query, expandedQuery, disease_tags, decision_tags);
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse JSON response
    const parsed = parseAndValidateClarification(response, query);
    
    console.log('✅ Query Clarification: Structured extraction complete');
    console.log(`   Decision type: ${parsed.clarified.decision_type}`);
    console.log(`   Guideline bodies: ${parsed.clarified.guideline_bodies.join(', ') || 'none'}`);
    console.log(`   Key drugs: ${parsed.clarified.key_drugs.join(', ') || 'none'}`);
    console.log(`   Confidence: ${Math.round(parsed.clarified.confidence * 100)}%`);
    
    return parsed;
    
  } catch (error: any) {
    console.error('❌ Query Clarification failed:', error.message);
    console.log('⚠️  Falling back to pattern-based extraction');
    return patternBasedClarification(query, expandedQuery, disease_tags, decision_tags);
  }
}

/**
 * Build prompt for LLM query clarification
 */
function buildClarificationPrompt(
  query: string,
  expandedQuery: string,
  disease_tags?: string[],
  decision_tags?: string[]
): string {
  return `You are a medical query analyzer. Extract structured information from this clinical query.

**Original Query:**
${query}

**Expanded Query (abbreviations expanded):**
${expandedQuery}

${disease_tags && disease_tags.length > 0 ? `**Preliminary Disease Tags:** ${disease_tags.join(', ')}` : ''}
${decision_tags && decision_tags.length > 0 ? `**Preliminary Decision Tags:** ${decision_tags.join(', ')}` : ''}

**Task:** Extract the following structured information and return ONLY valid JSON:

{
  "clinical_question": "Single focused clinical question (1 sentence)",
  "population": "Patient population (P in PICO)",
  "intervention_or_index": "Intervention or index condition (I in PICO)",
  "comparator": "Comparison intervention if present, otherwise null",
  "outcomes": ["List of outcomes of interest"],
  "decision_type": "One of: diagnosis, treatment, guideline, prognosis, workup",
  "guideline_bodies": ["List of guideline organizations mentioned: KDIGO, ACC/AHA, ESC, IDSA, ADA, WHO, CDC, NICE, etc."],
  "key_drugs": ["List of specific drugs mentioned"],
  "key_biomarkers": ["List of biomarkers/lab tests mentioned: potassium, eGFR, troponin, BNP, etc."],
  "has_medical_observations": false,
  "timeframe": "Year or time period if mentioned, otherwise null",
  "confidence": 0.95
}

**Rules:**
1. decision_type:
   - "guideline" if asking about guidelines, recommendations, or standards
   - "treatment" if asking about therapy, management, or drugs
   - "diagnosis" if asking about diagnosis, differential, or workup
   - "prognosis" if asking about outcomes, survival, or risk
   - "workup" if asking about evaluation, testing, or screening

2. guideline_bodies: Extract ONLY if explicitly mentioned (KDIGO, ACC/AHA, ESC, IDSA, ADA, WHO, CDC, NICE, AAP, ATS, NCCN, etc.)

3. key_drugs: Extract specific drug names (generic or brand), not drug classes

4. key_biomarkers: Extract lab tests, biomarkers, vital signs mentioned

5. has_medical_observations: Set to true ONLY if query contains specific values (e.g., "K+ 6.2", "BP 90/50", "eGFR 25")

6. confidence: Your confidence in the extraction (0.0-1.0)

Return ONLY the JSON object, no other text.`;
}

/**
 * Parse and validate LLM response
 */
function parseAndValidateClarification(
  response: string,
  originalQuery: string
): QueryClarificationResult {
  const warnings: string[] = [];
  
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    const parsed = JSON.parse(jsonText) as ClarifiedQuery;
    
    // Validate decision_type
    const validDecisionTypes = ['diagnosis', 'treatment', 'guideline', 'prognosis', 'workup'];
    if (!validDecisionTypes.includes(parsed.decision_type)) {
      warnings.push(`Invalid decision_type: ${parsed.decision_type}, defaulting to 'treatment'`);
      parsed.decision_type = 'treatment';
    }
    
    // Validate guideline_bodies against known list
    if (parsed.guideline_bodies && parsed.guideline_bodies.length > 0) {
      const validated = parsed.guideline_bodies.filter(body => {
        const isKnown = KNOWN_GUIDELINE_BODIES.some(known => 
          body.toUpperCase().includes(known.toUpperCase()) ||
          known.toUpperCase().includes(body.toUpperCase())
        );
        if (!isKnown) {
          warnings.push(`Unknown guideline body: ${body} (keeping anyway)`);
        }
        return true; // Keep all, just warn
      });
      parsed.guideline_bodies = validated;
    }
    
    // Ensure arrays are arrays
    if (!Array.isArray(parsed.outcomes)) parsed.outcomes = [];
    if (!Array.isArray(parsed.guideline_bodies)) parsed.guideline_bodies = [];
    if (!Array.isArray(parsed.key_drugs)) parsed.key_drugs = [];
    if (!Array.isArray(parsed.key_biomarkers)) parsed.key_biomarkers = [];
    
    // Ensure confidence is valid
    if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
      parsed.confidence = 0.7; // Default moderate confidence
    }
    
    return {
      clarified: parsed,
      validation_warnings: warnings,
      fallback_used: false,
    };
    
  } catch (error: any) {
    console.error('❌ Failed to parse LLM response:', error.message);
    throw error; // Will trigger pattern-based fallback
  }
}

/**
 * Pattern-based fallback when LLM is unavailable or fails
 */
function patternBasedClarification(
  query: string,
  expandedQuery: string,
  disease_tags?: string[],
  decision_tags?: string[],
  observations?: any
): QueryClarificationResult {
  const lowerQuery = query.toLowerCase();
  const lowerExpanded = expandedQuery.toLowerCase();
  
  // Detect decision type
  let decision_type: ClarifiedQuery['decision_type'] = 'treatment'; // default
  for (const [type, patterns] of Object.entries(DECISION_TYPE_PATTERNS)) {
    if (patterns.some(pattern => lowerQuery.includes(pattern) || lowerExpanded.includes(pattern))) {
      decision_type = type as ClarifiedQuery['decision_type'];
      break;
    }
  }
  
  // Extract guideline bodies
  const guideline_bodies: string[] = [];
  for (const body of KNOWN_GUIDELINE_BODIES) {
    if (lowerQuery.includes(body.toLowerCase()) || lowerExpanded.includes(body.toLowerCase())) {
      guideline_bodies.push(body);
    }
  }
  
  // Extract timeframe
  const yearMatch = query.match(/\b(20\d{2})\b/);
  const timeframe = yearMatch ? yearMatch[1] : undefined;
  
  // Extract key biomarkers from observations if available
  const key_biomarkers: string[] = [];
  if (observations?.labs) {
    key_biomarkers.push(...observations.labs.map((l: any) => l.test));
  }
  
  // Build clarified query
  const clarified: ClarifiedQuery = {
    clinical_question: query,
    population: disease_tags?.join(', ') || 'patients',
    intervention_or_index: decision_tags?.join(', ') || 'management',
    comparator: null,
    outcomes: [],
    decision_type,
    guideline_bodies,
    key_drugs: [],
    key_biomarkers: [...new Set(key_biomarkers)], // Deduplicate
    has_medical_observations: observations?.has_observations || false,
    timeframe,
    confidence: 0.5, // Lower confidence for pattern-based
  };
  
  return {
    clarified,
    validation_warnings: ['Pattern-based fallback used (no LLM available)'],
    fallback_used: true,
  };
}

/**
 * Quick check if a query is a guideline query
 * Used for fast path optimization
 */
export function isGuidelineQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return DECISION_TYPE_PATTERNS['guideline'].some(pattern => lowerQuery.includes(pattern));
}

/**
 * Extract guideline bodies from query (fast pattern-based)
 * Used when full clarification isn't needed
 */
export function extractGuidelineBodies(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const bodies: string[] = [];
  
  for (const body of KNOWN_GUIDELINE_BODIES) {
    if (lowerQuery.includes(body.toLowerCase())) {
      bodies.push(body);
    }
  }
  
  return bodies;
}
