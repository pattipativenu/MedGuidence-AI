/**
 * General Mode Medical Image Retrieval System
 * 
 * Consumer-friendly medical image search focused on:
 * - Simple anatomy diagrams
 * - Prevention infographics  
 * - Lifestyle illustrations
 * - Educational content for patients
 */

import { expandMedicalAbbreviations } from './evidence/medical-abbreviations';
import { searchAllOpenSources, type OpenMedicalImage } from './open-medical-images';

interface GeneralModeImageCandidate {
  url: string;
  title: string;
  snippet: string;
  sourceDomain: string;
  score: number;
  attribution?: string;
  imageType: 'anatomy' | 'prevention' | 'lifestyle' | 'educational' | 'infographic';
}

interface GeneralModeImageQuery {
  query: string;
  healthTopic: string;
  userConcerns: string[];
}

/**
 * Extract key medical/health terms from query for targeted image search
 */
function extractKeyImageTerms(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const keyTerms: string[] = [];
  
  // Extract specific positions, techniques, or procedures mentioned
  const specificTerms = lowerQuery.match(/\b(flipping fish|fetal position|side sleeping|back sleeping|prone position|supine position|recovery position)\b/g);
  if (specificTerms) {
    keyTerms.push(...specificTerms);
  }
  
  // Extract specific conditions or symptoms
  const conditions = lowerQuery.match(/\b(rotator cuff|meniscus tear|acl tear|herniated disc|plantar fasciitis|carpal tunnel|tennis elbow)\b/g);
  if (conditions) {
    keyTerms.push(...conditions);
  }
  
  // Extract body parts with context
  const bodyPartContext = lowerQuery.match(/\b(knee pain|shoulder pain|back pain|neck pain|ankle sprain|wrist injury)\b/g);
  if (bodyPartContext) {
    keyTerms.push(...bodyPartContext);
  }
  
  return keyTerms;
}

/**
 * Build consumer-friendly image queries with QUERY-SPECIFIC focus
 */
function buildConsumerImageQueries(query: string, healthTopic: string): string[] {
  const queries: string[] = [];
  const lowerQuery = query.toLowerCase();
  
  // PRIORITY 1: Extract and search for SPECIFIC terms from the query first
  const keyTerms = extractKeyImageTerms(query);
  if (keyTerms.length > 0) {
    // Search for the EXACT terms mentioned in the query
    keyTerms.forEach(term => {
      queries.push(`${term} medical illustration diagram`);
      queries.push(`${term} explanation infographic`);
    });
    
    // Return ONLY these specific queries - don't add generic ones
    return queries.slice(0, 3);
  }
  
  // PRIORITY 2: Specific medical topics (only if no specific terms found)
  if (lowerQuery.includes('sleep') || lowerQuery.includes('sleeping')) {
    // Check for specific sleep positions first
    if (lowerQuery.match(/position|pose|posture/)) {
      queries.push(`${query} medical diagram`); // Use FULL query for specific positions
      queries.push('sleep positions comparison diagram');
    } else {
      queries.push('sleep cycle stages diagram');
      queries.push('healthy sleep hygiene infographic');
    }
    return queries.slice(0, 2);
  }
  
  // PRIORITY 3: Anatomy-focused queries (no food/lifestyle)
  if (lowerQuery.includes('heart') || healthTopic.includes('heart')) {
    queries.push('simple heart anatomy diagram');
    queries.push('heart chambers blood flow diagram');
  }
  
  if (lowerQuery.includes('diabetes') || healthTopic.includes('diabetes')) {
    queries.push('diabetes blood sugar explanation diagram');
    queries.push('insulin function simple diagram');
  }
  
  if (lowerQuery.includes('lung') || lowerQuery.includes('breathing') || healthTopic.includes('respiratory')) {
    queries.push('simple lung anatomy diagram');
    queries.push('respiratory system diagram');
  }
  
  if (lowerQuery.includes('kidney') || healthTopic.includes('kidney')) {
    queries.push('simple kidney anatomy diagram');
    queries.push('kidney filtration diagram');
  }
  
  if (lowerQuery.includes('blood pressure') || lowerQuery.includes('hypertension')) {
    queries.push('blood pressure measurement diagram');
    queries.push('blood pressure ranges chart');
  }
  
  if (lowerQuery.includes('cholesterol')) {
    queries.push('cholesterol types diagram');
    queries.push('HDL LDL cholesterol explanation');
  }
  
  // PRIORITY 4: Only add general queries if nothing specific found
  if (queries.length === 0) {
    queries.push(`${healthTopic} medical diagram`);
    queries.push(`${healthTopic} anatomy illustration`);
  }
  
  return queries.slice(0, 2); // Limit to 2 focused queries
}

