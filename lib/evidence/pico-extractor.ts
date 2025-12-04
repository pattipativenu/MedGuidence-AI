/**
 * PICO Extractor - Structured Query Analysis for Evidence Brain
 * 
 * This module extracts PICO components from clinical queries and generates
 * disease_tags and decision_tags that drive all downstream modules:
 * - Query classification
 * - MeSH expansion
 * - Evidence ranking
 * - Sufficiency scoring
 * - Image selection
 * 
 * PICO Framework:
 * - P: Patient/Population
 * - I: Intervention
 * - C: Comparison
 * - O: Outcome
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { expandMedicalAbbreviations } from "./medical-abbreviations";

// ============================================================================
// INTERFACES
// ============================================================================

export interface PICOExtraction {
  patient: string;           // Patient/Population description
  intervention: string;      // Primary intervention being asked about
  comparison: string | null; // Comparison intervention if present
  outcome: string;           // Desired outcome
  condition: string;         // Primary medical condition
  
  // Generated tags
  disease_tags: string[];    // e.g., ['AF', 'CKD', 'GI_bleed']
  decision_tags: string[];   // e.g., ['anticoagulation', 'drug_choice', 'monitoring']
  primary_disease_tag: string;
  secondary_disease_tags: string[];
  primary_decision_tag: string;
  secondary_decision_tags: string[];
}

export interface SubQuery {
  query: string;           // ≤20 words
  category: 'core_decision' | 'complications' | 'duration_monitoring' | 'alternatives';
  target_evidence: 'guideline' | 'systematic_review' | 'trial' | 'cohort';
}

export interface QueryDecomposition {
  original_query: string;
  word_count: number;
  sub_queries: SubQuery[];
  should_decompose: boolean;
}

// ============================================================================
// TAG DEFINITIONS
// ============================================================================

/**
 * Disease tags - extracted from queries
 * Maps tag identifiers to their detection patterns
 */
