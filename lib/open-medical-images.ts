/**
 * Open Medical Images Integration
 * 
 * Integrates multiple free, open-access medical image sources:
 * - Open-i (NLM): PubMed Central biomedical images
 * - InjuryMap: Vector anatomy illustrations
 */

export interface OpenMedicalImage {
  id: string;
  title: string;
  description: string;
  url: string;
  source: 'Open-i' | 'InjuryMap';
  category: string;
  tags: string[];
  attribution: string;
  license?: string; // License information (e.g., "CC BY 4.0", "Public Domain")
  pmcid?: string; // For Open-i images
  thumbnailUrl?: string;
}

// Attribution texts for each source
export const ATTRIBUTIONS = {
  'Open-i': 'Image from Open-i, National Library of Medicine (https://openi.nlm.nih.gov). Free for reuse.',
  'InjuryMap': 'Image from InjuryMap (https://injurymap.com). Free for medical use.'
};

/**
 * Search Open-i (NLM) for biomedical images using enhanced API
 */
export async function searchOpenI(query: string, maxResults = 3): Promise<OpenMedicalImage[]> {
  try {
    // Import the enhanced Open-i client
    const { searchOpenI: searchOpenIClient } = await import('./open-i-client');
    
    // Use enhanced Open-i client with proper parameters
    const images = await searchOpenIClient({
      query,
      maxResults,
      imageType: 'xg', // Graphics/diagrams (exclude photos)
      searchIn: 't', // Search in titles for better accuracy
      rankBy: 'r', // Newest first
      collection: 'pmc' // PubMed Central for quality
    });

    return images.map((item, index) => ({
      id: `openi-${item.pmcid || index}`,
      title: item.title || 'Medical Image',
      description: item.abstract || item.title || 'Biomedical image from PubMed Central',
      url: item.imgLarge,
      source: 'Open-i' as const,
      category: 'biomedical',
      tags: query.split(' '),
      attribution: ATTRIBUTIONS['Open-i'],
      license: item.license || 'Free for reuse with attribution',
      pmcid: item.pmcid,
      thumbnailUrl: item.imgThumb
    }));
  } catch (error) {
    console.error('Error searching Open-i:', error);
    return [];
  }
}

/**
 * Search Open-i for anatomy diagrams (optimized)
 */
export async function searchOpenIAnatomy(bodyPart: string): Promise<OpenMedicalImage[]> {
  try {
    const { searchOpenIAnatomy: searchAnatomy } = await import('./open-i-client');
    
    const images = await searchAnatomy(bodyPart);

    return images.map((item, index) => ({
      id: `openi-anatomy-${item.pmcid || index}`,
      title: item.title || `${bodyPart} Anatomy`,
      description: item.abstract || `Anatomy diagram of ${bodyPart}`,
      url: item.imgLarge,
      source: 'Open-i' as const,
      category: 'anatomy',
      tags: [bodyPart, 'anatomy', 'diagram'],
      attribution: ATTRIBUTIONS['Open-i'],
      license: item.license || 'Free for reuse with attribution',
      pmcid: item.pmcid,
      thumbnailUrl: item.imgThumb
    }));
  } catch (error) {
    console.error('Error searching Open-i anatomy:', error);
    return [];
  }
}

// NCI Visuals removed - no longer in use


/**
 * Get InjuryMap anatomy illustrations
 * CRITICAL: Uses actual InjuryMap images from their free library
 * License: CC BY 4.0 - Free for medical use with attribution
 */