/**
 * Score image relevance for consumer health with STRICT filtering
 */
function scoreConsumerImageRelevance(
  image: any,
  query: string,
  healthTopic: string
): { score: number; imageType: GeneralModeImageCandidate['imageType']; reject: boolean } {
  let score = 0;
  let imageType: GeneralModeImageCandidate['imageType'] = 'educational';
  let reject = false;
  
  const text = `${image.title} ${image.snippet}`.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // CRITICAL: REJECT irrelevant images immediately
  const irrelevantTerms = [
    // Generic stock photos
    'istockphoto', 'shutterstock', 'getty images', 'stock photo',
    // Food/cooking (unless query is about diet/nutrition)
    'recipe', 'cooking', 'meal prep', 'food photography',
    // Lifestyle/wellness (unless query is about lifestyle)
    'yoga class', 'gym workout', 'fitness model', 'wellness retreat',
    // Geographic/environmental
    'usgs', 'geological', 'map', 'satellite', 'terrain',
    // Generic icons/symbols
    'icon set', 'symbol collection', 'emoji', 'clipart'
  ];
  
  // Check if query is about diet/nutrition
  const isDietQuery = lowerQuery.match(/diet|nutrition|food|eating|meal/);
  
  irrelevantTerms.forEach(term => {
    if (text.includes(term)) {
      // Allow food images ONLY if query is about diet/nutrition
      if (term.includes('recipe') || term.includes('cooking') || term.includes('meal')) {
        if (!isDietQuery) {
          reject = true;
        }
      } else {
        reject = true;
      }
    }
  });
  
  // REJECT if image is clearly not medical/health related
  if (!text.match(/health|medical|anatomy|body|disease|condition|symptom|treatment|diagram|illustration/)) {
    reject = true;
  }
  
  // Extract key terms from query for exact matching
  const keyTerms = extractKeyImageTerms(query);
  let hasKeyTermMatch = false;
  
  if (keyTerms.length > 0) {
    // For specific queries, require EXACT term match
    keyTerms.forEach(term => {
      if (text.includes(term.toLowerCase())) {
        score += 100; // Very high score for exact matches
        hasKeyTermMatch = true;
      }
    });
    
    // If we have key terms but no match, heavily penalize
    if (!hasKeyTermMatch) {
      score -= 50;
    }
  }
  
  // Health topic matching
  if (text.includes(healthTopic.toLowerCase())) {
    score += 40;
  }
  
  // Query term matching (for general queries)
  const queryTerms = lowerQuery.split(' ').filter(term => term.length > 3);
  let matchedTerms = 0;
  queryTerms.forEach(term => {
    if (text.includes(term)) {
      score += 15;
      matchedTerms++;
    }
  });
  
  // Require at least 2 query term matches for relevance
  if (queryTerms.length >= 3 && matchedTerms < 2) {
    score -= 30;
  }
  
  // Medical diagram/illustration scoring
  const medicalVisualTerms = [
    'diagram', 'illustration', 'anatomy', 'medical illustration',
    'infographic', 'chart', 'explanation', 'educational'
  ];
  
  medicalVisualTerms.forEach(term => {
    if (text.includes(term)) {
      score += 25;
      
      // Determine image type
      if (term === 'infographic' || term === 'chart') {
        imageType = 'infographic';
      } else if (term === 'diagram' || term === 'anatomy' || term === 'illustration') {
        imageType = 'anatomy';
      } else if (term === 'educational' || term === 'explanation') {
        imageType = 'educational';
      }
    }
  });
  
  // Penalize overly technical content
  const technicalTerms = [
    'pathophysiology', 'mechanism', 'molecular', 'cellular',
    'algorithm', 'protocol', 'clinical trial', 'diagnostic',
    'surgery', 'surgical', 'procedure', 'intervention'
  ];
  
  technicalTerms.forEach(term => {
    if (text.includes(term)) {
      score -= 20;
    }
  });
  
  // Boost trusted consumer health sources
  const consumerHealthDomains = [
    'mayoclinic.org', 'webmd.com', 'healthline.com', 'medlineplus.gov',
    'heart.org', 'diabetes.org', 'cancer.org', 'cdc.gov', 'who.int',
    'nih.gov', 'clevelandclinic.org', 'kidshealth.org', 'nhs.uk'
  ];
  
  if (consumerHealthDomains.some(domain => image.link?.includes(domain))) {
    score += 40;
  }
  
  // Penalize academic/research sources for general mode
  const academicDomains = [
    'pubmed.ncbi.nlm.nih.gov', 'nejm.org', 'thelancet.com',
    'jamanetwork.com', 'bmj.com', 'nature.com', 'science.org'
  ];
  
  if (academicDomains.some(domain => image.link?.includes(domain))) {
    score -= 20;
  }
  
  return { score: Math.max(0, score), imageType, reject };
}

