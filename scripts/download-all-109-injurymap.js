const fs = require('fs');
const https = require('https');
const path = require('path');

// Complete list of all 109 InjuryMap images with 2000px URLs
const images = [
  { name: "Hip_Groin_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Hip_Groin_PainF-01.jpg" },
  { name: "Ankle_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/8.jpg" },
  { name: "Elbow_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Elbow_PainF-01.jpg" },
  { name: "Hip_Joint_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Hip_Joint_PainF-01.jpg" },
  { name: "Back_Pain_Radiation", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Back_Pain_RadiationF-01.jpg" },
  { name: "Shoulder_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Shoulder_PainF-01.jpg" },
  { name: "Neck_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Neck_PainF-01.jpg" },
  { name: "Heel_Pain_Under", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Heel_Pain_UnderF-01.jpg" },
  { name: "Back_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Lower_Back_PainF-01.jpg" },
  { name: "Knee_Joint_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Knee_PainF-01.jpg" },
  { name: "Heel_Pain_Back", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Achilles_TendinopathyF-01.jpg" },
  { name: "Knee_Soft_Tissue", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Knee_Soft_TissueF-01.jpg" },
  { name: "Headache", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/HeadacheF-01.jpg" },
  { name: "Wrist_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Wrist_PainF-01.jpg" },
  { name: "Knee_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Knee_PainF-01.jpg" },
  { name: "LCL", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/LCLF-01.jpg" },
  { name: "Bad_Posture", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Bad_PostureF-01.jpg" },
  { name: "Quadriceps_Tendon", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Quadriceps_TendonF-01.jpg" },
  { name: "Quadriceps_Muscle", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Quadriceps_StrainF-01.jpg" },
  { name: "Hamstring_Tear", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Hamstring_StrainF-01.jpg" },
  { name: "Spine_Injury", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Spine_InjuryF-01.jpg" },
  { name: "Kyphosis", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/KyphosisF-01.jpg" },
  { name: "Spine", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/SpineF-01.jpg" },
  { name: "Unhealthy_Lifestyle", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Unhealthy_LifestyleF-01.jpg" },
  { name: "Runners_1", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Runners_1F-01.jpg" },
  { name: "Runners_2", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Runners_2F-01.jpg" },
  { name: "Runners_3", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Runners_3F-01.jpg" },
  { name: "Leptin_Ghrelin", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Leptin_GhrelinF-01.jpg" },
  { name: "Osteoarthritic_Spine", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Osteoarthritic_SpineF-01.jpg" },
  { name: "Herniated_Disk", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Herniated_DiskF-01.jpg" },
  { name: "Frontal_Cortex", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Frontal_CortexF-01.jpg" },
  { name: "Brain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/BrainF-01.jpg" },
  { name: "RICE_Principle", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/RICE_PrincipleF-01.jpg" },
  { name: "Patellar_Dislocation", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Patellar_DislocationF-01.jpg" },
  { name: "Patellar_Fracture", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Patellar_FractureF-01.jpg" },
  { name: "Upper_Back_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Upper_Back_PainF-01.jpg" },
  { name: "Cervicothoracic_Junction", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Cervicothoracic_JunctionF-01.jpg" },
  { name: "Upper_Body_Muscles", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Upper_Body_MusclesF-01.jpg" },
  { name: "Upper_Back_Muscles", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Upper_Back_MusclesF-01.jpg" },
  { name: "Spinal_Stenosis_Side", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Spinal_Stenosis_SideF-01.jpg" },
  { name: "Spinal_Stenosis", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Spinal_StenosisF-01.jpg" },
  { name: "Shoulder_Pain_2", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Shoulder_Pain_2F-01.jpg" },
  { name: "Scapula_Fracture", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Scapula_FractureF-01.jpg" },
  { name: "Man_Back_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Man_Back_PainF-01.jpg" },
  { name: "Femoral_Artery", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Femoral_ArteryF-01.jpg" },
  { name: "Calf_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Calf_StrainF-01.jpg" },
  { name: "Sciatic_Tibial_Nerve", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Sciatic_Tibial_NerveF-01.jpg" },
  { name: "Calf_Strain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Calf_StrainF-01.jpg" },
  { name: "Gastrocnemius_Soleus", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Gastrocnemius_SoleusF-01.jpg" },
  { name: "Peripheral_Artery_Disease", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Peripheral_Artery_DiseaseF-01.jpg" },
  { name: "Shin_Splints", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Shin_SplintsF-01.jpg" },
  { name: "Swimming", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/SwimmingF-01.jpg" },
  { name: "Cycling", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/CyclingF-01.jpg" },
  { name: "Ice_Shin_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Ice_Shin_PainF-01.jpg" },
  { name: "Shoulder_Noises", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Shoulder_NoisesF-01.jpg" },
  { name: "Shoulder_Anatomy", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Shoulder_AnatomyF-01.jpg" },
  { name: "Rotator_Cuff", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Rotator_CuffF-01.jpg" },
  { name: "Rotator_Cuff_Muscles", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Rotator_Cuff_MusclesF-01.jpg" },
  { name: "Labral_Tear", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Labral_TearF-01.jpg" },
  { name: "Extensor_Tendonitis", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Extensor_TendonitisF-01.jpg" },
  { name: "Foot_Pain_Running", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Foot_Pain_RunningF-01.jpg" },
  { name: "Pronation", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/PronationF-01.jpg" },
  { name: "Plantar_Fascia", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Plantar_FasciitisF-01.jpg" },
  { name: "Brain_2", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Brain_2F-01.jpg" },
  { name: "Broken_Leg", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Broken_LegF-01.jpg" },
  { name: "Sprained_Wrist", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Sprained_WristF-01.jpg" },
  { name: "Wrist_Pain_Falling", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Wrist_Pain_FallingF-01.jpg" },
  { name: "Torn_Wrist_Ligaments", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Torn_Wrist_LigamentsF-01.jpg" },
  { name: "Sacroiliac_Joint", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Sacroiliac_JointF-01.jpg" },
  { name: "Sacroiliac_Symptoms", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Sacroiliac_SymptomsF-01.jpg" },
  { name: "Sitting_Upright", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Sitting_UprightF-01.jpg" },
  { name: "Pinched_Nerve_Signs", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Pinched_Nerve_SignsF-01.jpg" },
  { name: "Pregnant", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/PregnantF-01.jpg" },
  { name: "Heel_Inflammation", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Heel_InflammationF-01.jpg" },
  { name: "Healthy_Knee", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Healthy_KneeF-01.jpg" },
  { name: "Knee_Osteoarthritis", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Knee_OsteoarthritisF-01.jpg" },
  { name: "Degenerated_Disk", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Degenerated_DiskF-01.jpg" },
  { name: "Yoga", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/YogaF-01.jpg" },
  { name: "Lower_Back_Massage", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Lower_Back_MassageF-01.jpg" },
  { name: "Heel_Spur", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Heel_SpurF-01.jpg" },
  { name: "Neck_Anatomy", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Neck_AnatomyF-01.jpg" },
  { name: "Neck_Pain_2", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Neck_Pain_2F-01.jpg" },
  { name: "Icing_Neck", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Icing_NeckF-01.jpg" },
  { name: "Tennis_Elbow", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Tennis_ElbowF-01.jpg" },
  { name: "Elbow_Nerves", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Elbow_NervesF-01.jpg" },
  { name: "Elbow_Bursa", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Elbow_BursaF-01.jpg" },
  { name: "Elbow_Anatomy", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Elbow_AnatomyF-01.jpg" },
  { name: "Ulnar_Nerve", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Ulnar_NerveF-01.jpg" },
  { name: "Elbow_Subluxation", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Elbow_SubluxationF-01.jpg" },
  { name: "Hip_Pain_Running", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Hip_Pain_RunningF-01.jpg" },
  { name: "Hip_Flexor_Strain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Hip_Flexor_StrainF-01.jpg" },
  { name: "Psoas_Tear", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Psoas_TearF-01.jpg" },
  { name: "Labral_Tear_Hip", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Labral_Tear_HipF-01.jpg" },
  { name: "Healthy_Spine", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Healthy_SpineF-01.jpg" },
  { name: "Degenerated_Disk_2", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Degenerated_Disk_2F-01.jpg" },
  { name: "Cervical_Disk_Herniation", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Cervical_Disk_HerniationF-01.jpg" },
  { name: "Shoulder_Brace", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Shoulder_BraceF-01.jpg" },
  { name: "Knee_Anatomy", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Knee_AnatomyF-01.jpg" },
  { name: "Knee_Injuries", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Knee_InjuriesF-01.jpg" },
  { name: "Uric_Acid_Knee", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Uric_Acid_KneeF-01.jpg" },
  { name: "Leg_Muscles", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Leg_MusclesF-01.jpg" },
  { name: "Achilles_Rupture", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Achilles_RuptureF-01.jpg" },
  { name: "Trapezius", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/TrapeziusF-01.jpg" },
  { name: "Trapezius_Taping", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Trapezius_TapingF-01.jpg" },
  { name: "IT_Band_Syndrome", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/IT_Band_SyndromeF-01.jpg" },
  { name: "Hip_Anatomy", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Hip_AnatomyF-01.jpg" },
  { name: "Hip_Pincer", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Hip_PincerF-01.jpg" },
  { name: "Hip_Cam", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Hip_CamF-01.jpg" },
  { name: "Hip_Osteoarthritis", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Hip_OsteoarthritisF-01.jpg" }
];

const downloadDir = './public/injurymap';
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

function downloadImage(imageObj, index) {
  return new Promise((resolve) => {
    const filename = `${String(index + 1).padStart(3, '0')}_${imageObj.name}.jpg`;
    const filepath = path.join(downloadDir, filename);
    const file = fs.createWriteStream(filepath);
    
    https.get(imageObj.url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ ${index + 1}/109: ${filename}`);
          resolve(true);
        });
      } else {
        console.log(`⚠️  ${index + 1}/109: ${filename} (${response.statusCode})`);
        resolve(false);
      }
    }).on('error', () => {
      console.log(`❌ ${index + 1}/109: ${filename} (failed)`);
      resolve(false);
    });
  });
}

async function downloadAll() {
  console.log('🚀 Downloading 109 InjuryMap images at 2000px...\n');
  let success = 0;
  
  for (let i = 0; i < images.length; i++) {
    const result = await downloadImage(images[i], i);
    if (result) success++;
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\n✅ Complete! ${success}/109 images downloaded to public/injurymap/`);
}

downloadAll();
