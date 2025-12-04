/**
 * Smart Image Query Generator using Gemini
 * 
 * Instead of trying to verify every image with vision (which is slow and often fails),
 * we use Gemini to generate the OPTIMAL search query for finding relevant medical images.
 * 
 * This approach:
 * 1. Analyzes the user's medical query
 * 2. Generates 2-3 highly targeted image search queries
 * 3. Specifies what type of image would be most helpful
 * 4. Returns queries that are more likely to find relevant images
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Use GEMINI_API_KEY (same as lib/gemini.ts)
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export interface SmartImageQuery {
  searchQuery: string;
  imageType: 'anatomy' | 'pathology' | 'mechanism' | 'diagram' | 'infographic' | 'chart';
  priority: number;
  rationale: string;
}

/**
 * Configuration for tag-based image selection
 */
export interface TagBasedImageConfig {
  disease_tags: string[];
  decision_tags: string[];
  has_imaging_modality: boolean;
  is_decision_query: boolean;
}

/**
 * Determine if images should be shown based on query type
 * DOCTOR MODE PRINCIPLE: Images should add clinical value, not decoration
 * Most treatment/management questions are best answered with text alone
 */
export function shouldShowImages(config: TagBasedImageConfig): boolean {
  // If query has an imaging modality (CT, MRI, X-ray, etc.), always show images
  if (config.has_imaging_modality) {
    return true;
  }
  
  // For Doctor Mode, be selective about images:
  // - Treatment questions (drug choice, first-line therapy) → TEXT ONLY
  //   Rationale: Drug classes, doses, thresholds are clearer in text
  // - Diagnostic questions without imaging → TEXT ONLY
  //   Rationale: Diagnostic criteria are clearer in bullet points
  // - Management questions (when to start, duration) → TEXT ONLY
  //   Rationale: Guidelines and thresholds are clearer in text
  
  // Only show images when they add unique clinical value:
  // - Anatomy/pathology questions → SHOW (visual understanding needed)
  // - "What does X look like?" → SHOW (explicitly visual)
  // - Mechanism questions → SHOW (diagrams help understanding)
  // - Complex algorithms → SHOW (flowcharts can help)
  
  // For decision queries (treatment, management), default to NO images
  const decisionTags = ['drug_choice', 'therapy', 'anticoagulation', 'duration', 'monitoring'];
  const isDecisionQuery = config.decision_tags.some(tag => 
    decisionTags.some(dt => tag.toLowerCase().includes(dt.toLowerCase()))
  );
  
  if (isDecisionQuery) {
    return false; // Text is more efficient for clinicians
  }
  
  // Default: Show images only for anatomy, pathology, mechanism questions
  return true;
}

/**
 * Use Gemini to generate optimal image search queries for a medical question
 */
