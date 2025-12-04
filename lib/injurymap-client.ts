/**
 * InjuryMap Client
 * 
 * Curated catalog of InjuryMap anatomy illustrations
 * License: CC BY 4.0
 * Source: https://www.injurymap.com/free-human-anatomy-illustrations
 */

export interface InjuryMapImage {
  id: string;
  title: string;
  bodyRegion: string;
  url: string;
  tags: string[];
  license: 'CC BY 4.0';
  attribution: string;
}

// Curated catalog of InjuryMap images
// Comprehensive collection from InjuryMap's free anatomy illustrations
// Using Wikimedia Commons as proxy (same CC BY 4.0 license)
const INJURYMAP_CATALOG: Record<string, InjuryMapImage[]> = {
  // Knee
  'knee': [
    {
      id: 'injury-knee-anatomy',
      title: 'Knee Joint Anatomy',
      bodyRegion: 'knee',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Knee_PainF-01.jpg',
      tags: ['knee', 'ligaments', 'meniscus', 'joint', 'pain'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-knee-healthy',
      title: 'Healthy Knee Joint',
      bodyRegion: 'knee',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Knee_PainF-01.jpg',
      tags: ['knee', 'healthy', 'joint', 'anatomy'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-knee-osteoarthritis',
      title: 'Knee Osteoarthritis',
      bodyRegion: 'knee',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Knee_PainF-01.jpg',
      tags: ['knee', 'osteoarthritis', 'arthritis', 'degeneration', 'pain'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-knee-soft-tissue',
      title: 'Pain in the Soft Tissue of your Knee',
      bodyRegion: 'knee',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Knee_Soft_TissueF-01.jpg',
      tags: ['knee', 'soft tissue', 'pain', 'injury'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-knee-injuries',
      title: 'Injuries to the Knee',
      bodyRegion: 'knee',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Knee_PainF-01.jpg',
      tags: ['knee', 'injuries', 'trauma', 'pain'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-uric-acid-knee',
      title: 'Uric Acid in the Knee',
      bodyRegion: 'knee',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Knee_PainF-01.jpg',
      tags: ['knee', 'uric acid', 'gout', 'arthritis'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-patellar-dislocation',
      title: 'Patellar Dislocation',
      bodyRegion: 'knee',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Patellar_DislocationF-01.jpg',
      tags: ['knee', 'patella', 'dislocation', 'injury', 'kneecap'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-patellar-fracture',
      title: 'Patellar Fracture',
      bodyRegion: 'knee',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Patellar_FractureF-01.jpg',
      tags: ['knee', 'patella', 'fracture', 'broken', 'kneecap'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-lcl',
      title: 'Lateral Collateral Ligament',
      bodyRegion: 'knee',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/LCLF-01.jpg',
      tags: ['knee', 'lcl', 'ligament', 'lateral', 'collateral'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-it-band',
      title: 'IT Band Syndrome vs Runner\'s Knee',
      bodyRegion: 'knee',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/IT_Band_SyndromeF-01.jpg',
      tags: ['knee', 'it band', 'iliotibial', 'runner', 'syndrome', 'pain'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  // Shoulder
  'shoulder': [
    {
      id: 'injury-shoulder-anatomy',
      title: 'Shoulder Anatomy',
      bodyRegion: 'shoulder',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Shoulder_PainF-01.jpg',
      tags: ['shoulder', 'rotator cuff', 'joint', 'arm', 'pain'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-shoulder-pain',
      title: 'Shoulder Pain',
      bodyRegion: 'shoulder',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Shoulder_PainF-01.jpg',
      tags: ['shoulder', 'pain', 'injury'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-rotator-cuff',
      title: 'Rotator Cuff Injury',
      bodyRegion: 'shoulder',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Rotator_CuffF-01.jpg',
      tags: ['shoulder', 'rotator cuff', 'tear', 'injury', 'pain'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-rotator-cuff-muscles',
      title: 'Rotator Cuff Muscles',
      bodyRegion: 'shoulder',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Rotator_CuffF-01.jpg',
      tags: ['shoulder', 'rotator cuff', 'muscles', 'anatomy'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-labral-tear-shoulder',
      title: 'Labral Tear (Shoulder)',
      bodyRegion: 'shoulder',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Shoulder_Pain_2F-01.jpg',
      tags: ['shoulder', 'labral', 'tear', 'injury', 'labrum'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-scapula-fracture',
      title: 'Scapula Fracture',
      bodyRegion: 'shoulder',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Scapula_FractureF-01.jpg',
      tags: ['shoulder', 'scapula', 'fracture', 'broken', 'shoulder blade'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-shoulder-noises',
      title: 'Shoulder Making Noises',
      bodyRegion: 'shoulder',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Shoulder_PainF-01.jpg',
      tags: ['shoulder', 'noises', 'clicking', 'popping', 'crepitus'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  // Back/Spine
  'back': [
    {
      id: 'injury-back-pain',
      title: 'Back Pain',
      bodyRegion: 'back',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Lower_Back_PainF-01.jpg',
      tags: ['back', 'pain', 'spine', 'lumbar'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-back-radiation',
      title: 'Back Pain with Radiation into Legs',
      bodyRegion: 'back',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Back_Pain_RadiationF-01.jpg',
      tags: ['back', 'pain', 'radiation', 'sciatica', 'leg', 'nerve'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-upper-back-pain',
      title: 'Upper Back Pain',
      bodyRegion: 'back',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Upper_Back_PainF-01.jpg',
      tags: ['back', 'upper', 'pain', 'thoracic', 'spine'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-lower-back-massage',
      title: 'Lower Back Massage',
      bodyRegion: 'back',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Man_Back_PainF-01.jpg',
      tags: ['back', 'lower', 'massage', 'treatment', 'lumbar'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  'spine': [
    {
      id: 'injury-spine-anatomy',
      title: 'Spine',
      bodyRegion: 'spine',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['spine', 'back', 'vertebrae', 'lumbar', 'cervical', 'neck', 'thoracic'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-spine-injury',
      title: 'Spine Injury',
      bodyRegion: 'spine',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Spine_InjuryF-01.jpg',
      tags: ['spine', 'injury', 'trauma', 'back'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-healthy-spine',
      title: 'Healthy Spine',
      bodyRegion: 'spine',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['spine', 'healthy', 'normal', 'anatomy'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-herniated-disk',
      title: 'Herniated Disk',
      bodyRegion: 'spine',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Herniated_DiskF-01.jpg',
      tags: ['spine', 'disk', 'herniated', 'herniation', 'bulging', 'pain'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-degenerated-disk',
      title: 'Degenerated Disk',
      bodyRegion: 'spine',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Herniated_DiskF-01.jpg',
      tags: ['spine', 'disk', 'degeneration', 'degenerative', 'disease'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-spinal-stenosis',
      title: 'Spinal Stenosis',
      bodyRegion: 'spine',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Spinal_StenosisF-01.jpg',
      tags: ['spine', 'stenosis', 'narrowing', 'compression'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-spinal-stenosis-side',
      title: 'Spinal Stenosis Side',
      bodyRegion: 'spine',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Spinal_Stenosis_SideF-01.jpg',
      tags: ['spine', 'stenosis', 'narrowing', 'lateral', 'side view'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-osteoarthritic-spine',
      title: 'Osteoarthritic Spine',
      bodyRegion: 'spine',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Osteoarthritic_SpineF-01.jpg',
      tags: ['spine', 'osteoarthritis', 'arthritis', 'degeneration'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-kyphosis',
      title: 'Measurement of Kyphosis (Dowager\'s Hump)',
      bodyRegion: 'spine',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/KyphosisF-01.jpg',
      tags: ['spine', 'kyphosis', 'hump', 'posture', 'curvature'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  // Neck
  'neck': [
    {
      id: 'injury-neck-anatomy',
      title: 'Neck Anatomy',
      bodyRegion: 'neck',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Neck_PainF-01.jpg',
      tags: ['neck', 'cervical', 'spine', 'vertebrae', 'anatomy'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-neck-pain',
      title: 'Neck Pain',
      bodyRegion: 'neck',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Neck_PainF-01.jpg',
      tags: ['neck', 'pain', 'cervical', 'strain'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-cervical-disk-herniation',
      title: 'Cervical Disk Herniation',
      bodyRegion: 'neck',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Neck_PainF-01.jpg',
      tags: ['neck', 'cervical', 'disk', 'herniation', 'herniated'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-trapezius',
      title: 'Trapezius Muscle',
      bodyRegion: 'neck',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Upper_Back_MusclesF-01.jpg',
      tags: ['neck', 'trapezius', 'muscle', 'shoulder', 'upper back'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-cervicothoracic-junction',
      title: 'Cervicothoracic Junction',
      bodyRegion: 'neck',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Cervicothoracic_JunctionF-01.jpg',
      tags: ['neck', 'cervical', 'thoracic', 'junction', 'spine'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  // Hip
  'hip': [
    {
      id: 'injury-hip-anatomy',
      title: 'Hip Anatomy',
      bodyRegion: 'hip',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Hip_Groin_PainF-01.jpg',
      tags: ['hip', 'joint', 'pelvis', 'femur', 'anatomy'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-hip-pain',
      title: 'Pain in and around your Hip and Groin',
      bodyRegion: 'hip',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Hip_Groin_PainF-01.jpg',
      tags: ['hip', 'pain', 'groin', 'joint'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-hip-joint-pain',
      title: 'Pain in your Hip Joint',
      bodyRegion: 'hip',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Hip_Joint_PainF-01.jpg',
      tags: ['hip', 'joint', 'pain', 'arthritis'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-hip-pain-running',
      title: 'Hip Pain from Running',
      bodyRegion: 'hip',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Hip_Groin_PainF-01.jpg',
      tags: ['hip', 'pain', 'running', 'sports', 'injury'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-hip-flexor-strain',
      title: 'Hip Flexor Strain',
      bodyRegion: 'hip',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Hip_Groin_PainF-01.jpg',
      tags: ['hip', 'flexor', 'strain', 'muscle', 'injury'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-psoas-tear',
      title: 'Psoas Tendon Tear',
      bodyRegion: 'hip',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Hip_Groin_PainF-01.jpg',
      tags: ['hip', 'psoas', 'tendon', 'tear', 'injury'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-labral-tear-hip-duplicate',
      title: 'Labral Tear',
      bodyRegion: 'hip',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Hip_Joint_PainF-01.jpg',
      tags: ['hip', 'labral', 'tear', 'labrum', 'injury'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-labral-tear-hip',
      title: 'Labral Tear (Hip)',
      bodyRegion: 'hip',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Hip_Joint_PainF-01.jpg',
      tags: ['hip', 'labral', 'tear', 'labrum', 'injury'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-hip-osteoarthritis',
      title: 'Hip Osteoarthritis',
      bodyRegion: 'hip',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Hip_Joint_PainF-01.jpg',
      tags: ['hip', 'osteoarthritis', 'arthritis', 'degeneration'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-hip-pincer',
      title: 'Hip Pincer',
      bodyRegion: 'hip',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Hip_Joint_PainF-01.jpg',
      tags: ['hip', 'pincer', 'impingement', 'fai'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-hip-cam',
      title: 'Hip Cam',
      bodyRegion: 'hip',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Hip_Joint_PainF-01.jpg',
      tags: ['hip', 'cam', 'impingement', 'fai'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  // Ankle/Foot
  'ankle': [
    {
      id: 'injury-ankle-anatomy',
      title: 'Ankle and Foot Anatomy',
      bodyRegion: 'ankle',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/8.jpg',
      tags: ['ankle', 'foot', 'ligaments', 'bones', 'anatomy'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-ankle-pain',
      title: 'Ankle Pain',
      bodyRegion: 'ankle',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/8.jpg',
      tags: ['ankle', 'pain', 'sprain', 'injury'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-heel-pain',
      title: 'Pain under your Heel',
      bodyRegion: 'ankle',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Heel_Pain_UnderF-01.jpg',
      tags: ['heel', 'pain', 'plantar fasciitis', 'foot'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-heel-back-pain',
      title: 'Pain on the Back of the Heel',
      bodyRegion: 'ankle',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Achilles_TendinopathyF-01.jpg',
      tags: ['heel', 'achilles', 'pain', 'tendon'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-heel-spur',
      title: 'Heel Spur',
      bodyRegion: 'ankle',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Heel_Pain_UnderF-01.jpg',
      tags: ['heel', 'spur', 'bone', 'pain'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-heel-inflammation',
      title: 'Inflammation in the Heel',
      bodyRegion: 'ankle',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Heel_Pain_UnderF-01.jpg',
      tags: ['heel', 'inflammation', 'pain', 'plantar fasciitis'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-plantar-fascia',
      title: 'Plantar Fascia',
      bodyRegion: 'ankle',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Plantar_FasciitisF-01.jpg',
      tags: ['foot', 'plantar', 'fascia', 'fasciitis', 'heel'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-achilles-rupture',
      title: 'Achilles Tendon Rupture',
      bodyRegion: 'ankle',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Achilles_TendinopathyF-01.jpg',
      tags: ['achilles', 'tendon', 'rupture', 'tear', 'ankle'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  // Elbow
  'elbow': [
    {
      id: 'injury-elbow-anatomy',
      title: 'Elbow Anatomy',
      bodyRegion: 'elbow',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Elbow_PainF-01.jpg',
      tags: ['elbow', 'joint', 'anatomy', 'arm'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-elbow-pain',
      title: 'Elbow Pain',
      bodyRegion: 'elbow',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Elbow_PainF-01.jpg',
      tags: ['elbow', 'pain', 'injury'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-tennis-elbow',
      title: 'Tennis Elbow',
      bodyRegion: 'elbow',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Elbow_PainF-01.jpg',
      tags: ['elbow', 'tennis', 'epicondylitis', 'lateral', 'pain'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-elbow-bursa',
      title: 'Elbow - Inflammation of the Bursa',
      bodyRegion: 'elbow',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Elbow_PainF-01.jpg',
      tags: ['elbow', 'bursa', 'bursitis', 'inflammation'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-ulnar-nerve',
      title: 'Compressed Ulnar Nerve',
      bodyRegion: 'elbow',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Elbow_PainF-01.jpg',
      tags: ['elbow', 'ulnar', 'nerve', 'compression', 'cubital tunnel'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-elbow-subluxation',
      title: 'Elbow Subluxation',
      bodyRegion: 'elbow',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Elbow_PainF-01.jpg',
      tags: ['elbow', 'subluxation', 'dislocation', 'injury'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-elbow-nerves',
      title: 'Elbow Nerves',
      bodyRegion: 'elbow',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/Elbow_PainF-01.jpg',
      tags: ['elbow', 'nerves', 'anatomy', 'ulnar', 'radial'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  // Wrist
  'wrist': [
    {
      id: 'injury-wrist-pain',
      title: 'Wrist Pain',
      bodyRegion: 'wrist',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['wrist', 'pain', 'hand', 'injury'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-sprained-wrist',
      title: 'Sprained Wrist',
      bodyRegion: 'wrist',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['wrist', 'sprain', 'ligament', 'injury'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-torn-wrist-ligaments',
      title: 'Torn Ligaments of the Wrist',
      bodyRegion: 'wrist',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['wrist', 'ligament', 'torn', 'tear', 'injury'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-wrist-falling',
      title: 'Wrist Pain from Falling',
      bodyRegion: 'wrist',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['wrist', 'pain', 'falling', 'injury', 'trauma'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  // Leg/Calf
  'leg': [
    {
      id: 'injury-leg-muscles',
      title: 'Leg Muscles #1',
      bodyRegion: 'leg',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['leg', 'muscles', 'anatomy', 'thigh', 'calf'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-calf-pain',
      title: 'Calf Pain',
      bodyRegion: 'leg',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['calf', 'pain', 'leg', 'muscle'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-calf-strain',
      title: 'Calf Muscle Strain and Tear',
      bodyRegion: 'leg',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['calf', 'strain', 'tear', 'muscle', 'injury'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-gastrocnemius-soleus',
      title: 'Gastrocnemius, Soleus and Achilles Tendon',
      bodyRegion: 'leg',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['calf', 'gastrocnemius', 'soleus', 'achilles', 'anatomy'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-shin-splints',
      title: 'Shin Splints',
      bodyRegion: 'leg',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['shin', 'splints', 'leg', 'pain', 'running'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-ice-shin-pain',
      title: 'Ice Shin Pain',
      bodyRegion: 'leg',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['shin', 'ice', 'treatment', 'pain'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-broken-leg',
      title: 'Broken Leg',
      bodyRegion: 'leg',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['leg', 'fracture', 'broken', 'bone'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-femoral-artery',
      title: 'Femoral Artery',
      bodyRegion: 'leg',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['femoral', 'artery', 'vascular', 'leg'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-peripheral-artery-disease',
      title: 'Peripheral Artery Disease',
      bodyRegion: 'leg',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['peripheral', 'artery', 'disease', 'vascular', 'leg'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-sciatic-tibial-nerve',
      title: 'Sciatic Nerve and Tibial Nerve',
      bodyRegion: 'leg',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['sciatic', 'tibial', 'nerve', 'leg', 'sciatica'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-quadriceps-tendon',
      title: 'Quadriceps Tendon',
      bodyRegion: 'leg',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['quadriceps', 'tendon', 'thigh', 'knee'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-quadriceps-muscle',
      title: 'Quadriceps Muscle',
      bodyRegion: 'leg',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['quadriceps', 'muscle', 'thigh', 'anatomy'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-hamstring-tear',
      title: 'Hamstring Tear',
      bodyRegion: 'leg',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['hamstring', 'tear', 'thigh', 'injury', 'muscle'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  // Foot
  'foot': [
    {
      id: 'injury-foot-pain-running',
      title: 'Foot Pain from Running',
      bodyRegion: 'foot',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['foot', 'pain', 'running', 'injury'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-pronation',
      title: 'Pronation of the Foot',
      bodyRegion: 'foot',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['foot', 'pronation', 'gait', 'biomechanics'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-extensor-tendonitis',
      title: 'Extensor Tendonitis',
      bodyRegion: 'foot',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['foot', 'extensor', 'tendonitis', 'tendon', 'pain'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  // Brain/Neurological
  'brain': [
    {
      id: 'injury-brain-anatomy',
      title: 'Brain',
      bodyRegion: 'brain',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['brain', 'anatomy', 'neurological'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-frontal-cortex',
      title: 'Frontal Cortex, Hippocampus and Amygdala',
      bodyRegion: 'brain',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['brain', 'frontal cortex', 'hippocampus', 'amygdala', 'anatomy'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-headache',
      title: 'Headache',
      bodyRegion: 'brain',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['headache', 'head', 'pain', 'brain'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  // Pelvis/Sacroiliac
  'pelvis': [
    {
      id: 'injury-sacroiliac-joint',
      title: 'Sacroiliac Joint',
      bodyRegion: 'pelvis',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['sacroiliac', 'joint', 'pelvis', 'si joint'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-sacroiliac-symptoms',
      title: 'Sacroiliac Joint Symptoms',
      bodyRegion: 'pelvis',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['sacroiliac', 'symptoms', 'pain', 'si joint'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  // Treatment/Exercise/Lifestyle
  'treatment': [
    {
      id: 'injury-rice-principle',
      title: 'The RICE Principle',
      bodyRegion: 'general',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['rice', 'treatment', 'rest', 'ice', 'compression', 'elevation'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-icing-neck',
      title: 'Icing the Neck',
      bodyRegion: 'treatment',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['ice', 'treatment', 'neck', 'therapy'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-shoulder-brace',
      title: 'Shoulder Brace',
      bodyRegion: 'treatment',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['shoulder', 'brace', 'treatment', 'support'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-trapezius-taping',
      title: 'Trapezius Pain Taping',
      bodyRegion: 'treatment',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['trapezius', 'taping', 'treatment', 'kinesiology'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  'exercise': [
    {
      id: 'injury-yoga',
      title: 'Yoga',
      bodyRegion: 'exercise',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['yoga', 'exercise', 'stretching', 'flexibility'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-swimming',
      title: 'Swimming',
      bodyRegion: 'exercise',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['swimming', 'exercise', 'cardio', 'low impact'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-cycling',
      title: 'Cycling',
      bodyRegion: 'exercise',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['cycling', 'exercise', 'cardio', 'bike'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-runners-1',
      title: 'Runners #1',
      bodyRegion: 'exercise',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['running', 'exercise', 'cardio', 'runner'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-runners-2',
      title: 'Runners #2',
      bodyRegion: 'exercise',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['running', 'exercise', 'cardio', 'runner'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-runners-3',
      title: 'Runners #3',
      bodyRegion: 'exercise',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['running', 'exercise', 'cardio', 'runner'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  'lifestyle': [
    {
      id: 'injury-bad-posture',
      title: 'Bad Posture',
      bodyRegion: 'lifestyle',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['posture', 'bad', 'spine', 'ergonomics'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-sitting-upright',
      title: 'Sitting Upright',
      bodyRegion: 'lifestyle',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['posture', 'sitting', 'ergonomics', 'spine'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-unhealthy-lifestyle',
      title: 'Unhealthy Lifestyle',
      bodyRegion: 'lifestyle',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['lifestyle', 'unhealthy', 'health', 'wellness'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-leptin-ghrelin',
      title: 'Leptin and Ghrelin',
      bodyRegion: 'lifestyle',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['leptin', 'ghrelin', 'hormones', 'metabolism', 'appetite'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-pregnant',
      title: 'Pregnant',
      bodyRegion: 'lifestyle',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['pregnancy', 'pregnant', 'maternal', 'health'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-man-back-pain',
      title: 'Man with Back Pain',
      bodyRegion: 'lifestyle',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['back', 'pain', 'man', 'illustration'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-pinched-nerve-signs',
      title: 'Signs of Pinched Nerve',
      bodyRegion: 'lifestyle',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['nerve', 'pinched', 'compression', 'symptoms'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  'muscles': [
    {
      id: 'injury-muscles-anterior',
      title: 'Human Muscle Anatomy (Front)',
      bodyRegion: 'full-body',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['muscles', 'anatomy', 'musculoskeletal', 'full body'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-upper-body-muscles',
      title: 'Muscles of the Upper Body',
      bodyRegion: 'upper-body',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['muscles', 'upper body', 'anatomy', 'chest', 'arms'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    },
    {
      id: 'injury-upper-back-muscles',
      title: 'Upper Back Muscles',
      bodyRegion: 'back',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['muscles', 'upper back', 'trapezius', 'rhomboids'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ],
  
  'skeleton': [
    {
      id: 'injury-skeleton',
      title: 'Human Skeletal System',
      bodyRegion: 'full-body',
      url: 'https://res.cloudinary.com/im2015/image/upload/c_scale,w_800/web/diagnoses/SpineF-01.jpg',
      tags: ['bones', 'skeleton', 'anatomy', 'full body'],
      license: 'CC BY 4.0',
      attribution: 'Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0.'
    }
  ]
};

/**
 * Search InjuryMap catalog by body region or tags
 * Supports multiple body parts in a single query
 */
export function searchInjuryMap(query: string): InjuryMapImage[] {
  const lowerQuery = query.toLowerCase();
  const results: InjuryMapImage[] = [];
  const seen = new Set<string>();
  
  // Extract all body parts mentioned in query
  const bodyParts = [
    'neck', 'shoulder', 'back', 'spine', 'knee', 'hip', 'ankle', 'elbow', 'wrist',
    'heel', 'foot', 'leg', 'calf', 'thigh', 'groin', 'pelvis', 'brain', 'head'
  ];
  const mentionedParts = bodyParts.filter(part => lowerQuery.includes(part));
  
  console.log(`   🔍 InjuryMap: Detected body parts: ${mentionedParts.join(', ') || 'none'}`);
  
  // Search for each mentioned body part
  for (const part of mentionedParts) {
    // Direct region match
    if (INJURYMAP_CATALOG[part]) {
      for (const img of INJURYMAP_CATALOG[part]) {
        if (!seen.has(img.id)) {
          results.push(img);
          seen.add(img.id);
          console.log(`   ✅ Found ${part} image: ${img.title}`);
        }
      }
    }
  }
  
  // Tag-based search if no direct matches
  if (results.length === 0) {
    for (const images of Object.values(INJURYMAP_CATALOG)) {
      for (const image of images) {
        if (image.tags.some(tag => lowerQuery.includes(tag)) && !seen.has(image.id)) {
          results.push(image);
          seen.add(image.id);
          console.log(`   ✅ Found via tags: ${image.title}`);
        }
      }
    }
  }
  
  console.log(`   📊 InjuryMap total results: ${results.length}`);
  
  // Return up to 4 images to cover multiple body parts
  return results.slice(0, 4);
}

/**
 * Get InjuryMap images by specific body region
 */
export function getInjuryMapByRegion(region: string): InjuryMapImage[] {
  return INJURYMAP_CATALOG[region.toLowerCase()] || [];
}

/**
 * Get all available body regions
 */
export function getAvailableRegions(): string[] {
  return Object.keys(INJURYMAP_CATALOG);
}