/**
 * Retrieve medical images for General Mode
 */
export async function retrieveGeneralModeImages(
  query: string,
  healthTopic: string,
  userConcerns: string[] = []
): Promise<GeneralModeImageCandidate[]> {
  
  if (!process.env.SERPER_API_KEY) {
    console.log('⚠️ SERPER_API_KEY not set, skipping General Mode image search');
    return [];
  }
  
  console.log(`🏠 Retrieving General Mode images for: ${healthTopic}`);
  
  // Expand abbreviations for better matching
  const expandedQuery = expandMedicalAbbreviations(query);
  console.log(`📝 Expanded query: ${expandedQuery}`);
  
  // Build consumer-friendly queries
  const imageQueries = buildConsumerImageQueries(expandedQuery, healthTopic);
  console.log(`📋 Consumer image queries: ${imageQueries.join(', ')}`);
  
  const allCandidates: GeneralModeImageCandidate[] = [];
  
  // Search for each query
  for (const imageQuery of imageQueries) {
    try {
      const response = await fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: imageQuery + ' -surgery -clinical -treatment -medication -recipe -cooking -food -stock -istockphoto -shutterstock -getty',
          num: 10,
          gl: 'us',
          hl: 'en',
          safe: 'active' // Enable safe search for consumer content
        }),
      });
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (data.images) {
        data.images.forEach((img: any) => {
          const { score, imageType, reject } = scoreConsumerImageRelevance(img, expandedQuery, healthTopic);
          
          // STRICT FILTERING: Reject irrelevant images immediately
          if (reject) {
            console.log(`   ❌ Rejected irrelevant image: ${img.title}`);
            return;
          }
          
          // Higher threshold for relevance (60 instead of 35)
          if (score >= 60) {
            try {
              const sourceDomain = new URL(img.link || 'https://example.com').hostname;
              allCandidates.push({
                url: img.imageUrl,
                title: img.title || 'Health Information Image',
                snippet: img.snippet || 'Educational health content',
                sourceDomain,
                score,
                imageType,
                attribution: `Image from ${sourceDomain}`
              });
              console.log(`   ✅ Accepted image (score: ${score}): ${img.title}`);
            } catch (urlError) {
              console.warn(`Invalid URL for General Mode image: ${img.title}`);
            }
          } else {
            console.log(`   ⚠️ Low score (${score}): ${img.title}`);
          }
        });
      }
    } catch (error) {
      console.error(`Error searching General Mode images for "${imageQuery}":`, error);
    }
  }
  
  // Add open medical images (prioritize patient-friendly ones)
  const openImages = await searchAllOpenSources(expandedQuery);
  const openCandidates: GeneralModeImageCandidate[] = openImages
    .filter(img => {
      // Filter for patient-friendly open images
      const text = `${img.title} ${img.description}`.toLowerCase();
      return !text.includes('pathology') && 
             !text.includes('surgical') && 
             !text.includes('clinical');
    })
    .map(img => ({
      url: img.url,
      title: img.title,
      snippet: img.description,
      sourceDomain: img.source === 'Open-i' ? 'openi.nlm.nih.gov' : 'injurymap.com',
      score: 90, // High priority for government sources
      attribution: img.attribution,
      imageType: 'anatomy' as const
    }));
  
  // Combine and prioritize: Open Sources > Consumer Health Sites > General Web
  const combinedCandidates = [...openCandidates, ...allCandidates];
  
  // Sort by score (highest first)
  const sortedCandidates = combinedCandidates.sort((a, b) => b.score - a.score);
  
  // STRICT LIMIT: Show 1-4 images maximum, only if highly relevant
  const maxImages = 4;
  const minScore = 70; // Increased minimum score threshold
  
  // Filter by minimum score and take top results
  const topCandidates = sortedCandidates
    .filter(c => c.score >= minScore)
    .slice(0, maxImages);
  
  // If we have no high-quality images, return empty array (better than showing irrelevant images)
  if (topCandidates.length === 0) {
    console.log(`⚠️ No high-quality images found (all below score threshold of ${minScore})`);
    return [];
  }
  
  console.log(`✅ Found ${topCandidates.length} relevant General Mode images (${openCandidates.length} open sources, ${allCandidates.length} web results)`);
  console.log(`📊 Image scores: ${topCandidates.map(c => `${c.score}`).join(', ')}`);
  console.log(`📊 Image types: ${topCandidates.map(c => c.imageType).join(', ')}`);
  
  return topCandidates;
}

