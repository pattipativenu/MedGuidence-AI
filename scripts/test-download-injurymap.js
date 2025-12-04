/**
 * Test Script: Download Single InjuryMap Image
 * Tests the download process before downloading all 109 images
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

// Test with one sample image
const testImage = {
  name: "Hip_Groin_Pain",
  url: "https://res.cloudinary.com/im2015/image/upload/c_scale,w_2000/web/diagnoses/Hip_Groin_PainF-01.jpg",
  attribution: "https://www.injurymap.com/diagnoses/hip-groin-pain"
};

// Target directory
const downloadDir = './public/injurymap';

// Ensure directory exists
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
  console.log('✅ Created directory:', downloadDir);
}

// Download function
function downloadImage(imageObj) {
  return new Promise((resolve, reject) => {
    const filename = `001_${imageObj.name}.jpg`;
    const filepath = path.join(downloadDir, filename);
    
    console.log(`🚀 Starting download: ${filename}`);
    console.log(`📥 URL: ${imageObj.url}`);
    
    const file = fs.createWriteStream(filepath);
    
    https.get(imageObj.url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      console.log(`📊 Status: ${response.statusCode} ${response.statusMessage}`);
      console.log(`📦 Content-Type: ${response.headers['content-type']}`);
      console.log(`📏 Content-Length: ${response.headers['content-length']} bytes`);
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        
        // Get file stats
        const stats = fs.statSync(filepath);
        console.log(`✅ Downloaded successfully!`);
        console.log(`💾 File size: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`📁 Saved to: ${filepath}`);
        
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      console.error(`❌ Download error:`, err.message);
      reject(err);
    });
  });
}

// Run test download
async function testDownload() {
  console.log('🧪 Testing InjuryMap Image Download\n');
  console.log('=' .repeat(60));
  
  try {
    const filepath = await downloadImage(testImage);
    
    console.log('=' .repeat(60));
    console.log('\n✅ TEST SUCCESSFUL!');
    console.log('\nNext steps:');
    console.log('1. Check the image at: public/injurymap/001_Hip_Groin_Pain.jpg');
    console.log('2. Verify it displays correctly in your browser');
    console.log('3. If successful, run the full download script');
    
    // Save test attribution
    const attributionFile = path.join(downloadDir, 'TEST_ATTRIBUTION.txt');
    const attributionText = `
InjuryMap Free Human Anatomy Images
License: Creative Commons Attribution 4.0 International (CC BY 4.0)

Test Image:
- Name: ${testImage.name}
- Source: ${testImage.attribution}
- License: CC BY 4.0

REQUIRED ATTRIBUTION:
When using these images, you MUST include this link on your page:
<a href="https://old.injurymap.com/free-human-anatomy-illustrations">InjuryMap - Free Human Anatomy Images</a>
`;
    
    fs.writeFileSync(attributionFile, attributionText);
    console.log('\n📄 Attribution info saved to: TEST_ATTRIBUTION.txt');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

testDownload();