export async function generateSmartImageQueries(
  userQuery: string,
  mode: 'doctor' | 'general' = 'doctor'
): Promise<SmartImageQuery[]> {
  // Skip AI generation if no API key
  if (!apiKey) {
    console.log("⚠️  No Gemini API key found, using default query generation");
    return getDefaultQueries(userQuery, mode);
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `You are a medical image search expert. Given a medical question, generate 2-3 optimal Google Image search queries to find relevant, educational medical images.

**User's Medical Question:**
"${userQuery}"

**Mode:** ${mode === 'doctor' ? 'Doctor Mode (for medical professionals - prefer anatomical diagrams, pathophysiology, clinical images)' : 'General Mode (for patients - prefer simple infographics, easy-to-understand diagrams)'}

**Your Task:**
Generate search queries that will find images that DIRECTLY help answer this question.

**CRITICAL PRINCIPLE FOR DOCTOR MODE:**
Images should add clinical value that text cannot provide. Most treatment/management questions are best answered with text alone.

**When to generate image queries (Doctor Mode):**
1. ✅ Anatomy/pathology questions - "What does X look like?"
2. ✅ Mechanism questions - "How does X work?"
3. ✅ Visual diagnosis - "Appearance of X condition"
4. ✅ Imaging interpretation - "CT findings in X"
5. ❌ Treatment questions - Drug classes, doses, thresholds (TEXT ONLY)
6. ❌ Management questions - When to start, duration (TEXT ONLY)
7. ❌ Diagnostic criteria - Bullet points are clearer (TEXT ONLY)

**Rules for image queries:**
1. Be SPECIFIC - don't search for generic terms
2. For ANATOMY questions, search for "anatomy diagram", "anatomical structure"
3. For PATHOLOGY questions, search for "pathology", "histology", "gross appearance"
4. For MECHANISM questions, search for "mechanism of action", "pathophysiology diagram"
5. Avoid stock photos, generic heart images, or decorative content
6. Avoid overly busy infographics that distract from key information
7. NEVER include ".gif" or ".svg" in search terms
8. Prefer PNG and JPG images

**Response Format (JSON array):**
[
  {
    "searchQuery": "specific search query for Google Images",
    "imageType": "anatomy|pathology|mechanism|diagram|infographic|chart",
    "priority": 1,
    "rationale": "why this image helps answer the question"
  }
]

**Examples:**

Question: "What is first-line treatment for hypertension?"
Response: NO IMAGES NEEDED
Rationale: Drug classes (thiazide, CCB, ACE-I, ARB), doses, and BP thresholds are clearer in text

Question: "When to start anticoagulation in atrial fibrillation?"
Response: NO IMAGES NEEDED
Rationale: CHA2DS2-VASc criteria and thresholds are clearer in bullet points

Question: "How does metformin work in diabetes?"
Good queries:
- "metformin mechanism of action diagram" (mechanism)
- "glucose metabolism liver muscle diagram" (anatomy)
Rationale: Mechanism diagrams add value that text cannot provide

Question: "What does acute appendicitis look like on CT?"
Good queries:
- "acute appendicitis CT findings radiology" (pathology)
- "appendix inflammation CT scan" (pathology)
Rationale: Visual diagnosis requires actual images

Question: "Anatomy of the brachial plexus?"
Good queries:
- "brachial plexus anatomy diagram nerves" (anatomy)
- "brachial plexus nerve roots branches" (anatomy)
Rationale: Anatomical relationships are best shown visually

Now generate queries for the user's question:`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Failed to parse smart query response");
      return getDefaultQueries(userQuery, mode);
    }
    
    const queries: SmartImageQuery[] = JSON.parse(jsonMatch[0]);
    
    // Validate and clean queries
    return queries
      .filter(q => q.searchQuery && q.searchQuery.length > 5)
      .map(q => ({
        ...q,
        // Ensure no GIF/SVG in search
        searchQuery: q.searchQuery.replace(/\.gif|\.svg/gi, '').trim(),
      }))
      .slice(0, 3); // Max 3 queries
      
  } catch (error: any) {
    console.error("Smart query generation error:", error.message);
    return getDefaultQueries(userQuery, mode);
  }
}

/**
 * Fallback: Generate default queries based on keyword extraction
 */