export const DISEASE_TAGS: Record<string, string[]> = {
  // Cardiovascular
  'AF': ['atrial fibrillation', 'afib', 'a-fib', 'af', 'atrial flutter'],
  'CKD': ['chronic kidney disease', 'ckd', 'renal insufficiency', 'egfr', 'esrd', 'end-stage renal', 'dialysis', 'stage 4 ckd', 'stage 5 ckd'],
  'HYPERKALEMIA': ['hyperkalemia', 'hyperkalaemia', 'elevated potassium', 'high potassium', 'potassium', 'k+', 'serum potassium'],
  'HF': ['heart failure', 'hfref', 'hfpef', 'hfmref', 'chf', 'congestive heart failure', 'reduced ejection fraction', 'preserved ejection fraction', 'elderly hfpef', 'hfpef elderly', 'diastolic heart failure', 'heart failure preserved ef', 'elevated bnp', 'elevated b-type natriuretic peptide', 'elevated nt-probnp', 'bnp', 'b-type natriuretic peptide', 'nt-probnp', 'dyspnea', 'shortness of breath', 'acute dyspnea', 'acute decompensated', 'adhf', 'pulmonary edema', 'pulmonary congestion'],
  'CAD': ['coronary artery disease', 'cad', 'ischemic heart', 'coronary disease', 'mi', 'myocardial infarction', 'stemi', 'nstemi', 'acs', 'acute coronary syndrome'],
  'HTN': ['hypertension', 'high blood pressure', 'htn', 'elevated blood pressure'],
  'STROKE': ['stroke', 'cva', 'cerebrovascular accident', 'tia', 'transient ischemic'],
  'PCI': ['pci', 'percutaneous coronary intervention', 'stent', 'angioplasty', 'drug-eluting stent'],
  'AHRE': ['ahre', 'atrial high-rate episode', 'subclinical af', 'device-detected af'],
  
  // Infectious - Adult
  'CAP': ['community-acquired pneumonia', 'cap', 'pneumonia'],
  'SEPSIS': ['sepsis', 'septic shock', 'bacteremia', 'severe sepsis'],
  'HAP': ['hospital-acquired pneumonia', 'hap', 'vap', 'ventilator-associated'],
  
  // Infectious - Pediatric
  'VARICELLA': ['varicella', 'chickenpox', 'chicken pox', 'varicella zoster', 'vzv'],
  'CHICKENPOX': ['chickenpox', 'chicken pox', 'varicella'],
  'MEASLES': ['measles', 'rubeola', 'morbillivirus'],
  'MUMPS': ['mumps', 'parotitis'],
  'RUBELLA': ['rubella', 'german measles'],
  'PERTUSSIS': ['pertussis', 'whooping cough', 'bordetella'],
  'RSV': ['rsv', 'respiratory syncytial virus', 'bronchiolitis'],
  'CROUP': ['croup', 'laryngotracheobronchitis'],
  'HAND_FOOT_MOUTH': ['hand foot mouth', 'hfmd', 'coxsackievirus'],
  'SCARLET_FEVER': ['scarlet fever', 'scarlatina'],
  'FIFTH_DISEASE': ['fifth disease', 'erythema infectiosum', 'parvovirus b19'],
  'ROSEOLA': ['roseola', 'exanthem subitum', 'sixth disease'],
  
  // GI
  'GI_BLEED': ['gi bleed', 'gastrointestinal bleed', 'upper gi bleed', 'ugib', 'lower gi bleed', 'lgib', 'variceal bleed', 'non-variceal', 'duodenal ulcer', 'peptic ulcer'],
  
  // Metabolic
  'DIABETES': ['diabetes', 'dm', 't2dm', 't1dm', 'diabetic', 'type 2 diabetes', 'type 1 diabetes', 'hyperglycemia'],
  'GLP1': ['glp-1', 'glp1', 'semaglutide', 'dulaglutide', 'liraglutide', 'glp-1 ra', 'glp-1 receptor agonist', 'ozempic', 'trulicity', 'victoza'],
  
  // Hematologic
  'HBR': ['high bleeding risk', 'hbr', 'bleeding risk', 'major bleeding'],
  'VTE': ['vte', 'venous thromboembolism', 'dvt', 'deep vein thrombosis', 'pe', 'pulmonary embolism', 'cancer-associated thrombosis', 'cat', 'cancer vte', 'malignancy thrombosis'],
  'CANCER': ['cancer', 'malignancy', 'oncology', 'tumor', 'metastatic', 'pancreatic cancer', 'lung cancer', 'breast cancer', 'colon cancer'],
  'THROMBOCYTOPENIA': ['thrombocytopenia', 'low platelets', 'platelet count', 'plt', 'bleeding risk thrombocytopenia'],
  
  // Oncology - Specific Cancer Types
  'MELANOMA': ['melanoma', 'metastatic melanoma', 'cutaneous melanoma', 'skin cancer melanoma', 'malignant melanoma'],
  'LUNG_CANCER': ['lung cancer', 'nsclc', 'non-small cell lung cancer', 'sclc', 'small cell lung cancer', 'bronchogenic carcinoma'],
  'BREAST_CANCER': ['breast cancer', 'breast carcinoma', 'mammary carcinoma', 'her2 positive', 'triple negative breast'],
  'COLORECTAL_CANCER': ['colorectal cancer', 'colon cancer', 'rectal cancer', 'crc', 'bowel cancer'],
  'PROSTATE_CANCER': ['prostate cancer', 'prostate carcinoma', 'pca', 'castration resistant prostate'],
  'PANCREATIC_CANCER': ['pancreatic cancer', 'pancreatic adenocarcinoma', 'pdac'],
  'RENAL_CANCER': ['renal cell carcinoma', 'rcc', 'kidney cancer', 'renal cancer'],
  'OVARIAN_CANCER': ['ovarian cancer', 'ovarian carcinoma', 'epithelial ovarian cancer'],
  'LEUKEMIA': ['leukemia', 'leukaemia', 'aml', 'acute myeloid leukemia', 'all', 'acute lymphoblastic leukemia', 'cll', 'chronic lymphocytic leukemia', 'cml', 'chronic myeloid leukemia'],
  'LYMPHOMA': ['lymphoma', 'hodgkin lymphoma', 'non-hodgkin lymphoma', 'nhl', 'diffuse large b-cell lymphoma', 'dlbcl'],
  
  // Genetic Mutations
  'BRAF_MUTATION': ['braf mutation', 'braf v600e', 'braf v600k', 'braf mutant', 'braf positive'],
  'EGFR_MUTATION': ['egfr mutation', 'egfr mutant', 'egfr positive', 'epidermal growth factor receptor mutation'],
  'KRAS_MUTATION': ['kras mutation', 'kras mutant', 'kras positive'],
  'ALK_FUSION': ['alk fusion', 'alk positive', 'alk rearrangement'],
  'ROS1_FUSION': ['ros1 fusion', 'ros1 positive', 'ros1 rearrangement'],
  'PD_L1': ['pd-l1', 'pdl1', 'pd-l1 expression', 'pd-l1 positive'],
  
  // Orthopedic & Trauma
  'FRACTURE': ['fracture', 'fx', 'broken bone', 'tibial plateau', 'femoral', 'humeral', 'radial', 'ulnar', 'pelvic fracture', 'hip fracture', 'ankle fracture', 'wrist fracture', 'compression fracture', 'pathologic fracture'],
  'TIBIAL_PLATEAU_FX': ['tibial plateau fracture', 'tibial plateau fx', 'lateral tibial plateau', 'medial tibial plateau', 'bicondylar fracture', 'schatzker'],
  'TRAUMA': ['trauma', 'traumatic injury', 'blunt trauma', 'fall', 'motor vehicle', 'mvc', 'accident', 'injury'],
  'DISLOCATION': ['dislocation', 'dislocated', 'subluxation', 'shoulder dislocation', 'hip dislocation', 'knee dislocation', 'elbow dislocation'],
  'LIGAMENT_INJURY': ['ligament injury', 'acl tear', 'mcl tear', 'lcl tear', 'pcl tear', 'anterior cruciate', 'medial collateral', 'lateral collateral', 'posterior cruciate', 'ligament rupture'],
  'MENISCAL_TEAR': ['meniscal tear', 'meniscus tear', 'torn meniscus', 'medial meniscus', 'lateral meniscus'],
  'SPRAIN': ['sprain', 'ankle sprain', 'wrist sprain', 'knee sprain', 'ligamentous sprain'],
  'STRAIN': ['strain', 'muscle strain', 'pulled muscle', 'hamstring strain', 'quadriceps strain', 'calf strain'],
  'COMPARTMENT_SYNDROME': ['compartment syndrome', 'acute compartment syndrome', 'fasciotomy'],
  'OSTEOMYELITIS': ['osteomyelitis', 'bone infection', 'septic arthritis', 'joint infection'],
};

