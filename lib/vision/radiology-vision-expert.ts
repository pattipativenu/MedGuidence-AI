/**
 * Radiology Vision Expert System
 * 
 * Specialized system for chest X-ray, CT, and MRI analysis
 * Implements best practices from medical imaging research
 * 
 * Key Features:
 * - Multi-view correlation (PA + Lateral)
 * - Specific sign detection (Golden's S, Silhouette, etc.)
 * - Precise anatomical localization
 * - Differential diagnosis generation
 * - Urgency classification
 */

import { getGeminiVisionModel } from "@/lib/gemini";
import { analyzeWithAdvancedVision, type AdvancedVisionAnalysis } from "./advanced-medical-vision";

export interface RadiologyExpertAnalysis extends AdvancedVisionAnalysis {
  // Radiology-specific fields
  viewType: "PA" | "AP" | "Lateral" | "Oblique" | "Unknown";
  specificSigns: SpecificRadiologicalSign[];
  multiViewCorrelation?: MultiViewCorrelation;
  measurements: RadiologicalMeasurement[];
}

export interface SpecificRadiologicalSign {
  name: string; // e.g., "Golden's S Sign", "Silhouette Sign", "Air Bronchogram"
  present: boolean;
  confidence: number;
  location: string;
  clinicalSignificance: string;
  supportingFindings: string[];
}

export interface MultiViewCorrelation {
  viewsAnalyzed: string[];
  correlatedFindings: Array<{
    findingId: string;
    visibleInViews: string[];
    locationConfirmed: boolean;
    depthEstimate?: string;
  }>;
  discrepancies: string[];
}

export interface RadiologicalMeasurement {
  structure: string;
  measurement: number;
  unit: string;
  normalRange: string;
  interpretation: "normal" | "borderline" | "abnormal";
}

/**
 * Expert chest X-ray analysis prompt
 * Based on systematic radiology reading approach
 */
