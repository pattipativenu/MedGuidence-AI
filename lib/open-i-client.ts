/**
 * Open-i (NLM) API Client
 * 
 * Open-i is an open-access biomedical image search engine from the National Library of Medicine.
 * It provides image-centric search with text filters across biomedical articles and collections.
 * 
 * API Documentation: https://openi.nlm.nih.gov/services
 * 
 * Supports:
 * - Image modalities: X-ray, CT, MRI, microscopy, ultrasound, photographs, PET, graphics
 * - Collections: PubMed Central, Chest X-rays, Orthopedic Anatomy, History of Medicine, MedPix
 * - Article types: Research, Review, Case Report, Systematic Review, Radiology Report
 * - Specialties: 25+ medical specialties (cardiology, infectious diseases, neurology, etc.)
 * - Search fields: Titles, abstracts, MeSH terms, captions, authors
 * - Ranking: Newest, oldest, diagnosis, treatment, prognosis, prevention
 * - Licensing: Creative Commons variants for reusable content
 */

export interface OpenISearchParams {
    query: string;
    maxResults?: number; // n parameter (default: 10)
    startIndex?: number; // m parameter (default: 1)
    
    // Collection (coll parameter)
    collection?: 'pmc' | 'cxr' | 'usc' | 'hmd' | 'mpx' | 'all';
    // pmc: PubMed Central | cxr: Indiana U. Chest X-rays | usc: USC Orthopedic Surgical Anatomy
    // hmd: Images from History of Medicine (NLM) | mpx: MedPix
    
    // Image Type (it parameter)
    imageType?: 'xg' | 'xm' | 'x' | 'u' | 'ph' | 'p' | 'mc' | 'm' | 'g' | 'c';
    // xg: Exclude Graphics | xm: Exclude Multipanel | x: X-ray | u: Ultrasound
    // ph: Photographs | p: PET | mc: Microscopy | m: MRI | g: Graphics | c: CT Scan
    
    // Article Type (at parameter)
    articleType?: 'ab' | 'bk' | 'bf' | 'cr' | 'dp' | 'di' | 'ed' | 'ib' | 'in' | 'lt' | 'mr' | 'ma' | 'ne' | 'ob' | 'pr' | 'or' | 're' | 'ra' | 'rw' | 'sr' | 'rr' | 'os' | 'hs' | 'ot';
    // ra: Research Article | rw: Review Article | cr: Case Report | sr: Systematic Review
    // rr: Radiology Report | os: Orthopedic Slide | hs: Historical Slide
    
    // Specialty (sp parameter)
    specialty?: 'b' | 'bc' | 'c' | 'ca' | 'cc' | 'd' | 'de' | 'dt' | 'e' | 'en' | 'eh' | 'f' | 'g' | 'ge' | 'gr' | 'gy' | 'h' | 'id' | 'im' | 'n' | 'ne' | 'nu' | 'o' | 'or' | 'ot' | 'p' | 'py' | 'pu' | 'r' | 's' | 't' | 'u' | 'v' | 'vi';
    // ca: Cardiology | id: Infectious Diseases | n: Nephrology | ne: Neurology
    // r: Rheumatology | or: Orthopedics | ot: Otolaryngology | s: Surgery
    
    // Rank By (favor parameter)
    rankBy?: 'r' | 'o' | 'd' | 'e' | 'g' | 'oc' | 'pr' | 'pg' | 't';
    // r: Newest | o: Oldest | d: Diagnosis | e: Etiology | g: Genetic
    // oc: Outcome | pr: Prevention | pg: Prognosis | t: Treatment
    
    // Search In (fields parameter)
    searchIn?: 't' | 'm' | 'ab' | 'msh' | 'c' | 'a';
    // t: Titles | m: Mentions | ab: Abstracts | msh: MeSH | c: Captions | a: Authors
    