/**
 * Decision tags - extracted from queries
 * Maps tag identifiers to their detection patterns
 */
export const DECISION_TAGS: Record<string, string[]> = {
  'anticoagulation': ['anticoagulation', 'anticoagulant', 'warfarin', 'apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban', 'doac', 'noac', 'oac', 'blood thinner'],
  'antiplatelet': ['antiplatelet', 'aspirin', 'clopidogrel', 'ticagrelor', 'prasugrel', 'dapt', 'dual antiplatelet'],
  'drug_choice': ['which drug', 'preferred agent', 'first-line', 'drug of choice', 'optimal', 'best', 'recommended'],
  'duration': ['how long', 'duration', 'length of treatment', 'when to stop', 'continue', 'discontinue'],
  'de-escalation': ['de-escalation', 'step down', 'switch', 'transition', 'iv to oral', 'oral switch'],
  'monitoring': ['monitor', 'follow-up', 'surveillance', 'check', 'renal function', 'bleeding risk'],
  'dose': ['dose', 'dosing', 'mg', 'dosage', 'reduced dose', 'standard dose'],
  
  // Pediatric-specific decisions
  'antiviral': ['antiviral', 'acyclovir', 'oseltamivir', 'tamiflu', 'valacyclovir'],
  'symptom_control': ['symptom control', 'symptomatic', 'itch', 'itching', 'pruritus', 'fever control', 'pain relief', 'comfort care'],
  'isolation': ['isolation', 'quarantine', 'contagious', 'infectious period', 'transmission'],
  'return_to_school': ['return to school', 'school exclusion', 'when can return', 'back to school', 'daycare', 'school attendance'],
  'restart': ['restart', 'resume', 'reinitiate', 'when to restart'],
  'therapy': ['therapy', 'treatment', 'management', 'gdmt', 'guideline-directed', 'evidence-based approach', 'approach to managing', 'managing'],
  'add_on_therapy': ['add', 'adding', 'add-on', 'addition to', 'in addition', 'after sglt2', 'plus sglt2', 'with sglt2'],
  'LAAO': ['laao', 'left atrial appendage', 'watchman', 'appendage occlusion', 'non-pharmacologic'],
  'diagnosis': ['differential diagnosis', 'diagnosis', 'diagnostic approach', 'workup', 'evaluation', 'rule out', 'ddx'],
  
  // Oncology Treatment Decisions
  'immunotherapy': ['immunotherapy', 'immune checkpoint inhibitor', 'checkpoint inhibitor', 'pembrolizumab', 'nivolumab', 'ipilimumab', 'atezolizumab', 'durvalumab', 'pd-1 inhibitor', 'pd-l1 inhibitor', 'ctla-4 inhibitor'],
  'targeted_therapy': ['targeted therapy', 'targeted treatment', 'molecular targeted', 'braf inhibitor', 'mek inhibitor', 'egfr inhibitor', 'alk inhibitor', 'tyrosine kinase inhibitor', 'tki', 'dabrafenib', 'vemurafenib', 'trametinib', 'cobimetinib'],
  'chemotherapy': ['chemotherapy', 'chemo', 'cytotoxic', 'platinum-based', 'carboplatin', 'cisplatin', 'paclitaxel', 'docetaxel'],
  'radiation': ['radiation', 'radiotherapy', 'rt', 'sbrt', 'stereotactic', 'radiosurgery'],
  'surgery': ['surgery', 'surgical', 'resection', 'excision', 'operative'],
  'combination_therapy': ['combination', 'combined', 'plus', 'with', 'and', 'sequential', 'concurrent'],
  'first_line': ['first-line', 'first line', '1st line', 'initial', 'frontline', 'upfront'],
  'second_line': ['second-line', 'second line', '2nd line', 'subsequent', 'after progression'],
  'resistance': ['resistance', 'resistant', 'refractory', 'progression', 'failure'],
  'biomarker': ['biomarker', 'mutation', 'expression', 'status', 'testing', 'molecular'],
  
  // Orthopedic Treatment Decisions
  'orif': ['orif', 'open reduction internal fixation', 'surgical fixation', 'plate and screws', 'intramedullary nail'],
  'conservative_management': ['conservative', 'non-operative', 'non-surgical', 'immobilization', 'casting', 'splinting', 'bracing'],
  'ct_imaging': ['ct scan', 'computed tomography', 'ct imaging', 'ct to characterize', 'further imaging'],
  'ortho_consult': ['orthopedic consultation', 'orthopaedic consultation', 'ortho consult', 'surgical consultation', 'urgent consultation'],
  'weight_bearing': ['weight bearing', 'non-weight bearing', 'partial weight bearing', 'full weight bearing', 'nwb', 'pwb', 'fwb'],
  'physical_therapy': ['physical therapy', 'pt', 'rehabilitation', 'rehab', 'range of motion', 'rom'],
};