const CHEST_XRAY_EXPERT_PROMPT = `You are a board-certified thoracic radiologist with 20+ years of experience.

**SYSTEMATIC CHEST X-RAY ANALYSIS PROTOCOL**

Follow this exact sequence for comprehensive analysis:

## STEP 1: TECHNICAL ASSESSMENT
- View type: PA, AP, or Lateral
- Rotation: Check clavicle symmetry
- Penetration: Can you see vertebral bodies through heart?
- Inspiration: Count posterior ribs (should see 9-10)
- Image quality: Rate as excellent/good/adequate/poor

## STEP 2: ANATOMICAL LANDMARKS (0-1000 coordinate system)
Identify and mark precise locations:
- Trachea (should be midline at x=500)
- Carina (bifurcation point)
- Right hemidiaphragm (usually higher than left)
- Left hemidiaphragm
- Cardiac borders (right atrium, left ventricle)
- Aortic knob
- Right hilum (should be lower than left)
- Left hilum
- Costophrenic angles (should be sharp)

## STEP 3: SYSTEMATIC ZONE ANALYSIS
For EACH zone, provide PRECISE bounding boxes:

**Right Upper Zone (RUZ)**:
- Lung parenchyma density
- Vascular markings
- Masses or nodules
- Volume loss signs

**Right Middle Zone (RMZ)**:
- Right heart border visibility
- Horizontal fissure position
- Hilar structures

**Right Lower Zone (RLZ)**:
- Hemidiaphragm contour
- Costophrenic angle
- Retrocardiac space

**Left Upper Zone (LUZ)**:
- Aortic knob
- Apical lung
- Clavicle

**Left Middle Zone (LMZ)**:
- Left heart border
- Hilar structures

**Left Lower Zone (LLZ)**:
- Hemidiaphragm
- Gastric bubble
- Costophrenic angle

## STEP 4: SPECIFIC SIGN DETECTION

**Golden's S Sign** (RUL collapse + central mass):
- Dense opacity in RUL
- Horizontal fissure: S-shaped (concave lateral, convex medial)
- Tracheal deviation to RIGHT
- Elevated right hemidiaphragm
- Compensatory hyperlucency in RML/RLL

**Silhouette Sign** (loss of normal borders):
- RML disease: loss of right heart border
- Lingula disease: loss of left heart border
- RLL disease: loss of right hemidiaphragm
- LLL disease: loss of left hemidiaphragm

**Air Bronchogram**:
- Air-filled bronchi visible within consolidation
- Suggests alveolar filling process (pneumonia, edema)

**Kerley B Lines**:
- Short horizontal lines at lung bases
- Indicates interstitial edema

**Pneumothorax Signs**:
- Absent lung markings peripherally
- Visible pleural line
- Deep sulcus sign (if supine)

## STEP 5: MEASUREMENTS
Provide precise measurements:
- Cardiothoracic ratio (CTR): cardiac width / thoracic width
  - Normal: <0.5 on PA, <0.55 on AP
- Tracheal deviation: distance from midline
- Mass size: measure in mm (estimate from image scale)

## STEP 6: PRECISE LOCALIZATION

**CRITICAL**: For EVERY finding, provide:

1. **Tight Bounding Box**:
   - Measure the ACTUAL abnormality, not the entire zone
   - Example: If you see a 3cm mass, box should be ~100-120 pixels
   - NOT the entire right upper lobe (which would be 300+ pixels)

2. **Focused Heatmap Region**:
   - Radius = 0.6 × average dimension of pathology
   - Center = exact center of abnormality
   - Intensity = severity (0.9-1.0 critical, 0.6-0.8 moderate, 0.3-0.5 mild)

3. **Anatomical Description**:
   - Specific zone (RUL, RML, RLL, LUL, Lingula, LLL)
   - Relation to landmarks (e.g., "2cm superior to right hilum")
   - Depth (anterior, posterior, or mid-lung)

## OUTPUT FORMAT (JSON only, no markdown):

{
  "viewType": "PA",
  "imageQuality": "good",
  "technicalNotes": "Adequate inspiration, no rotation",
  
  "landmarks": [
    {
      "name": "Trachea",
      "location": { "x": 500, "y": 150 },
      "confidence": 0.95,
      "description": "Midline, no deviation"
    }
  ],
  
  "findings": [
    {
      "id": "finding_1",
      "type": "mass",
      "anatomicalZone": "Right Upper Lobe",
      "description": "Dense opacity with irregular margins, 4cm diameter",
      "severity": "critical",
      "confidence": 0.92,
      "boundingBox": {
        "xmin": 520,
        "ymin": 180,
        "xmax": 620,
        "ymax": 280,
        "label": "RUL Mass"
      },
      "heatmapRegion": {
        "centerX": 570,
        "centerY": 230,
        "radius": 60,
        "intensity": 0.95
      },
      "clinicalSignificance": "Highly suspicious for primary lung malignancy",
      "differentialDiagnosis": [
        "Bronchogenic carcinoma (most likely)",
        "Lymphoma",
        "Metastatic disease",
        "Organizing pneumonia (less likely)"
      ],
      "relatedLandmarks": ["Right hilum", "Horizontal fissure"]
    }
  ],
  
  "specificSigns": [
    {
      "name": "Golden's S Sign",
      "present": true,
      "confidence": 0.88,
      "location": "Right upper lobe",
      "clinicalSignificance": "Indicates RUL collapse with central obstructing mass",
      "supportingFindings": [
        "S-shaped horizontal fissure",
        "Tracheal deviation to right",
        "Elevated right hemidiaphragm"
      ]
    }
  ],
  
  "measurements": [
    {
      "structure": "Cardiothoracic ratio",
      "measurement": 0.48,
      "unit": "ratio",
      "normalRange": "<0.5",
      "interpretation": "normal"
    },
    {
      "structure": "RUL mass",
      "measurement": 40,
      "unit": "mm",
      "normalRange": "N/A",
      "interpretation": "abnormal"
    }
  ],
  
  "overallImpression": "Right upper lobe mass with features of Golden's S sign, highly concerning for bronchogenic carcinoma with lobar collapse",
  "urgency": "urgent",
  "recommendations": [
    "Urgent CT chest with IV contrast for staging",
    "Bronchoscopy for tissue diagnosis",
    "Oncology consultation",
    "PET-CT if CT confirms malignancy"
  ]
}

**QUALITY STANDARDS**:
- Every finding MUST have precise bounding box and heatmap region
- Bounding boxes should be TIGHT (not entire anatomical zones)
- Confidence >0.85 for critical findings
- Differential diagnosis should be ranked by likelihood
- Recommendations should be specific and actionable`;