/**
 * Format General Mode images for display
 */
export function formatGeneralModeImages(images: GeneralModeImageCandidate[]): any[] {
  return images.map(img => ({
    url: img.url,
    title: img.title,
    description: img.snippet,
    source: img.sourceDomain,
    relevanceScore: img.score,
    attribution: img.attribution,
    imageType: img.imageType,
    consumerFriendly: true
  }));
}

/**
 * Generate image descriptions for General Mode
 */
export function generateConsumerImageDescriptions(images: GeneralModeImageCandidate[]): string {
  if (images.length === 0) return '';
  
  let description = '\n## Helpful Images\n\n';
  description += 'Here are some simple diagrams and illustrations that might help you understand this topic better:\n\n';
  
  images.forEach((image, index) => {
    description += `**${index + 1}. ${image.title}**\n`;
    description += `${image.snippet}\n`;
    
    // Add consumer-friendly context based on image type
    switch (image.imageType) {
      case 'anatomy':
        description += '*This diagram shows the basic structure and helps you understand how this part of your body works.*\n\n';
        break;
      case 'prevention':
        description += '*This illustration shows practical steps you can take to prevent problems and stay healthy.*\n\n';
        break;
      case 'lifestyle':
        description += '*This image gives you ideas for healthy lifestyle changes you can make at home.*\n\n';
        break;
      case 'infographic':
        description += '*This chart breaks down important information in an easy-to-understand format.*\n\n';
        break;
      default:
        description += '*This educational image provides helpful information about your health topic.*\n\n';
    }
  });
  
  description += '*Note: These images are for educational purposes. Always talk to your doctor about your specific situation.*\n\n';
  
  return description;
}