// ============================================================================
// TAG EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extract disease tags from a query using pattern matching
 */
export function extractDiseaseTags(query: string): string[] {
  // Expand abbreviations for better matching
  const expandedQuery = expandMedicalAbbreviations(query);
  const queryLower = expandedQuery.toLowerCase();
  const tags: string[] = [];
  
  for (const [tag, patterns] of Object.entries(DISEASE_TAGS)) {
    for (const pattern of patterns) {
      if (queryLower.includes(pattern.toLowerCase())) {
        tags.push(tag);
        break; // Only add each tag once
      }
    }
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Extract decision tags from a query using pattern matching
 */
export function extractDecisionTags(query: string): string[] {
  // Expand abbreviations for better matching
  const expandedQuery = expandMedicalAbbreviations(query);
  const queryLower = expandedQuery.toLowerCase();
  const tags: string[] = [];
  
  for (const [tag, patterns] of Object.entries(DECISION_TAGS)) {
    for (const pattern of patterns) {
      if (queryLower.includes(pattern.toLowerCase())) {
        tags.push(tag);
        break; // Only add each tag once
      }
    }
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Determine primary and secondary tags based on query structure
 * Primary tag is typically the first mentioned or most prominent
 */
export function prioritizeTags(
  tags: string[], 
  query: string
): { primary: string; secondary: string[] } {
  if (tags.length === 0) {
    return { primary: '', secondary: [] };
  }
  
  if (tags.length === 1) {
    return { primary: tags[0], secondary: [] };
  }
  
  // Find which tag appears first in the query
  const queryLower = query.toLowerCase();
  let earliestIndex = Infinity;
  let primaryTag = tags[0];
  
  for (const tag of tags) {
    const patterns = DISEASE_TAGS[tag] || DECISION_TAGS[tag] || [];
    for (const pattern of patterns) {
      const index = queryLower.indexOf(pattern.toLowerCase());
      if (index !== -1 && index < earliestIndex) {
        earliestIndex = index;
        primaryTag = tag;
      }
    }
  }
  
  const secondary = tags.filter(t => t !== primaryTag);
  return { primary: primaryTag, secondary };
}

/**
 * Generate tags from a query using pattern matching (fast, synchronous)
 */
export function generateTagsFromQuery(query: string): {
  disease_tags: string[];
  decision_tags: string[];
  primary_disease_tag: string;
  secondary_disease_tags: string[];
  primary_decision_tag: string;
  secondary_decision_tags: string[];
} {
  const disease_tags = extractDiseaseTags(query);
  const decision_tags = extractDecisionTags(query);
  
  const diseasePriority = prioritizeTags(disease_tags, query);
  const decisionPriority = prioritizeTags(decision_tags, query);
  
  return {
    disease_tags,
    decision_tags,
    primary_disease_tag: diseasePriority.primary,
    secondary_disease_tags: diseasePriority.secondary,
    primary_decision_tag: decisionPriority.primary,
    secondary_decision_tags: decisionPriority.secondary,
  };
}

// ============================================================================
// PICO EXTRACTION (AI-POWERED)
// ============================================================================

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Extract PICO components from a clinical query using Gemini
 * Falls back to pattern-based extraction if AI is unavailable
 */
export async function extractPICO(query: string): Promise<PICOExtraction> {
  // Always extract tags using pattern matching (fast and reliable)
  const tags = generateTagsFromQuery(query);
  
  // If no API key, use pattern-based extraction only
  if (!genAI) {
    console.log("⚠️  No Gemini API key, using pattern-based PICO extraction");
    return {
      patient: extractPatientFromQuery(query),
      intervention: extractInterventionFromQuery(query),
      comparison: extractComparisonFromQuery(query),
      outcome: extractOutcomeFromQuery(query),
      condition: tags.primary_disease_tag || 'unknown',
      ...tags,
    };
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `Extract PICO components from this clinical query. Return JSON only.

Query: "${query}"

Extract:
- patient: Brief description of patient/population (age, conditions)
- intervention: Primary intervention being asked about
- comparison: Comparison intervention if mentioned (null if none)
- outcome: Desired clinical outcome
- condition: Primary medical condition (e.g., "atrial fibrillation", "pneumonia")

Return ONLY valid JSON:
{"patient": "...", "intervention": "...", "comparison": null or "...", "outcome": "...", "condition": "..."}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        patient: parsed.patient || extractPatientFromQuery(query),
        intervention: parsed.intervention || extractInterventionFromQuery(query),
        comparison: parsed.comparison || null,
        outcome: parsed.outcome || extractOutcomeFromQuery(query),
        condition: parsed.condition || tags.primary_disease_tag || 'unknown',
        ...tags,
      };
    }
  } catch (error: any) {
    console.error("PICO extraction error:", error.message);
  }
  
  // Fallback to pattern-based extraction
  return {
    patient: extractPatientFromQuery(query),
    intervention: extractInterventionFromQuery(query),
    comparison: extractComparisonFromQuery(query),
    outcome: extractOutcomeFromQuery(query),
    condition: tags.primary_disease_tag || 'unknown',
    ...tags,
  };
}

// ============================================================================
// PATTERN-BASED EXTRACTION HELPERS
// ============================================================================

function extractPatientFromQuery(query: string): string {
  // Look for age and demographic patterns
  const ageMatch = query.match(/(\d+)[\s-]*(year|yr)[\s-]*(old)?/i);
  const genderMatch = query.match(/\b(man|woman|male|female|patient)\b/i);
  
  let patient = '';
  if (ageMatch) patient += `${ageMatch[1]}-year-old `;
  if (genderMatch) patient += genderMatch[1].toLowerCase();
  
  // Add conditions
  const tags = extractDiseaseTags(query);
  if (tags.length > 0) {
    patient += ` with ${tags.join(', ')}`;
  }
  
  return patient.trim() || 'adult patient';
}

function extractInterventionFromQuery(query: string): string {
  const decisionTags = extractDecisionTags(query);
  if (decisionTags.length > 0) {
    return decisionTags[0].replace(/_/g, ' ');
  }
  return 'treatment';
}

function extractComparisonFromQuery(query: string): string | null {
  const queryLower = query.toLowerCase();
  
  // Look for comparison patterns
  if (queryLower.includes(' vs ') || queryLower.includes(' versus ')) {
    const match = query.match(/(\w+)\s+(?:vs|versus)\s+(\w+)/i);
    if (match) return match[2];
  }
  
  if (queryLower.includes(' or ')) {
    const match = query.match(/(\w+)\s+or\s+(\w+)/i);
    if (match) return match[2];
  }
  
  return null;
}

function extractOutcomeFromQuery(query: string): string {
  const queryLower = query.toLowerCase();
  
  // Common outcome patterns
  if (queryLower.includes('stroke prevention')) return 'stroke prevention';
  if (queryLower.includes('bleeding risk')) return 'minimize bleeding risk';
  if (queryLower.includes('mortality')) return 'reduce mortality';
  if (queryLower.includes('survival')) return 'improve survival';
  if (queryLower.includes('cure')) return 'cure infection';
  if (queryLower.includes('resolution')) return 'symptom resolution';
  
  return 'optimal clinical outcome';
}

// ============================================================================
// QUERY DECOMPOSITION
// ============================================================================

/**
 * Count words in a query
 */
export function countWords(query: string): number {
  return query.trim().split(/\s+/).length;
}

/**
 * Decompose a long clinical query into focused sub-queries
 * Only decomposes queries >100 words
 */
export async function decomposeQuery(
  query: string, 
  pico: PICOExtraction
): Promise<QueryDecomposition> {
  const wordCount = countWords(query);
  const shouldDecompose = wordCount > 100;
  
  if (!shouldDecompose) {
    return {
      original_query: query,
      word_count: wordCount,
      sub_queries: [],
      should_decompose: false,
    };
  }
  
  console.log(`📋 Query has ${wordCount} words, decomposing into sub-queries...`);
  
  // Generate sub-queries based on PICO and tags
  const subQueries: SubQuery[] = [];
  
  // 1. Core management decision
  const coreQuery = buildCoreDecisionQuery(pico);
  if (coreQuery) {
    subQueries.push({
      query: coreQuery,
      category: 'core_decision',
      target_evidence: 'guideline',
    });
  }
  
  // 2. Complications/comorbidities
  const complicationsQuery = buildComplicationsQuery(pico);
  if (complicationsQuery) {
    subQueries.push({
      query: complicationsQuery,
      category: 'complications',
      target_evidence: 'systematic_review',
    });
  }
  
  // 3. Duration/monitoring
  const monitoringQuery = buildMonitoringQuery(pico);
  if (monitoringQuery) {
    subQueries.push({
      query: monitoringQuery,
      category: 'duration_monitoring',
      target_evidence: 'trial',
    });
  }
  
  // 4. Non-pharmacologic alternatives
  const alternativesQuery = buildAlternativesQuery(pico);
  if (alternativesQuery) {
    subQueries.push({
      query: alternativesQuery,
      category: 'alternatives',
      target_evidence: 'cohort',
    });
  }
  
  // Log sub-queries
  subQueries.forEach((sq, i) => {
    console.log(`   ${i + 1}. [${sq.category}] ${sq.query}`);
  });
  
  return {
    original_query: query,
    word_count: wordCount,
    sub_queries: subQueries,
    should_decompose: true,
  };
}

/**
 * Build core decision sub-query (≤20 words)
 */
function buildCoreDecisionQuery(pico: PICOExtraction): string | null {
  const parts: string[] = [];
  
  // Add primary disease
  if (pico.primary_disease_tag) {
    const diseaseTerms = DISEASE_TAGS[pico.primary_disease_tag];
    if (diseaseTerms && diseaseTerms.length > 0) {
      parts.push(diseaseTerms[0]); // Use first (most common) term
    }
  }
  
  // Add secondary disease if relevant (e.g., CKD)
  if (pico.secondary_disease_tags.length > 0) {
    const secondaryTerms = DISEASE_TAGS[pico.secondary_disease_tags[0]];
    if (secondaryTerms && secondaryTerms.length > 0) {
      parts.push(secondaryTerms[0]);
    }
  }
  
  // Add primary decision
  if (pico.primary_decision_tag) {
    const decisionTerms = DECISION_TAGS[pico.primary_decision_tag];
    if (decisionTerms && decisionTerms.length > 0) {
      parts.push(decisionTerms[0]);
    }
  }
  
  if (parts.length === 0) return null;
  
  return `${parts.join(' ')} guideline recommendations`.slice(0, 150);
}

/**
 * Build complications/comorbidities sub-query (≤20 words)
 */
function buildComplicationsQuery(pico: PICOExtraction): string | null {
  // Look for comorbidity combinations
  const hasAF = pico.disease_tags.includes('AF');
  const hasCKD = pico.disease_tags.includes('CKD');
  const hasGIBleed = pico.disease_tags.includes('GI_BLEED');
  const hasHBR = pico.disease_tags.includes('HBR');
  
  if (hasAF && hasCKD) {
    return 'atrial fibrillation advanced chronic kidney disease anticoagulation outcomes';
  }
  
  if (hasAF && hasGIBleed) {
    return 'atrial fibrillation gastrointestinal bleeding restart anticoagulation timing';
  }
  
  if (hasAF && hasHBR) {
    return 'atrial fibrillation high bleeding risk anticoagulation strategy';
  }
  
  // Generic comorbidity query
  if (pico.secondary_disease_tags.length > 0) {
    const primary = DISEASE_TAGS[pico.primary_disease_tag]?.[0] || pico.condition;
    const secondary = DISEASE_TAGS[pico.secondary_disease_tags[0]]?.[0] || '';
    return `${primary} ${secondary} management outcomes`.trim();
  }
  
  return null;
}

/**
 * Build monitoring/duration sub-query (≤20 words)
 */
function buildMonitoringQuery(pico: PICOExtraction): string | null {
  const hasMonitoring = pico.decision_tags.includes('monitoring');
  const hasDuration = pico.decision_tags.includes('duration');
  const hasDose = pico.decision_tags.includes('dose');
  
  if (!hasMonitoring && !hasDuration && !hasDose) return null;
  
  const disease = DISEASE_TAGS[pico.primary_disease_tag]?.[0] || pico.condition;
  
  if (hasMonitoring) {
    return `${disease} renal function bleeding risk monitoring frequency`;
  }
  
  if (hasDuration) {
    return `${disease} treatment duration optimal length`;
  }
  
  if (hasDose) {
    const hasCKD = pico.disease_tags.includes('CKD');
    if (hasCKD) {
      return `${disease} dosing chronic kidney disease renal adjustment`;
    }
    return `${disease} dosing recommendations`;
  }
  
  return null;
}

/**
 * Build alternatives sub-query (≤20 words)
 */
function buildAlternativesQuery(pico: PICOExtraction): string | null {
  const hasLAAO = pico.decision_tags.includes('LAAO');
  const hasAF = pico.disease_tags.includes('AF');
  const hasCKD = pico.disease_tags.includes('CKD');
  
  if (hasLAAO || (hasAF && hasCKD)) {
    return 'left atrial appendage occlusion advanced chronic kidney disease outcomes';
  }
  
  // Check for comparison in query
  if (pico.comparison) {
    const disease = DISEASE_TAGS[pico.primary_disease_tag]?.[0] || pico.condition;
    return `${disease} ${pico.intervention} versus ${pico.comparison} comparison`;
  }
  
  return null;
}