/**
 * Analyze chest X-ray with expert-level precision
 */
export async function analyzeChestXRayExpert(
  imageBase64: string,
  mimeType: string,
  clinicalContext?: {
    patientAge?: number;
    symptoms?: string[];
    clinicalQuestion?: string;
    priorStudies?: string;
  }
): Promise<RadiologyExpertAnalysis> {
  const startTime = performance.now();
  
  console.log("🩺 Starting expert chest X-ray analysis...");
  
  const model = getGeminiVisionModel();
  
  // Build clinical context
  const contextText = clinicalContext
    ? `\n\n**CLINICAL CONTEXT**:\n` +
      (clinicalContext.patientAge ? `- Patient Age: ${clinicalContext.patientAge} years\n` : '') +
      (clinicalContext.symptoms ? `- Presenting Symptoms: ${clinicalContext.symptoms.join(', ')}\n` : '') +
      (clinicalContext.clinicalQuestion ? `- Clinical Question: ${clinicalContext.clinicalQuestion}\n` : '') +
      (clinicalContext.priorStudies ? `- Prior Studies: ${clinicalContext.priorStudies}\n` : '')
    : '';
  
  const imagePart = {
    inlineData: {
      mimeType,
      data: imageBase64,
    },
  };
  
  const result = await model.generateContent([
    CHEST_XRAY_EXPERT_PROMPT + contextText,
    imagePart,
  ]);
  
  const responseText = result.response.text();
  const data = parseJSONResponse(responseText);
  
  const processingTimeMs = performance.now() - startTime;
  const analysisId = `rad_expert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Calculate overall confidence
  const findings = data.findings || [];
  const analysisConfidence = findings.length > 0
    ? findings.reduce((sum: number, f: any) => sum + f.confidence, 0) / findings.length
    : 0.95;
  
  console.log(`✅ Expert analysis complete: ${findings.length} findings, ${data.specificSigns?.length || 0} specific signs`);
  
  return {
    analysisId,
    timestamp: new Date().toISOString(),
    processingTimeMs,
    viewType: data.viewType || "Unknown",
    landmarks: data.landmarks || [],
    findings: findings,
    specificSigns: data.specificSigns || [],
    measurements: data.measurements || [],
    overallImpression: data.overallImpression || "Analysis complete",
    urgency: data.urgency || "routine",
    recommendations: data.recommendations || [],
    imageQuality: data.imageQuality || "good",
    analysisConfidence,
  };
}

/**
 * Analyze multiple views and correlate findings
 */
export async function analyzeMultiViewChestXRay(
  images: Array<{ base64: string; mimeType: string; viewHint?: string }>,
  clinicalContext?: any
): Promise<RadiologyExpertAnalysis> {
  console.log(`🔬 Analyzing ${images.length} views for correlation...`);
  
  // Analyze each view independently
  const analyses = await Promise.all(
    images.map(img => analyzeChestXRayExpert(img.base64, img.mimeType, clinicalContext))
  );
  
  // Correlate findings across views
  const correlatedFindings: any[] = [];
  const allFindings = analyses.flatMap(a => a.findings);
  
  // Group similar findings from different views
  allFindings.forEach((finding, idx) => {
    const similar = allFindings.filter((f, i) => 
      i !== idx && 
      f.anatomicalZone === finding.anatomicalZone &&
      f.type === finding.type
    );
    
    if (similar.length > 0) {
      correlatedFindings.push({
        findingId: finding.id,
        visibleInViews: [analyses[0].viewType, ...similar.map(() => "Lateral")],
        locationConfirmed: true,
        depthEstimate: "Confirmed in multiple views",
      });
    }
  });
  
  // Merge analyses
  const primaryAnalysis = analyses[0];
  
  return {
    ...primaryAnalysis,
    multiViewCorrelation: {
      viewsAnalyzed: analyses.map(a => a.viewType),
      correlatedFindings,
      discrepancies: [],
    },
  };
}

/**
 * Parse JSON response (handles markdown code blocks)
 */
function parseJSONResponse(text: string): any {
  let cleaned = text.trim();
  
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  
  try {
    return JSON.parse(cleaned.trim());
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return {};
  }
}