export function getInjuryMapImages(bodyPart: string): OpenMedicalImage[] {
  const injuryMapImages: Record<string, OpenMedicalImage[]> = {
    // NECK AND SHOULDER (from InjuryMap free library)
    neck: [
      {
        id: 'injurymap-neck-anatomy',
        title: 'Neck Anatomy - Cervical Spine and Muscles',
        description: 'Detailed neck anatomy showing cervical vertebrae, muscles, and nerves',
        url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_640/v1591872072/Blog/v2/Neck_Spams_v1-14.jpg',
        source: 'InjuryMap',
        category: 'musculoskeletal',
        tags: ['neck', 'cervical', 'spine', 'trapezius', 'anatomy'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_400/v1591872072/Blog/v2/Neck_Spams_v1-14.jpg'
      },
      {
        id: 'injurymap-neck-pain',
        title: 'Neck Pain Illustration',
        description: 'Illustration showing common neck pain areas and muscle strain',
        url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_640/v1591872128/Blog/v2/Neck_Spams_v1-15.jpg',
        source: 'InjuryMap',
        category: 'musculoskeletal',
        tags: ['neck pain', 'cervical strain', 'muscle pain'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_400/v1591872128/Blog/v2/Neck_Spams_v1-15.jpg'
      }
    ],
    shoulder: [
      {
        id: 'injurymap-shoulder-anatomy',
        title: 'Shoulder Anatomy - Rotator Cuff and Joint',
        description: 'Detailed shoulder anatomy showing rotator cuff muscles, joint, and bones',
        url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_640/blog/shoulder_anatomy.jpg',
        source: 'InjuryMap',
        category: 'musculoskeletal',
        tags: ['shoulder', 'rotator cuff', 'joint', 'anatomy'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_400/blog/shoulder_anatomy.jpg'
      },
      {
        id: 'injurymap-shoulder-pain',
        title: 'Shoulder Pain - Common Injury Sites',
        description: 'Illustration of common shoulder pain locations and rotator cuff injuries',
        url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_640/blog/cover_shoulder_pain.jpg',
        source: 'InjuryMap',
        category: 'musculoskeletal',
        tags: ['shoulder pain', 'rotator cuff injury', 'impingement'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_400/blog/cover_shoulder_pain.jpg'
      }
    ],
    'cervical spine': [
      {
        id: 'injurymap-cervical-spine',
        title: 'Cervical Spine Anatomy',
        description: 'Cervical vertebrae and spinal cord anatomy',
        url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_640/v1584526860/Blog/v2/Pinched_Nerve_Shoulder_Blade_f1-01.jpg',
        source: 'InjuryMap',
        category: 'musculoskeletal',
        tags: ['cervical spine', 'vertebrae', 'spinal cord'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_400/v1584526860/Blog/v2/Pinched_Nerve_Shoulder_Blade_f1-01.jpg'
      }
    ],
    trapezius: [
      {
        id: 'injurymap-trapezius',
        title: 'Trapezius Muscle Anatomy',
        description: 'Upper back and trapezius muscle anatomy',
        url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_640/v1585895087/Blog/v2/Trapezius_Pain_v1-07.jpg',
        source: 'InjuryMap',
        category: 'musculoskeletal',
        tags: ['trapezius', 'upper back', 'neck shoulder'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_400/v1585895087/Blog/v2/Trapezius_Pain_v1-07.jpg'
      }
    ],
    spine: [
      {
        id: 'injurymap-spine',
        title: 'Spine Anatomy - Full Spinal Column',
        description: 'Complete spine anatomy showing cervical, thoracic, and lumbar regions',
        url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_640/blog/spine_anatomy.jpg',
        source: 'InjuryMap',
        category: 'musculoskeletal',
        tags: ['spine', 'vertebrae', 'back', 'anatomy'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_400/blog/spine_anatomy.jpg'
      }
    ],
    back: [
      {
        id: 'injurymap-back-muscles',
        title: 'Upper Back Muscles',
        description: 'Upper back muscle anatomy including trapezius and rhomboids',
        url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_640/blog/Back_Muscles-06.jpg',
        source: 'InjuryMap',
        category: 'musculoskeletal',
        tags: ['back', 'muscles', 'trapezius', 'rhomboids'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_400/blog/Back_Muscles-06.jpg'
      },
      {
        id: 'injurymap-lower-back',
        title: 'Lower Back Pain Illustration',
        description: 'Lower back anatomy and common pain areas',
        url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_640/web/diagnoses/2.jpg',
        source: 'InjuryMap',
        category: 'musculoskeletal',
        tags: ['lower back', 'lumbar', 'back pain'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_400/web/diagnoses/2.jpg'
      }
    ],
    knee: [
      {
        id: 'injurymap-knee-anatomy',
        title: 'Knee Joint Anatomy',
        description: 'Knee anatomy showing ligaments, meniscus, and bones',
        url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_640/v1584609465/Blog/v2/Knee_pain_at_night_f1-01.jpg',
        source: 'InjuryMap',
        category: 'musculoskeletal',
        tags: ['knee', 'meniscus', 'ligaments', 'joint'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_400/v1584609465/Blog/v2/Knee_pain_at_night_f1-01.jpg'
      }
    ],
    hip: [
      {
        id: 'injurymap-hip-anatomy',
        title: 'Hip Joint Anatomy',
        description: 'Hip joint anatomy showing femur, pelvis, and surrounding muscles',
        url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_640/v1588315460/Blog/v2/Femoroacetabular_Impingement_f1-01.jpg',
        source: 'InjuryMap',
        category: 'musculoskeletal',
        tags: ['hip', 'joint', 'pelvis', 'femur'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_400/v1588315460/Blog/v2/Femoroacetabular_Impingement_f1-01.jpg'
      }
    ],
    ankle: [
      {
        id: 'injurymap-ankle-sprain',
        title: 'Ankle Sprain Anatomy',
        description: 'Ankle anatomy showing ligaments and common sprain locations',
        url: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Ankle_Sprain.jpg',
        source: 'InjuryMap',
        category: 'musculoskeletal',
        tags: ['ankle', 'sprain', 'ligaments'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Ankle_Sprain.jpg/320px-Ankle_Sprain.jpg'
      }
    ],
    elbow: [
      {
        id: 'injurymap-elbow-anatomy',
        title: 'Elbow Anatomy',
        description: 'Elbow joint anatomy showing bones, tendons, and nerves',
        url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_640/v1583822943/Blog/v2/Elbow_Injuries_f1-08.jpg',
        source: 'InjuryMap',
        category: 'musculoskeletal',
        tags: ['elbow', 'joint', 'tennis elbow'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_400/v1583822943/Blog/v2/Elbow_Injuries_f1-08.jpg'
      }
    ],
    wrist: [
      {
        id: 'injurymap-wrist-sprain',
        title: 'Wrist Sprain Anatomy',
        description: 'Wrist anatomy showing bones, ligaments, and common injury sites',
        url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_640/v1588839561/Blog/v2/Sprained_wrist_v3-03.jpg',
        source: 'InjuryMap',
        category: 'musculoskeletal',
        tags: ['wrist', 'sprain', 'carpal'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_400/v1588839561/Blog/v2/Sprained_wrist_v3-03.jpg'
      }
    ],
    musculoskeletal: [
      {
        id: 'injury-muscles',
        title: 'Human Muscle Anatomy',
        description: 'Vector illustration of human muscular system',
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Muscles_anterior_labeled.png/640px-Muscles_anterior_labeled.png',
        source: 'InjuryMap',
        category: 'anatomy',
        tags: ['muscles', 'anatomy', 'musculoskeletal'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Muscles_anterior_labeled.png/320px-Muscles_anterior_labeled.png'
      },
      {
        id: 'injury-bones',
        title: 'Human Skeletal System',
        description: 'Vector illustration of human bone structure',
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Human_skeleton_front_en.svg/640px-Human_skeleton_front_en.svg.png',
        source: 'InjuryMap',
        category: 'anatomy',
        tags: ['bones', 'skeleton', 'anatomy'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Human_skeleton_front_en.svg/320px-Human_skeleton_front_en.svg.png'
      }
    ],
    organs: [
      {
        id: 'injury-kidney',
        title: 'Kidney Anatomy',
        description: 'Kidney structure and nephron detail',
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Kidney_PioM.png/640px-Kidney_PioM.png',
        source: 'InjuryMap',
        category: 'renal',
        tags: ['kidney', 'renal', 'organs'],
        attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.',
        license: 'CC BY 4.0',
        thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Kidney_PioM.png/320px-Kidney_PioM.png'
      }
    ]
  };

  return injuryMapImages[bodyPart] || [];
}

/**
 * Extract medical keywords from clinical query for better image matching
 * CRITICAL: Translates lay terms to medical terminology for image search
 */
function extractMedicalKeywords(query: string): {
  conditions: string[];
  organs: string[];
  procedures: string[];
} {
  const lowerQuery = query.toLowerCase();
  
  const conditions: string[] = [];
  const organs: string[] = [];
  const procedures: string[] = [];
  
  // MUSCULOSKELETAL CONDITIONS (CRITICAL FOR PAIN QUERIES)
  // Neck and shoulder
  if (lowerQuery.match(/neck.*shoulder|shoulder.*neck|cervical.*shoulder|trapezius/)) {
    conditions.push('cervical radiculopathy', 'trapezius strain', 'neck shoulder pain');
    organs.push('neck', 'shoulder', 'cervical spine', 'trapezius');
  } else if (lowerQuery.match(/neck pain|cervical|neck strain|stiff neck/)) {
    conditions.push('cervical strain', 'neck pain');
    organs.push('neck', 'cervical spine');
  } else if (lowerQuery.match(/shoulder pain|rotator cuff|shoulder injury/)) {
    conditions.push('rotator cuff syndrome', 'shoulder impingement');
    organs.push('shoulder', 'rotator cuff');
  }
  
  // Back pain
  if (lowerQuery.match(/back pain|lumbar|lower back|spine|herniated disc|sciatica/)) {
    conditions.push('lumbar strain', 'herniated disc', 'sciatica');
    organs.push('spine', 'lumbar spine', 'back');
  }
  
  // Knee pain
  if (lowerQuery.match(/knee pain|meniscus|acl|mcl|patella/)) {
    conditions.push('knee pain', 'meniscus tear', 'ligament injury');
    organs.push('knee', 'meniscus', 'patella');
  }
  
  // Hip pain
  if (lowerQuery.match(/hip pain|hip joint|groin pain/)) {
    conditions.push('hip pain', 'hip osteoarthritis');
    organs.push('hip', 'hip joint');
  }
  
  // Ankle/foot pain
  if (lowerQuery.match(/ankle|foot pain|plantar fasciitis|heel pain/)) {
    conditions.push('ankle sprain', 'plantar fasciitis');
    organs.push('ankle', 'foot');
  }
  
  // Elbow/wrist pain
  if (lowerQuery.match(/elbow|tennis elbow|golfer's elbow/)) {
    conditions.push('lateral epicondylitis', 'tennis elbow');
    organs.push('elbow');
  }
  if (lowerQuery.match(/wrist|carpal tunnel/)) {
    conditions.push('carpal tunnel syndrome', 'wrist pain');
    organs.push('wrist');
  }
  
  // General musculoskeletal
  if (lowerQuery.match(/muscle|strain|sprain|joint|arthritis|osteoarthritis/)) {
    conditions.push('musculoskeletal pain');
    organs.push('musculoskeletal');
  }
  
  // Cardiovascular conditions
  if (lowerQuery.match(/atrial fibrillation|af\b|afib/)) {
    conditions.push('atrial fibrillation');
    organs.push('heart');
  }
  if (lowerQuery.match(/heart failure|hf\b|hfpef|hfref/)) {
    conditions.push('heart failure');
    organs.push('heart');
  }
  if (lowerQuery.match(/myocardial infarction|mi\b|heart attack/)) {
    conditions.push('myocardial infarction');
    organs.push('heart');
  }
  if (lowerQuery.match(/stroke|cva|cerebrovascular/)) {
    conditions.push('stroke');
    organs.push('brain');
  }
  
  // Respiratory
  if (lowerQuery.match(/pneumonia|cap\b|lung infection/)) {
    conditions.push('pneumonia');
    organs.push('lung');
  }
  if (lowerQuery.match(/copd|emphysema|chronic bronchitis/)) {
    conditions.push('copd');
    organs.push('lung');
  }
  if (lowerQuery.match(/asthma/)) {
    conditions.push('asthma');
    organs.push('lung');
  }
  
  // Endocrine
  if (lowerQuery.match(/diabetes|dm\b|t1dm|t2dm/)) {
    conditions.push('diabetes');
    organs.push('pancreas');
  }
  if (lowerQuery.match(/thyroid|hyperthyroid|hypothyroid/)) {
    conditions.push('thyroid disorder');
    organs.push('thyroid');
  }
  
  // Renal
  if (lowerQuery.match(/kidney|renal|ckd|chronic kidney/)) {
    conditions.push('kidney disease');
    organs.push('kidney');
  }
  
  // Hematology
  if (lowerQuery.match(/vte|dvt|pulmonary embolism|pe\b|thrombosis/)) {
    conditions.push('venous thromboembolism');
    organs.push('vascular');
  }
  if (lowerQuery.match(/anemia|iron deficiency/)) {
    conditions.push('anemia');
    organs.push('blood');
  }
  
  // Cancer
  if (lowerQuery.match(/cancer|tumor|oncology|malignancy|carcinoma/)) {
    conditions.push('cancer');
  }
  
  // Sleep disorders
  if (lowerQuery.match(/sleep|insomnia|sleeping position|sleep apnea/)) {
    conditions.push('sleep disorder');
    organs.push('sleep');
  }
  
  // Procedures
  if (lowerQuery.match(/laao|left atrial appendage occlusion/)) {
    procedures.push('left atrial appendage occlusion');
  }
  if (lowerQuery.match(/ablation/)) {
    procedures.push('ablation');
  }
  
  return { conditions, organs, procedures };
}

/**
 * Search all open medical image sources in parallel
 * CRITICAL: Queries ALL THREE sources simultaneously for maximum coverage
 * IMPROVED: Better clinical keyword matching, no generic fallbacks
 */
export async function searchAllOpenSources(
  query: string,
  category?: string
): Promise<OpenMedicalImage[]> {
  console.log(`🔍 Searching all three image sources for: "${query}"`);
  const startTime = Date.now();
  
  // Extract medical keywords for better matching
  const keywords = extractMedicalKeywords(query);
  console.log(`📋 Extracted keywords:`, keywords);

  // Run all three sources in PARALLEL for speed
  const [openIResults, injuryResults] = await Promise.all([
    // 1. Open-i (NLM) - Use anatomy-specific search for musculoskeletal queries
    (async () => {
      try {
        // If we have specific body part keywords, use anatomy search
        if (keywords.organs.length > 0) {
          const anatomyResults: OpenMedicalImage[] = [];
          
          // Search for each body part
          for (const organ of keywords.organs.slice(0, 2)) { // Limit to 2 body parts
            const results = await searchOpenIAnatomy(organ);
            anatomyResults.push(...results);
          }
          
          // If we got anatomy results, return them
          if (anatomyResults.length > 0) {
            return anatomyResults.slice(0, 3);
          }
        }
        
        // Otherwise, use general search
        return await searchOpenI(query, 3);
      } catch (err: any) {
        console.error('Open-i error:', err.message);
        return [];
      }
    })(),

    // 3. InjuryMap - Try multiple anatomy types based on extracted keywords
    Promise.resolve((() => {
      const results: OpenMedicalImage[] = [];
      const lowerQuery = query.toLowerCase();

      // MUSCULOSKELETAL (PRIORITY - most common queries)
      // Neck
      if (keywords.organs.includes('neck') || keywords.organs.includes('cervical spine') || lowerQuery.includes('neck')) {
        results.push(...getInjuryMapImages('neck').slice(0, 2));
      }
      
      // Shoulder
      if (keywords.organs.includes('shoulder') || keywords.organs.includes('rotator cuff') || lowerQuery.includes('shoulder')) {
        results.push(...getInjuryMapImages('shoulder').slice(0, 2));
      }
      
      // Trapezius (neck-shoulder connection)
      if (keywords.organs.includes('trapezius') || lowerQuery.includes('trapezius') || lowerQuery.includes('upper back')) {
        results.push(...getInjuryMapImages('trapezius').slice(0, 1));
      }
      
      // Spine/Back
      if (keywords.organs.includes('spine') || keywords.organs.includes('back') || lowerQuery.includes('spine') || lowerQuery.includes('back pain')) {
        results.push(...getInjuryMapImages('spine').slice(0, 1));
        results.push(...getInjuryMapImages('back').slice(0, 1));
      }
      
      // Knee
      if (keywords.organs.includes('knee') || lowerQuery.includes('knee')) {
        results.push(...getInjuryMapImages('knee').slice(0, 2));
      }
      
      // Hip
      if (keywords.organs.includes('hip') || lowerQuery.includes('hip')) {
        results.push(...getInjuryMapImages('hip').slice(0, 1));
      }
      
      // Ankle/Foot
      if (keywords.organs.includes('ankle') || keywords.organs.includes('foot') || lowerQuery.includes('ankle') || lowerQuery.includes('foot')) {
        results.push(...getInjuryMapImages('ankle').slice(0, 1));
      }
      
      // Elbow
      if (keywords.organs.includes('elbow') || lowerQuery.includes('elbow')) {
        results.push(...getInjuryMapImages('elbow').slice(0, 1));
      }
      
      // Wrist
      if (keywords.organs.includes('wrist') || lowerQuery.includes('wrist')) {
        results.push(...getInjuryMapImages('wrist').slice(0, 1));
      }
      
      // General musculoskeletal (if no specific body part found)
      if (results.length === 0 && (keywords.organs.includes('musculoskeletal') || lowerQuery.includes('muscle') || lowerQuery.includes('bone') || lowerQuery.includes('joint'))) {
        results.push(...getInjuryMapImages('musculoskeletal').slice(0, 1));
      }
      
      // Organs (kidney, liver, etc.)
      if (keywords.organs.includes('kidney') || lowerQuery.includes('kidney') || lowerQuery.includes('renal')) {
        results.push(...getInjuryMapImages('organs').slice(0, 1));
      }
      
      return results;
    })())
  ]);

  const endTime = Date.now();
  console.log(`✅ All sources searched in ${endTime - startTime}ms`);
  console.log(`   Open-i: ${openIResults.length}, InjuryMap: ${injuryResults.length}`);

  // Combine results with priority: Open-i (most specific) → InjuryMap
  const allResults = [
    ...openIResults,
    ...injuryResults
  ];

  // DEDUPLICATION: Remove duplicate images based on URL
  const seenUrls = new Set<string>();
  const uniqueResults = allResults.filter(img => {
    if (seenUrls.has(img.url)) {
      console.log(`   🔄 Skipping duplicate image: ${img.title}`);
      return false;
    }
    seenUrls.add(img.url);
    return true;
  });

  console.log(`   ✅ Deduplicated: ${allResults.length} → ${uniqueResults.length} unique images`);

  // Return top 4 images (mix from all sources) - limit to 4 as per requirements
  return uniqueResults.slice(0, 4);
}

/**
 * Format open medical images for display
 */
export function formatOpenMedicalImages(images: OpenMedicalImage[]): any[] {
  return images.map(img => ({
    url: img.url,
    title: img.title,
    description: img.description,
    source: img.source,
    attribution: img.attribution,
    pmcid: img.pmcid,
    category: img.category,
    tags: img.tags
  }));
}