function getDefaultQueries(query: string, mode: 'doctor' | 'general'): SmartImageQuery[] {
  const queryLower = query.toLowerCase();
  const queries: SmartImageQuery[] = [];
  
  // Extract key medical terms
  const medicalTerms: Record<string, string[]> = {
    // Conditions
    'giardia': ['giardia intestinal infection diagram', 'intestinal malabsorption pathophysiology'],
    'diabetes': ['diabetes pathophysiology diagram', 'glucose metabolism diagram'],
    'heart failure': ['heart failure pathophysiology diagram', 'cardiac anatomy labeled'],
    'hypertension': ['hypertension pathophysiology diagram', 'blood pressure regulation'],
    'stroke': ['stroke pathophysiology brain diagram', 'cerebral circulation anatomy'],
    'asthma': ['asthma pathophysiology airway diagram', 'bronchial anatomy'],
    'copd': ['COPD lung pathology diagram', 'emphysema alveoli damage'],
    
    // Dietary/Nutrition
    'dietary': ['therapeutic diet nutrition diagram', 'intestinal absorption nutrients'],
    'diet': ['medical nutrition therapy diagram', 'digestive system absorption'],
    'nutrition': ['nutrient absorption intestine diagram', 'malnutrition effects body'],
    'fodmap': ['low FODMAP diet food chart', 'IBS dietary management'],
    
    // Post-infectious
    'post-infectious': ['post-infectious IBS pathophysiology', 'gut microbiome recovery diagram'],
    'post infectious': ['intestinal recovery after infection', 'gut flora restoration'],
    
    // Drugs - with side effects patterns
    'metformin side effect': ['metformin gastrointestinal side effects diagram', 'metformin lactic acidosis mechanism'],
    'metformin': ['metformin mechanism action glucose diagram', 'metformin AMPK pathway liver muscle'],
    'statin': ['statin mechanism cholesterol diagram', 'LDL receptor pathway'],
    'antibiotic': ['antibiotic mechanism action diagram', 'bacterial cell wall target'],
  };
  
  // Find matching terms
  for (const [term, searchQueries] of Object.entries(medicalTerms)) {
    if (queryLower.includes(term)) {
      searchQueries.forEach((sq, i) => {
        queries.push({
          searchQuery: mode === 'doctor' ? sq : sq.replace('diagram', 'infographic simple'),
          imageType: i === 0 ? 'pathology' : 'anatomy',
          priority: i + 1,
          rationale: `Related to ${term} in query`,
        });
      });
      break; // Only use first matching term
    }
  }
  
  // If no specific match, use generic medical diagram
  if (queries.length === 0) {
    const words = queryLower
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['what', 'how', 'why', 'the', 'are', 'is', 'for', 'with'].includes(w))
      .slice(0, 3);
    
    if (words.length > 0) {
      queries.push({
        searchQuery: `${words.join(' ')} medical diagram`,
        imageType: 'diagram',
        priority: 1,
        rationale: 'Extracted key terms from query',
      });
    }
  }
  
  return queries.slice(0, 3);
}

/**
 * Generate image search queries using tags from PICO extraction
 * This version uses disease_tags and decision_tags to create targeted queries
 */
export async function generateSmartImageQueriesWithTags(
  userQuery: string,
  config: TagBasedImageConfig,
  mode: 'doctor' | 'general' = 'doctor'
): Promise<SmartImageQuery[]> {
  // For pure decision queries without imaging modality, return zero images
  if (config.is_decision_query && !config.has_imaging_modality) {
    console.log('📷 Decision query without imaging modality - defaulting to zero images');
    return [];
  }
  
  // Check if we should show images based on other criteria
  if (!shouldShowImages(config) && config.is_decision_query) {
    console.log('📷 Decision query without imaging modality - defaulting to zero images');
    return [];
  }
  
  // If we have both disease and decision tags, create targeted queries
  if (config.disease_tags.length > 0 && config.decision_tags.length > 0) {
    const queries: SmartImageQuery[] = [];
    
    // Combine primary disease tag with primary decision tag for algorithm search
    const primaryDisease = config.disease_tags[0];
    const primaryDecision = config.decision_tags[0];
    
    // Search for decision algorithms
    queries.push({
      searchQuery: `${primaryDisease} ${primaryDecision} algorithm decision flowchart`,
      imageType: 'diagram',
      priority: 1,
      rationale: `Decision algorithm for ${primaryDisease} ${primaryDecision}`,
    });
    
    return queries;
  }
  
  // If only disease tags, search for pathophysiology/anatomy
  if (config.disease_tags.length > 0) {
    const queries: SmartImageQuery[] = [];
    const primaryDisease = config.disease_tags[0];
    
    queries.push({
      searchQuery: `${primaryDisease} pathophysiology diagram medical`,
      imageType: 'pathology',
      priority: 1,
      rationale: `Pathophysiology of ${primaryDisease}`,
    });
    
    if (mode === 'general') {
      queries.push({
        searchQuery: `${primaryDisease} infographic simple explained`,
        imageType: 'infographic',
        priority: 2,
        rationale: `Patient-friendly infographic for ${primaryDisease}`,
      });
    }
    
    return queries;
  }
  
  // Fallback to original function if no tags
  return generateSmartImageQueries(userQuery, mode);
}

/**
 * Simple relevance check based on title matching (no vision API)
 * Much faster than vision verification
 */
