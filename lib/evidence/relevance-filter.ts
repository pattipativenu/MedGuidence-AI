/**
 * Relevance Filter - Removes off-topic evidence before prompt injection
 * 
 * CRITICAL FIX: Prevents citing irrelevant papers (e.g., PFO closure for BNP questions)
 * 
 * Strategy:
 * 1. Extract key clinical concepts from query (disease, biomarker, intervention)
 * 2. Score each evidence item for relevance
 * 3. Filter out low-relevance items (< 30% match)
 */

import { PubMedArticle } from './pubmed';
import { CochraneReview } from './cochrane';
import { PMCArticle } from './pmc';
import { EuropePMCArticle } from './europepmc';

interface RelevanceScore {
  score: number; // 0-100
  reason: string;
  shouldInclude: boolean;
}

/**
 * Extract key clinical concepts from query
 */
function extractClinicalConcepts(query: string): {
  diseases: string[];
  biomarkers: string[];
  interventions: string[];
  outcomes: string[];
} {
  const lowerQuery = query.toLowerCase();
  
  // Common disease patterns
  const diseases: string[] = [];
  const diseasePatterns = [
    'heart failure', 'hfpef', 'hfref', 'adhf', 'acute decompensated heart failure',
    'dyspnea', 'shortness of breath', 'acute dyspnea',
    'pneumonia', 'sepsis', 'copd',
    'diabetes', 'hypertension', 'stroke', 'myocardial infarction', 'mi',
    'pulmonary embolism', 'pe', 'dvt', 'atrial fibrillation', 'af',
    'chronic kidney disease', 'ckd', 'acute kidney injury', 'aki',
    'hyperkalemia', 'hypokalemia', 'electrolyte', 'potassium',
    'renal', 'kidney', 'nephrology', 'dialysis', 'esrd',
    'cancer', 'asthma', 'covid', 'influenza', 'uti', 'cellulitis',
    'acute coronary syndrome', 'acs'
  ];
  
  for (const disease of diseasePatterns) {
    if (lowerQuery.includes(disease)) {
      diseases.push(disease);
    }
  }
  
  // Common biomarkers
  const biomarkers: string[] = [];
  const biomarkerPatterns = [
    'bnp', 'b-type natriuretic peptide', 'nt-probnp', 'nt-pro-bnp',
    'elevated bnp', 'elevated b-type natriuretic peptide',
    'troponin',
    'd-dimer', 'crp', 'procalcitonin', 'lactate', 'creatinine',
    'hba1c', 'glucose', 'ldl', 'hdl', 'triglycerides'
  ];
  
  for (const biomarker of biomarkerPatterns) {
    if (lowerQuery.includes(biomarker)) {
      biomarkers.push(biomarker);
    }
  }
  
  // Common interventions
  const interventions: string[] = [];
  const interventionPatterns = [
    'antibiotic', 'anticoagulation', 'antiplatelet', 'statin',
    'beta blocker', 'ace inhibitor', 'arb', 'diuretic', 'insulin',
    'metformin', 'sglt2', 'surgery', 'pci', 'cabg', 'dialysis',
    'raas inhibitor', 'raas', 'acei', 'angiotensin', 'renin',
    'kdigo', 'kdoqi', 'guideline', 'recommendation'
  ];
  
  for (const intervention of interventionPatterns) {
    if (lowerQuery.includes(intervention)) {
      interventions.push(intervention);
    }
  }
  
  // Common outcomes
  const outcomes: string[] = [];
  const outcomePatterns = [
    'mortality', 'survival', 'hospitalization', 'readmission',
    'quality of life', 'adverse events', 'bleeding', 'stroke',
    'myocardial infarction', 'death', 'cure', 'remission'
  ];
  
  for (const outcome of outcomePatterns) {
    if (lowerQuery.includes(outcome)) {
      outcomes.push(outcome);
    }
  }
  
  return { diseases, biomarkers, interventions, outcomes };
}

/**
 * Score relevance of an article to the query
 */