    // License Type (lic parameter)
    license?: 'by' | 'bync' | 'byncnd' | 'byncsa';
    // by: Attribution | bync: Attribution NonCommercial
    // byncnd: Attribution NonCommercial NoDerivatives | byncsa: Attribution NonCommercial ShareAlike
    
    // Subset (sub parameter)
    subset?: 'b' | 'c' | 'e' | 's' | 'x';
    // b: Basic Science | c: Clinical Journals | e: Ethics | s: Systematic Reviews | x: Chest X-rays
    
    // Video (vid parameter)
    video?: 0 | 1; // 0: No | 1: Yes
}

export interface OpenIImage {
    id: string;
    title: string;
    abstract: string;
    imgLarge: string;
    imgThumb: string;
    pmcid?: string;
    modality?: string;
    source: string;
    attribution: string;
    license?: string; // License information (e.g., "CC BY 4.0", "Public Domain")
    articleType?: string;
    specialty?: string;
}

/**
 * Search Open-i with comprehensive filters
 * Uses Open-i Search API: GET https://openi.nlm.nih.gov/api/search
 */
export async function searchOpenI(params: OpenISearchParams): Promise<OpenIImage[]> {
    try {
        const {
            query,
            maxResults = 10,
            startIndex = 1,
            collection = 'pmc',
            imageType = 'xg', // Default to graphics/diagrams (exclude graphics for photos)
            articleType,
            specialty,
            rankBy = 'r', // Default to newest first
            searchIn = 't', // Default to search in titles
            license,
            subset,
            video
        } = params;

        // Build API URL with proper parameters
        const apiUrl = new URL('https://openi.nlm.nih.gov/api/search');
        
        // Required parameters
        apiUrl.searchParams.set('query', query);
        apiUrl.searchParams.set('m', startIndex.toString()); // Start index
        apiUrl.searchParams.set('n', maxResults.toString()); // Max results
        
        // Image type filter (CRITICAL for anatomy diagrams)
        if (imageType) {
            apiUrl.searchParams.set('it', imageType);
        }
        
        // Collection filter
        if (collection && collection !== 'all') {
            apiUrl.searchParams.set('coll', collection);
        }
        
        // Article type filter (research, review, case report, etc.)
        if (articleType) {
            apiUrl.searchParams.set('at', articleType);
        }
        
        // Specialty filter (cardiology, infectious diseases, etc.)
        if (specialty) {
            apiUrl.searchParams.set('sp', specialty);
        }
        
        // Ranking preference (newest, oldest, diagnosis, treatment)
        if (rankBy) {
            apiUrl.searchParams.set('favor', rankBy);
        }
        
        // Search field filter (titles, abstracts, MeSH, captions)
        if (searchIn) {
            apiUrl.searchParams.set('fields', searchIn);
        }
        
        // License filter (open access)
        if (license) {
            apiUrl.searchParams.set('lic', license);
        }
        
        // Subset filter (basic science, clinical, systematic reviews, chest X-rays)
        if (subset) {
            apiUrl.searchParams.set('sub', subset);
        }
        
        // Video filter (0 or 1)
        if (video !== undefined) {
            apiUrl.searchParams.set('vid', video.toString());
        }

        console.log(`🔍 Open-i API: ${apiUrl.toString()}`);

        const response = await fetch(apiUrl.toString(), {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn(`Open-i API returned ${response.status}`);
            return [];
        }

        const data = await response.json();

        if (!data.list || data.list.length === 0) {
            console.log(`📭 No Open-i results for: "${query}"`);
            return [];
        }

        const images: OpenIImage[] = data.list.map((item: any) => {
            // Handle relative URLs from Open-i
            let imageUrl = item.imgLarge || item.imgThumb;
            if (imageUrl && imageUrl.startsWith('/')) {
                imageUrl = `https://openi.nlm.nih.gov${imageUrl}`;
            }
            
            let thumbUrl = item.imgThumb;
            if (thumbUrl && thumbUrl.startsWith('/')) {
                thumbUrl = `https://openi.nlm.nih.gov${thumbUrl}`;
            }

            return {
                id: `openi-${item.pmcid || Math.random().toString(36).substr(2, 9)}`,
                title: item.title || 'Medical Image',
                abstract: item.abstract || item.title || 'Biomedical image from PubMed Central',
                imgLarge: imageUrl,
                imgThumb: thumbUrl || imageUrl,
                pmcid: item.pmcid,
                modality: item.modality,
                source: 'Open-i (NLM)',
                attribution: 'Image from Open-i, National Library of Medicine (https://openi.nlm.nih.gov). Free for reuse with attribution.',
                license: item.license || 'Free for reuse with attribution', // Extract license from API or use default
                articleType: item.articleType,
                specialty: item.specialty
            };
        });

        console.log(`✅ Found ${images.length} Open-i images for "${query}"`);
        return images;

    } catch (error) {
        console.error('Error searching Open-i:', error);
        return [];
    }
}

/**
 * Search Open-i for multiple queries (one per teaching panel)
 */
export async function searchOpenIMultiPanel(queries: { query: string, specialty?: string }[]): Promise<Map<string, OpenIImage[]>> {
    const results = new Map<string, OpenIImage[]>();

    for (const { query, specialty } of queries) {
        const images = await searchOpenI({
            query,
            maxResults: 2, // 2 images per panel
            imageType: 'xg', // Graphics/diagrams preferred for teaching
            specialty: specialty as any
        });

        results.set(query, images);
    }

    return results;
}

/**
 * Search Open-i for anatomy diagrams
 * Optimized for educational anatomy illustrations
 */
export async function searchOpenIAnatomy(bodyPart: string): Promise<OpenIImage[]> {
    return searchOpenI({
        query: `${bodyPart} anatomy`,
        maxResults: 3,
        imageType: 'xg', // Graphics/diagrams only (exclude photos)
        searchIn: 't', // Search in titles for better accuracy
        rankBy: 'r', // Newest first
        collection: 'pmc' // PubMed Central for quality
    });
}

/**
 * Search Open-i for pathology/disease images
 * Optimized for clinical pathology and disease illustrations
 */
export async function searchOpenIPathology(condition: string, specialty?: string): Promise<OpenIImage[]> {
    return searchOpenI({
        query: `${condition} pathophysiology`,
        maxResults: 3,
        imageType: 'xg', // Graphics/diagrams
        articleType: 'rw', // Review articles preferred
        searchIn: 'ab', // Search in abstracts for context
        rankBy: 'r', // Newest first
        specialty: specialty as any,
        collection: 'pmc'
    });
}

/**
 * Search Open-i for radiology images
 * Optimized for X-ray, CT, MRI, ultrasound images
 */
export async function searchOpenIRadiology(query: string, modality?: 'x' | 'm' | 'u'): Promise<OpenIImage[]> {
    return searchOpenI({
        query,
        maxResults: 3,
        imageType: modality || 'x', // X-ray by default
        articleType: 'rr', // Radiology reports
        specialty: 'r', // Radiology specialty
        searchIn: 't', // Search in titles
        rankBy: 'r', // Newest first
        subset: 'x' // Chest X-rays subset if applicable
    });
}

/**
 * Search Open-i for systematic review figures
 * Optimized for high-quality evidence-based diagrams
 */
export async function searchOpenISystematicReviews(topic: string): Promise<OpenIImage[]> {
    return searchOpenI({
        query: topic,
        maxResults: 3,
        imageType: 'xg', // Graphics/diagrams
        articleType: 'sr', // Systematic reviews
        searchIn: 't', // Search in titles
        rankBy: 'r', // Newest first
        subset: 's', // Systematic reviews subset
        collection: 'pmc'
    });
}

/**
 * Search Open-i for microscopy images
 * Optimized for cellular/tissue pathology images
 */
export async function searchOpenIMicroscopy(condition: string, specialty?: string): Promise<OpenIImage[]> {
    return searchOpenI({
        query: condition,
        maxResults: 3,
        imageType: 'mc', // Microscopy
        articleType: 'ra', // Research articles
        searchIn: 'c', // Search in captions for context
        rankBy: 'd', // Diagnosis-ranked
        specialty: specialty as any,
        collection: 'pmc'
    });
}

/**
 * Search Open-i for CT scan images
 * Optimized for computed tomography images
 */
export async function searchOpenICT(query: string, specialty?: string): Promise<OpenIImage[]> {
    return searchOpenI({
        query,
        maxResults: 3,
        imageType: 'c', // CT scans
        articleType: 'rr', // Radiology reports
        specialty: specialty as any,
        searchIn: 't', // Search in titles
        rankBy: 'r', // Newest first
        collection: 'pmc'
    });
}

/**
 * Search Open-i for ultrasound images
 * Optimized for ultrasound/sonography images
 */
export async function searchOpenIUltrasound(query: string): Promise<OpenIImage[]> {
    return searchOpenI({
        query,
        maxResults: 3,
        imageType: 'u', // Ultrasound
        articleType: 'rr', // Radiology reports
        specialty: 'r', // Radiology
        searchIn: 't', // Search in titles
        rankBy: 'r', // Newest first
        collection: 'pmc'
    });
}

/**
 * Search Open-i for treatment-focused images
 * Optimized for treatment algorithms and clinical decision support
 */
export async function searchOpenITreatment(condition: string): Promise<OpenIImage[]> {
    return searchOpenI({
        query: `${condition} treatment algorithm`,
        maxResults: 3,
        imageType: 'xg', // Graphics/diagrams
        articleType: 'rw', // Review articles
        searchIn: 't', // Search in titles
        rankBy: 't', // Treatment-ranked
        collection: 'pmc'
    });
}

/**
 * Search Open-i for diagnosis-focused images
 * Optimized for diagnostic criteria and decision trees
 */
export async function searchOpenIDiagnosis(condition: string): Promise<OpenIImage[]> {
    return searchOpenI({
        query: `${condition} diagnosis criteria`,
        maxResults: 3,
        imageType: 'xg', // Graphics/diagrams
        articleType: 'rw', // Review articles
        searchIn: 'ab', // Search in abstracts for context
        rankBy: 'd', // Diagnosis-ranked
        collection: 'pmc'
    });
}

/**
 * Search Open-i for case report images
 * Optimized for clinical case presentations
 */
export async function searchOpenICaseReports(condition: string, modality?: 'x' | 'm' | 'c' | 'u'): Promise<OpenIImage[]> {
    return searchOpenI({
        query: condition,
        maxResults: 3,
        imageType: modality || 'xg', // Specified modality or graphics
        articleType: 'cr', // Case reports
        searchIn: 'c', // Search in captions
        rankBy: 'r', // Newest first
        collection: 'pmc'
    });
}

/**
 * Search Open-i for MedPix teaching images
 * Optimized for clinical teaching and education
 */
export async function searchOpenIMedPix(condition: string): Promise<OpenIImage[]> {
    return searchOpenI({
        query: condition,
        maxResults: 3,
        imageType: 'ph', // Photographs (MedPix has clinical photos)
        collection: 'mpx', // MedPix collection
        searchIn: 't', // Search in titles
        rankBy: 't', // Treatment-ranked
        license: 'by' // Attribution license for reuse
    });
}

/**
 * Search Open-i for chest X-rays
 * Optimized for chest radiography from curated collection
 */
export async function searchOpenIChestXray(condition: string): Promise<OpenIImage[]> {
    return searchOpenI({
        query: condition,
        maxResults: 3,
        imageType: 'x', // X-ray
        collection: 'cxr', // Chest X-ray collection
        subset: 'x', // Chest X-rays subset
        searchIn: 'c', // Search in captions
        rankBy: 'd', // Diagnosis-ranked
        license: 'by' // Attribution license
    });
}

/**
 * Search Open-i for orthopedic anatomy
 * Optimized for surgical anatomy from USC collection
 */
export async function searchOpenIOrthopedicAnatomy(bodyPart: string): Promise<OpenIImage[]> {
    return searchOpenI({
        query: `${bodyPart} anatomy`,
        maxResults: 3,
        collection: 'usc', // USC Orthopedic Surgical Anatomy
        imageType: 'ph', // Photographs
        specialty: 'or', // Orthopedics
        searchIn: 't', // Search in titles
        rankBy: 'r' // Newest first
    });
}

/**
 * ============================================================================
 * OPEN-I ARTICLE SEARCH (Evidence Source Integration)
 * ============================================================================
 * 
 * Open-i is not just for images - it indexes full articles from PubMed Central
 * with rich metadata including article types, specialties, and full abstracts.
 * 
 * This section provides article search functionality for evidence gathering.
 */

export interface OpenIArticle {
    id: string;
    pmcid?: string;
    pmid?: string;
    title: string;
    abstract: string;
    authors: string;
    journal: string;
    year: string;
    articleType: string; // Research Article, Case Report, Review, etc.
    specialty?: string;
    url: string;
    source: string; // Always "Open-i (NLM)"
}

/**
 * Search Open-i for articles (not images)
 * Returns article metadata for evidence gathering
 * 
 * @param query - Clinical query
 * @param maxResults - Maximum number of articles to return (default: 5)
 * @param options - Optional search parameters
 */
export async function searchOpenIArticles(
    query: string,
    maxResults: number = 5,
    options?: {
        articleType?: 'ra' | 'rw' | 'cr' | 'sr' | 'rr'; // Research, Review, Case Report, Systematic Review, Radiology Report
        specialty?: string;
        rankBy?: 'r' | 'd' | 't'; // Newest, Diagnosis, Treatment
    }
): Promise<OpenIArticle[]> {
    try {
        const apiUrl = new URL('https://openi.nlm.nih.gov/api/search');
        
        // Required parameters
        apiUrl.searchParams.set('query', query);
        apiUrl.searchParams.set('m', '1'); // Start index
        apiUrl.searchParams.set('n', maxResults.toString());
        
        // Collection: PubMed Central for articles
        apiUrl.searchParams.set('coll', 'pmc');
        
        // Search in titles and abstracts for better article matching
        apiUrl.searchParams.set('fields', 'ab'); // Abstracts
        
        // Optional filters
        if (options?.articleType) {
            apiUrl.searchParams.set('at', options.articleType);
        }
        
        if (options?.specialty) {
            apiUrl.searchParams.set('sp', options.specialty);
        }
        
        if (options?.rankBy) {
            apiUrl.searchParams.set('favor', options.rankBy);
        } else {
            apiUrl.searchParams.set('favor', 'r'); // Default to newest
        }

        console.log(`🔍 Open-i Articles API: ${apiUrl.toString()}`);

        const response = await fetch(apiUrl.toString(), {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn(`Open-i Articles API returned ${response.status}`);
            return [];
        }

        const data = await response.json();

        if (!data.list || data.list.length === 0) {
            console.log(`📭 No Open-i articles for: "${query}"`);
            return [];
        }

        const articles: OpenIArticle[] = data.list.map((item: any) => {
            // Extract PMCID and PMID
            const pmcid = item.pmcid || item.id;
            const pmid = item.pmid;
            
            // Build URL (prefer PMC, fallback to PubMed)
            let url = '';
            if (pmcid) {
                url = `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`;
            } else if (pmid) {
                url = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
            }
            
            // Extract article type
            const articleTypeMap: Record<string, string> = {
                'ra': 'Research Article',
                'rw': 'Review Article',
                'cr': 'Case Report',
                'sr': 'Systematic Review',
                'rr': 'Radiology Report',
                'os': 'Orthopedic Slide',
                'hs': 'Historical Slide'
            };
            const articleType = articleTypeMap[item.articleType] || 'Article';
            
            // Extract year from publication date
            const year = item.year || new Date().getFullYear().toString();
            
            return {
                id: `openi-${pmcid || pmid || Math.random().toString(36).slice(2, 9)}`,
                pmcid,
                pmid,
                title: item.title || 'Untitled Article',
                abstract: item.abstract || item.title || '',
                authors: item.authors || 'Authors not available',
                journal: item.journal || 'Journal not available',
                year,
                articleType,
                specialty: item.specialty,
                url,
                source: 'Open-i (NLM)'
            };
        });

        console.log(`✅ Found ${articles.length} Open-i articles for "${query}"`);
        return articles;

    } catch (error) {
        console.error('Error searching Open-i articles:', error);
        return [];
    }
}

/**
 * Search Open-i for research articles
 * Optimized for original research and clinical studies
 */
export async function searchOpenIResearchArticles(query: string, maxResults: number = 5): Promise<OpenIArticle[]> {
    return searchOpenIArticles(query, maxResults, {
        articleType: 'ra', // Research articles
        rankBy: 'r' // Newest first
    });
}

/**
 * Search Open-i for review articles
 * Optimized for comprehensive reviews and meta-analyses
 */
export async function searchOpenIReviewArticles(query: string, maxResults: number = 5): Promise<OpenIArticle[]> {
    return searchOpenIArticles(query, maxResults, {
        articleType: 'rw', // Review articles
        rankBy: 'r' // Newest first
    });
}

/**
 * Search Open-i for systematic reviews
 * Optimized for evidence-based systematic reviews
 */
export async function searchOpenISystematicReviewArticles(query: string, maxResults: number = 3): Promise<OpenIArticle[]> {
    return searchOpenIArticles(query, maxResults, {
        articleType: 'sr', // Systematic reviews
        rankBy: 'r' // Newest first
    });
}

/**
 * Search Open-i for case reports
 * Optimized for clinical case presentations
 */
export async function searchOpenICaseReportArticles(query: string, maxResults: number = 3): Promise<OpenIArticle[]> {
    return searchOpenIArticles(query, maxResults, {
        articleType: 'cr', // Case reports
        rankBy: 'r' // Newest first
    });
}

/**
 * Search Open-i for radiology reports
 * Optimized for radiology and imaging reports
 */
export async function searchOpenIRadiologyReports(query: string, maxResults: number = 3): Promise<OpenIArticle[]> {
    return searchOpenIArticles(query, maxResults, {
        articleType: 'rr', // Radiology reports
        specialty: 'r', // Radiology specialty
        rankBy: 'd' // Diagnosis-ranked
    });
}

/**
 * Optimize query for Open-i API
 * Open-i works best with short, focused medical terms (2-5 words)
 * Extracts key medical concepts from long clinical queries
 */
function optimizeOpenIQuery(query: string): string {
    // If query is already short (< 50 chars), use as-is
    if (query.length < 50) {
        return query;
    }
    
    // Extract key medical terms using regex patterns
    const medicalTermPatterns = [
        // Diseases and conditions (capitalized medical terms)
        /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g,
        // Common medical abbreviations
        /\b(MRI|CT|X-ray|EKG|ECG|PET|SPECT|ultrasound|biopsy|scan|imaging)\b/gi,
        // Anatomical terms
        /\b(brain|heart|lung|liver|kidney|bone|spine|chest|abdomen|pelvis|head|neck|extremity|joint)\b/gi,
        // Pathology terms
        /\b(tumor|cancer|fracture|lesion|mass|nodule|cyst|hemorrhage|infarct|edema|stenosis|occlusion)\b/gi,
        // Specific diagnoses
        /\b(meningioma|glioma|lymphoma|carcinoma|sarcoma|melanoma|leukemia|pneumonia|sepsis|stroke|MI|PE|DVT)\b/gi
    ];
    
    const extractedTerms: string[] = [];
    
    for (const pattern of medicalTermPatterns) {
        const matches = query.match(pattern);
        if (matches) {
            extractedTerms.push(...matches);
        }
    }
    
    // Remove duplicates and limit to top 3-5 terms
    const uniqueTerms = [...new Set(extractedTerms.map(t => t.toLowerCase()))];
    
    // Prioritize specific diagnoses and anatomical locations
    const priorityTerms = uniqueTerms.filter(term => 
        term.includes('oma') || // tumors
        term.includes('fracture') ||
        term.includes('infarct') ||
        term.includes('hemorrhage') ||
        term.includes('stenosis')
    );
    
    // Build optimized query (2-5 words max)
    let optimizedQuery = '';
    if (priorityTerms.length > 0) {
        optimizedQuery = priorityTerms.slice(0, 2).join(' ');
    } else if (uniqueTerms.length > 0) {
        optimizedQuery = uniqueTerms.slice(0, 3).join(' ');
    } else {
        // Fallback: take first 3-5 words from original query
        const words = query.split(/\s+/).filter(w => w.length > 3);
        optimizedQuery = words.slice(0, 4).join(' ');
    }
    
    console.log(`🔍 Open-i query optimization: "${query.slice(0, 100)}..." → "${optimizedQuery}"`);
    return optimizedQuery;
}

/**
 * Comprehensive Open-i article search
 * Searches multiple article types in parallel for maximum coverage
 * Automatically optimizes long queries for better Open-i API results
 */
export async function comprehensiveOpenIArticleSearch(query: string): Promise<{
    researchArticles: OpenIArticle[];
    reviewArticles: OpenIArticle[];
    systematicReviews: OpenIArticle[];
    caseReports: OpenIArticle[];
}> {
    // Optimize query for Open-i API (works best with short, focused terms)
    const optimizedQuery = optimizeOpenIQuery(query);
    
    console.log(`🔍 Open-i: Comprehensive article search for "${optimizedQuery}"`);
    
    const [researchArticles, reviewArticles, systematicReviews, caseReports] = await Promise.all([
        searchOpenIResearchArticles(optimizedQuery, 3),
        searchOpenIReviewArticles(optimizedQuery, 2),
        searchOpenISystematicReviewArticles(optimizedQuery, 2),
        searchOpenICaseReportArticles(optimizedQuery, 2)
    ]);
    
    console.log(`✅ Open-i articles: ${researchArticles.length} research, ${reviewArticles.length} reviews, ${systematicReviews.length} systematic reviews, ${caseReports.length} case reports`);
    
    return {
        researchArticles,
        reviewArticles,
        systematicReviews,
        caseReports
    };
}

/**
 * Format Open-i articles for AI prompt
 * Provides structured article metadata for evidence-based responses
 */
export function formatOpenIArticlesForPrompt(articles: {
    researchArticles: OpenIArticle[];
    reviewArticles: OpenIArticle[];
    systematicReviews: OpenIArticle[];
    caseReports: OpenIArticle[];
}): string {
    const totalArticles = 
        articles.researchArticles.length + 
        articles.reviewArticles.length + 
        articles.systematicReviews.length + 
        articles.caseReports.length;
    
    if (totalArticles === 0) return "";
    
    let formatted = "\n### ZONE 22: Open-i (NLM) Articles\n";
    formatted += "**SOURCE: Open-i - National Library of Medicine biomedical literature database**\n";
    formatted += "Open-i indexes articles from PubMed Central with rich metadata including article types, specialties, and full abstracts.\n\n";
    
    // Systematic Reviews (highest priority)
    if (articles.systematicReviews.length > 0) {
        formatted += "#### Systematic Reviews\n";
        articles.systematicReviews.forEach((article, idx) => {
            formatted += `\n**${idx + 1}. ${article.title}**\n`;
            formatted += `SOURCE: Open-i (NLM) | Article Type: ${article.articleType}\n`;
            if (article.pmcid) formatted += `PMCID: ${article.pmcid}\n`;
            if (article.pmid) formatted += `PMID: ${article.pmid}\n`;
            formatted += `Authors: ${article.authors}\n`;
            formatted += `Journal: ${article.journal} (${article.year})\n`;
            if (article.specialty) formatted += `Specialty: ${article.specialty}\n`;
            formatted += `URL: ${article.url}\n`;
            formatted += `Abstract: ${article.abstract.slice(0, 300)}${article.abstract.length > 300 ? '...' : ''}\n`;
            formatted += `[Open-i] - [Systematic Review]\n`;
        });
    }
    
    // Review Articles
    if (articles.reviewArticles.length > 0) {
        formatted += "\n#### Review Articles\n";
        articles.reviewArticles.forEach((article, idx) => {
            formatted += `\n**${idx + 1}. ${article.title}**\n`;
            formatted += `SOURCE: Open-i (NLM) | Article Type: ${article.articleType}\n`;
            if (article.pmcid) formatted += `PMCID: ${article.pmcid}\n`;
            if (article.pmid) formatted += `PMID: ${article.pmid}\n`;
            formatted += `Authors: ${article.authors}\n`;
            formatted += `Journal: ${article.journal} (${article.year})\n`;
            if (article.specialty) formatted += `Specialty: ${article.specialty}\n`;
            formatted += `URL: ${article.url}\n`;
            formatted += `Abstract: ${article.abstract.slice(0, 300)}${article.abstract.length > 300 ? '...' : ''}\n`;
            formatted += `[Open-i] - [Review Article]\n`;
        });
    }
    
    // Research Articles
    if (articles.researchArticles.length > 0) {
        formatted += "\n#### Research Articles\n";
        articles.researchArticles.forEach((article, idx) => {
            formatted += `\n**${idx + 1}. ${article.title}**\n`;
            formatted += `SOURCE: Open-i (NLM) | Article Type: ${article.articleType}\n`;
            if (article.pmcid) formatted += `PMCID: ${article.pmcid}\n`;
            if (article.pmid) formatted += `PMID: ${article.pmid}\n`;
            formatted += `Authors: ${article.authors}\n`;
            formatted += `Journal: ${article.journal} (${article.year})\n`;
            if (article.specialty) formatted += `Specialty: ${article.specialty}\n`;
            formatted += `URL: ${article.url}\n`;
            formatted += `Abstract: ${article.abstract.slice(0, 300)}${article.abstract.length > 300 ? '...' : ''}\n`;
            formatted += `[Open-i] - [Research Article]\n`;
        });
    }
    
    // Case Reports
    if (articles.caseReports.length > 0) {
        formatted += "\n#### Case Reports\n";
        articles.caseReports.forEach((article, idx) => {
            formatted += `\n**${idx + 1}. ${article.title}**\n`;
            formatted += `SOURCE: Open-i (NLM) | Article Type: ${article.articleType}\n`;
            if (article.pmcid) formatted += `PMCID: ${article.pmcid}\n`;
            if (article.pmid) formatted += `PMID: ${article.pmid}\n`;
            formatted += `Authors: ${article.authors}\n`;
            formatted += `Journal: ${article.journal} (${article.year})\n`;
            if (article.specialty) formatted += `Specialty: ${article.specialty}\n`;
            formatted += `URL: ${article.url}\n`;
            formatted += `Abstract: ${article.abstract.slice(0, 300)}${article.abstract.length > 300 ? '...' : ''}\n`;
            formatted += `[Open-i] - [Case Report]\n`;
        });
    }
    
    formatted += "\n**CITATION INSTRUCTIONS FOR OPEN-I ARTICLES:**\n";
    formatted += "- Use PMCID for PMC articles: https://www.ncbi.nlm.nih.gov/pmc/articles/[PMCID]/\n";
    formatted += "- Use PMID for PubMed articles: https://pubmed.ncbi.nlm.nih.gov/[PMID]/\n";
    formatted += "- Include article type badge: [Open-i] - [Systematic Review/Review Article/Research Article/Case Report]\n";
    formatted += "- Open-i articles are from PubMed Central and are typically open access\n\n";
    
    return formatted;
}