export function isImageRelevantByTitle(
  imageTitle: string,
  searchQuery: string,
  userQuery: string
): { relevant: boolean; score: number; reason: string } {
  const titleLower = imageTitle.toLowerCase();
  const searchLower = searchQuery.toLowerCase();
  const userLower = userQuery.toLowerCase();
  
  // Extract key terms from search query
  const searchTerms = searchLower
    .split(/\s+/)
    .filter(t => t.length > 3 && !['diagram', 'medical', 'anatomy', 'pathology', 'infographic', 'chart', 'mechanism', 'action'].includes(t));
  
  // Count matching terms
  const matchingTerms = searchTerms.filter(term => titleLower.includes(term));
  const matchRatio = searchTerms.length > 0 ? matchingTerms.length / searchTerms.length : 0;
  
  // Check for completely unrelated topics
  const unrelatedPatterns = [
    { query: 'giardia', exclude: ['stroke', 'heart attack', 'brain', 'cardiac', 'pulmonary'] },
    { query: 'dietary', exclude: ['lifecycle', 'transmission', 'parasite lifecycle'] },
    { query: 'heart', exclude: ['giardia', 'parasite', 'intestinal infection'] },
    { query: 'diabetes', exclude: ['stroke symptoms', 'heart attack', 'giardia'] },
  ];
  
  for (const pattern of unrelatedPatterns) {
    if (userLower.includes(pattern.query)) {
      if (pattern.exclude.some(ex => titleLower.includes(ex))) {
        return {
          relevant: false,
          score: 0,
          reason: `Image about "${pattern.exclude.find(ex => titleLower.includes(ex))}" is unrelated to "${pattern.query}" query`,
        };
      }
    }
  }
  
  // Score based on match ratio
  const score = Math.round(matchRatio * 100);
  
  return {
    relevant: score >= 20, // Lower threshold - 20% match is acceptable for medical images
    score,
    reason: score >= 20 
      ? `Matches ${matchingTerms.length}/${searchTerms.length} search terms`
      : `Low relevance: only ${matchingTerms.length}/${searchTerms.length} terms match`,
  };
}

/**
 * Tag-based relevance check for images
 * Requires image title to contain BOTH a disease term AND a decision concept
 */
export function isImageRelevantByTags(
  imageTitle: string,
  config: TagBasedImageConfig
): { relevant: boolean; score: number; reason: string } {
  const titleLower = imageTitle.toLowerCase();
  
  // Filter out generic teaching images
  const genericPatterns = [
    'normal ecg',
    'ecg interpretation',
    'chest x-ray normal',
    'cxr interpretation',
    'spectrum of disease',
    'hospital acquired pneumonia types',
  ];
  
  if (genericPatterns.some(pattern => titleLower.includes(pattern))) {
    return {
      relevant: false,
      score: 0,
      reason: 'Generic teaching image filtered out',
    };
  }
  
  // Check for disease tag match (check both with underscores and spaces)
  const diseaseMatch = config.disease_tags.some(tag => {
    const tagLower = tag.toLowerCase();
    return titleLower.includes(tagLower) || titleLower.includes(tagLower.replace(/_/g, ' '));
  });
  
  // Check for decision tag match (check both with underscores and spaces)
  const decisionMatch = config.decision_tags.some(tag => {
    const tagLower = tag.toLowerCase();
    return titleLower.includes(tagLower) || titleLower.includes(tagLower.replace(/_/g, ' '));
  });
  
  // For decision queries, require BOTH disease and decision terms
  if (config.is_decision_query || config.decision_tags.length > 0) {
    if (diseaseMatch && decisionMatch) {
      return {
        relevant: true,
        score: 100,
        reason: 'Matches both disease and decision tags',
      };
    }
    return {
      relevant: false,
      score: diseaseMatch ? 50 : 0,
      reason: diseaseMatch 
        ? 'Missing decision concept in title' 
        : 'Missing disease term in title',
    };
  }
  
  // For non-decision queries, disease match is sufficient
  if (diseaseMatch) {
    return {
      relevant: true,
      score: 80,
      reason: 'Matches disease tag',
    };
  }
  
  return {
    relevant: false,
    score: 0,
    reason: 'No tag matches found',
  };
}
