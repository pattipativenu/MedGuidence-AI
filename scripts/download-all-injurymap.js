const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
  { name: "Hip_Groin_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Hip_Groin_PainF-01.jpg", bodyPart: "hip", keywords: ["hip pain", "groin pain", "hip flexor", "FAI", "hip arthritis", "adductor strain"] },
  { name: "Ankle_Sprain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/8.jpg", bodyPart: "ankle", keywords: ["ankle sprain", "ankle pain", "lateral ligament", "ATFL", "ankle instability"] },
  { name: "Shoulder_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Shoulder_PainF-01.jpg", bodyPart: "shoulder", keywords: ["shoulder pain", "rotator cuff", "impingement", "frozen shoulder", "adhesive capsulitis"] },
  { name: "Knee_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Knee_PainF-01.jpg", bodyPart: "knee", keywords: ["knee pain", "patellofemoral", "meniscus", "ACL", "MCL", "runner's knee"] },
  { name: "Lower_Back_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Lower_Back_PainF-01.jpg", bodyPart: "back", keywords: ["lower back pain", "lumbar", "sciatica", "disc herniation", "LBP"] },
  { name: "Neck_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Neck_PainF-01.jpg", bodyPart: "neck", keywords: ["neck pain", "cervical", "whiplash", "cervicalgia", "neck strain"] },
  { name: "Elbow_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Elbow_PainF-01.jpg", bodyPart: "elbow", keywords: ["elbow pain", "tennis elbow", "golfer's elbow", "lateral epicondylitis", "medial epicondylitis"] },
  { name: "Wrist_Pain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Wrist_PainF-01.jpg", bodyPart: "wrist", keywords: ["wrist pain", "carpal tunnel", "TFCC", "wrist sprain", "De Quervain"] },
  { name: "Plantar_Fasciitis", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Plantar_FasciitisF-01.jpg", bodyPart: "foot", keywords: ["plantar fasciitis", "heel pain", "foot pain", "heel spur"] },
  { name: "Achilles_Tendinopathy", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Achilles_TendinopathyF-01.jpg", bodyPart: "ankle", keywords: ["achilles tendinopathy", "achilles pain", "achilles tendinitis", "heel cord"] },
  { name: "IT_Band_Syndrome", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/IT_Band_SyndromeF-01.jpg", bodyPart: "knee", keywords: ["IT band syndrome", "iliotibial band", "ITBS", "lateral knee pain"] },
  { name: "Hamstring_Strain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Hamstring_StrainF-01.jpg", bodyPart: "thigh", keywords: ["hamstring strain", "hamstring tear", "posterior thigh pain", "hamstring injury"] },
  { name: "Calf_Strain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Calf_StrainF-01.jpg", bodyPart: "calf", keywords: ["calf strain", "gastrocnemius strain", "calf tear", "calf pain"] },
  { name: "Shin_Splints", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Shin_SplintsF-01.jpg", bodyPart: "shin", keywords: ["shin splints", "MTSS", "medial tibial stress syndrome", "shin pain"] },
  { name: "Quadriceps_Strain", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Quadriceps_StrainF-01.jpg", bodyPart: "thigh", keywords: ["quadriceps strain", "quad strain", "thigh strain", "rectus femoris"] },
  { name: "Piriformis_Syndrome", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Piriformis_SyndromeF-01.jpg", bodyPart: "hip", keywords: ["piriformis syndrome", "deep gluteal syndrome", "sciatic nerve", "buttock pain"] },
  { name: "Rotator_Cuff", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Rotator_CuffF-01.jpg", bodyPart: "shoulder", keywords: ["rotator cuff tear", "supraspinatus", "infraspinatus", "RC tear"] },
  { name: "Biceps_Tendinitis", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Biceps_TendinitisF-01.jpg", bodyPart: "arm", keywords: ["biceps tendinitis", "biceps tendinopathy", "bicipital tendinitis"] },
  { name: "Thoracic_Outlet", url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Thoracic_OutletF-01.jpg", bodyPart: "shoulder", keywords: ["thoracic outlet syndrome", "TOS", "brachial plexus", "neurovascular compression"] }
];

const downloadDir = './public/injurymap';
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });

function downloadImage(img, idx) {
  return new Promise((resolve) => {
    const filename = `${String(idx + 1).padStart(3, '0')}_${img.name}.jpg`;
    const filepath = path.join(downloadDir, filename);
    const file = fs.createWriteStream(filepath);
    https.get(img.url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ ${idx + 1}/19: ${filename}`);
        resolve();
      });
    }).on('error', () => {
      console.log(`❌ Failed: ${filename}`);
      resolve();
    });
  });
}

async function downloadAll() {
  console.log('🚀 Downloading 19 InjuryMap images...\n');
  for (let i = 0; i < images.length; i++) {
    await downloadImage(images[i], i);
    await new Promise(r => setTimeout(r, 300));
  }
  console.log('\n✅ Download complete!');
}

downloadAll();