function scoreArticleRelevance(
  article: { title: string; abstract?: string; meshTerms?: string[] },
  concepts: ReturnType<typeof extractClinicalConcepts>
): RelevanceScore {
  const titleLower = article.title.toLowerCase();
  const abstractLower = article.abstract?.toLowerCase() || '';
  const meshLower = article.meshTerms?.map(m => m.toLowerCase()) || [];
  
  let score = 0;
  const reasons: string[] = [];
  
  // Check disease match (40 points max)
  let diseaseMatch = 0;
  for (const disease of concepts.diseases) {
    if (titleLower.includes(disease) || meshLower.some(m => m.includes(disease))) {
      diseaseMatch += 20;
      reasons.push(`Disease match: ${disease}`);
    } else if (abstractLower.includes(disease)) {
      diseaseMatch += 10;
      reasons.push(`Disease in abstract: ${disease}`);
    }
  }
  score += Math.min(diseaseMatch, 40);
  
  // Check biomarker match (30 points max)
  let biomarkerMatch = 0;
  for (const biomarker of concepts.biomarkers) {
    if (titleLower.includes(biomarker) || meshLower.some(m => m.includes(biomarker))) {
      biomarkerMatch += 15;
      reasons.push(`Biomarker match: ${biomarker}`);
    } else if (abstractLower.includes(biomarker)) {
      biomarkerMatch += 7;
      reasons.push(`Biomarker in abstract: ${biomarker}`);
    }
  }
  score += Math.min(biomarkerMatch, 30);
  
  // Check intervention match (20 points max)
  let interventionMatch = 0;
  for (const intervention of concepts.interventions) {
    if (titleLower.includes(intervention) || meshLower.some(m => m.includes(intervention))) {
      interventionMatch += 10;
      reasons.push(`Intervention match: ${intervention}`);
    } else if (abstractLower.includes(intervention)) {
      interventionMatch += 5;
      reasons.push(`Intervention in abstract: ${intervention}`);
    }
  }
  score += Math.min(interventionMatch, 20);
  
  // Check outcome match (10 points max)
  let outcomeMatch = 0;
  for (const outcome of concepts.outcomes) {
    if (titleLower.includes(outcome) || abstractLower.includes(outcome)) {
      outcomeMatch += 5;
      reasons.push(`Outcome match: ${outcome}`);
    }
  }
  score += Math.min(outcomeMatch, 10);
  
  // Determine if should include (threshold: 30%)
  const shouldInclude = score >= 30;
  
  return {
    score,
    reason: reasons.join('; ') || 'No concept matches',
    shouldInclude
  };
}

/**
 * Filter PubMed articles by relevance
 */
export function filterRelevantPubMedArticles(
  articles: PubMedArticle[],
  query: string,
  minScore: number = 30
): { filtered: PubMedArticle[]; removed: number; reasons: string[] } {
  const concepts = extractClinicalConcepts(query);
  const filtered: PubMedArticle[] = [];
  const removedReasons: string[] = [];
  
  for (const article of articles) {
    const relevance = scoreArticleRelevance(article, concepts);
    
    if (relevance.shouldInclude && relevance.score >= minScore) {
      filtered.push(article);
    } else {
      removedReasons.push(
        `Removed: "${article.title.substring(0, 60)}..." (score: ${relevance.score}/100, reason: ${relevance.reason})`
      );
    }
  }
  
  return {
    filtered,
    removed: articles.length - filtered.length,
    reasons: removedReasons
  };
}

/**
 * Filter Cochrane reviews by relevance
 */
export function filterRelevantCochraneReviews(
  reviews: CochraneReview[],
  query: string,
  minScore: number = 30
): { filtered: CochraneReview[]; removed: number; reasons: string[] } {
  const concepts = extractClinicalConcepts(query);
  const filtered: CochraneReview[] = [];
  const removedReasons: string[] = [];
  
  for (const review of reviews) {
    const relevance = scoreArticleRelevance(review, concepts);
    
    if (relevance.shouldInclude && relevance.score >= minScore) {
      filtered.push(review);
    } else {
      removedReasons.push(
        `Removed: "${review.title.substring(0, 60)}..." (score: ${relevance.score}/100, reason: ${relevance.reason})`
      );
    }
  }
  
  return {
    filtered,
    removed: reviews.length - filtered.length,
    reasons: removedReasons
  };
}

/**
 * Filter PMC articles by relevance
 */
export function filterRelevantPMCArticles(
  articles: PMCArticle[],
  query: string,
  minScore: number = 30
): { filtered: PMCArticle[]; removed: number; reasons: string[] } {
  const concepts = extractClinicalConcepts(query);
  const filtered: PMCArticle[] = [];
  const removedReasons: string[] = [];
  
  for (const article of articles) {
    const relevance = scoreArticleRelevance(
      { title: article.title, abstract: undefined, meshTerms: undefined },
      concepts
    );
    
    if (relevance.shouldInclude && relevance.score >= minScore) {
      filtered.push(article);
    } else {
      removedReasons.push(
        `Removed: "${article.title.substring(0, 60)}..." (score: ${relevance.score}/100, reason: ${relevance.reason})`
      );
    }
  }
  
  return {
    filtered,
    removed: articles.length - filtered.length,
    reasons: removedReasons
  };
}

/**
 * Filter Europe PMC articles by relevance
 */
export function filterRelevantEuropePMCArticles(
  articles: EuropePMCArticle[],
  query: string,
  minScore: number = 30
): { filtered: EuropePMCArticle[]; removed: number; reasons: string[] } {
  const concepts = extractClinicalConcepts(query);
  const filtered: EuropePMCArticle[] = [];
  const removedReasons: string[] = [];
  
  for (const article of articles) {
    const relevance = scoreArticleRelevance(
      { title: article.title, abstract: article.abstractText, meshTerms: undefined },
      concepts
    );
    
    if (relevance.shouldInclude && relevance.score >= minScore) {
      filtered.push(article);
    } else {
      removedReasons.push(
        `Removed: "${article.title.substring(0, 60)}..." (score: ${relevance.score}/100, reason: ${relevance.reason})`
      );
    }
  }
  
  return {
    filtered,
    removed: articles.length - filtered.length,
    reasons: removedReasons
  };
}
