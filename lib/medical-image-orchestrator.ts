/**
 * Medical Image Orchestrator
 * 
 * Intelligent routing and retrieval from multiple sources:
 * - Open-i (NLM): Pathology, research, imaging
 * - InjuryMap: MSK anatomy
 */

import { detectImageIntent, getSourceQueries } from './image-intent-detector';
import { searchOpenI, type OpenIImage } from './open-i-client';
// InjuryMap disabled due to broken/placeholder URLs - see INJURYMAP_DISABLED_FIX.md
// import { searchInjuryMap, type InjuryMapImage } from './injurymap-client';

export interface MedicalImage {
  id: string;
  url: string;
  title: string;
  description: string;
  source: 'Open-i' | 'InjuryMap';
  attribution: string;
  thumbnail?: string;
  score: number;
}

/**
 * Retrieve medical images with intelligent source routing
 */
export async function retrieveMedicalImagesIntelligent(
  query: string,
  mode: 'doctor' | 'general',
  _tags: { disease_tags: string[], decision_tags: string[] } // Unused but kept for API compatibility
): Promise<MedicalImage[]> {
  
  console.log(`🎯 Intelligent image retrieval for: "${query}" (${mode} mode)`);
  
  // 1. Detect intent
  const intent = detectImageIntent(query, mode);
  console.log(`   Intent: ${intent.primary} (confidence: ${intent.confidence})`);
  console.log(`   Sources: ${intent.sources.join(', ')}`);
  console.log(`   Keywords:`, intent.keywords);
  
  // 2. Get optimized queries for each source
  const sourceQueries = getSourceQueries(query, intent);
  
  // 3. Parallel retrieval from selected sources with MULTIPLE QUERIES
  const results: MedicalImage[] = [];
  
  // CRITICAL FIX: Filter out InjuryMap due to broken/placeholder URLs
  const activeSources = intent.sources.filter(s => s !== 'injurymap');
  
  if (intent.sources.includes('injurymap')) {
    console.log(`   ⚠️  InjuryMap disabled - broken URLs. Using Open-i for all medical images.`);
  }
  
  // MAJOR FIX: Search Open-i with MULTIPLE query strategies for maximum coverage
  if (activeSources.includes('openi')) {
    try {
      console.log(`   🔬 Searching Open-i with multiple strategies...`);
      
      // Strategy 1: Primary query (graphics/diagrams)
      console.log(`   📊 Strategy 1 - Graphics: "${sourceQueries.openi}"`);
      const graphicsImages = await searchOpenI({
        query: sourceQueries.openi,
        maxResults: 6,
        imageType: 'xg', // Graphics/diagrams
        collection: 'pmc'
      });
      
      // Strategy 2: Anatomy query (if relevant)
      let anatomyImages: OpenIImage[] = [];
      if (intent.keywords.organs.length > 0 || intent.keywords.msk) {
        const anatomyQuery = `${intent.keywords.organs.join(' ')} anatomy diagram`;
        console.log(`   🫀 Strategy 2 - Anatomy: "${anatomyQuery}"`);
        anatomyImages = await searchOpenI({
          query: anatomyQuery,
          maxResults: 4,
          imageType: 'xg',
          searchIn: 't', // Search in titles
          collection: 'pmc'
        });
      }
      
      // Strategy 3: Pathology/disease query (if relevant)
      let pathologyImages: OpenIImage[] = [];
      if (intent.keywords.diseases.length > 0) {
        const pathologyQuery = `${intent.keywords.diseases.join(' ')} pathophysiology diagram`;
        console.log(`   🔬 Strategy 3 - Pathology: "${pathologyQuery}"`);
        pathologyImages = await searchOpenI({
          query: pathologyQuery,
          maxResults: 4,
          imageType: 'xg',
          articleType: 'rw', // Review articles
          collection: 'pmc'
        });
      }
      
      // Strategy 4: Treatment/algorithm query (if relevant)
      let treatmentImages: OpenIImage[] = [];
      if (intent.keywords.diseases.length > 0 && mode === 'doctor') {
        const treatmentQuery = `${intent.keywords.diseases.join(' ')} treatment algorithm`;
        console.log(`   💊 Strategy 4 - Treatment: "${treatmentQuery}"`);
        treatmentImages = await searchOpenI({
          query: treatmentQuery,
          maxResults: 3,
          imageType: 'xg',
          rankBy: 't', // Treatment-ranked
          collection: 'pmc'
        });
      }
      
      // Combine all Open-i results
      const allOpenIImages = [
        ...graphicsImages,
        ...anatomyImages,
        ...pathologyImages,
        ...treatmentImages
      ];
      
      console.log(`   📊 Open-i total: ${allOpenIImages.length} images (${graphicsImages.length} graphics, ${anatomyImages.length} anatomy, ${pathologyImages.length} pathology, ${treatmentImages.length} treatment)`);
      
      // Convert to MedicalImage format
      results.push(...allOpenIImages.map((img: OpenIImage) => ({
        id: img.id,
        url: img.imgLarge,
        title: img.title,
        description: img.abstract,
        source: 'Open-i' as const,
        attribution: img.attribution,
        thumbnail: img.imgThumb,
        score: 100 // Highest priority
      })));
      
    } catch (error) {
      console.error(`   ❌ Error searching Open-i:`, error);
    }
  }
  
  // 4. Deduplicate by URL
  const seenUrls = new Set<string>();
  const uniqueResults = results.filter(img => {
    if (seenUrls.has(img.url)) {
      console.log(`   🔄 Skipping duplicate image: ${img.title}`);
      return false;
    }
    seenUrls.add(img.url);
    return true;
  });
  
  // 5. Return up to 8 Open-i images (increased from 4)
  const topResults = uniqueResults.slice(0, 8);
  
  console.log(`✅ Found ${topResults.length} unique images from Open-i`);
  console.log(`📊 Final selection: ${topResults.map(img => `${img.title.slice(0, 50)}...`).join(' | ')}`);
  
  return topResults;
}

/**
 * Format images for API response
 */
export function formatMedicalImagesForResponse(images: MedicalImage[]): any[] {
  return images.map(img => ({
    url: img.url,
    title: img.title,
    source: img.source,
    license: 'Free for reuse with attribution', // All from Open-i now
    thumbnail: img.thumbnail,
    description: img.description
  }));
}
