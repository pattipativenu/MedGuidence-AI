# Image Credits & Attribution

MedGuidence AI uses medical images from open-access sources. All images are properly attributed according to their respective licenses.

## Image Sources

### 1. Open-i (National Library of Medicine)
- **Website**: https://openi.nlm.nih.gov
- **License**: Free for reuse with attribution
- **Content**: Biomedical images from PubMed Central and other open-access sources
- **Attribution**: "Image from Open-i, National Library of Medicine (https://openi.nlm.nih.gov). Free for reuse with attribution."
- **Usage**: Medical imaging, radiology, pathology, clinical images
- **In Use**: ✅ Active

### 2. InjuryMap Free Human Anatomy Illustrations
- **Website**: https://www.injurymap.com/free-human-anatomy-illustrations
- **License**: CC BY 4.0 (Creative Commons Attribution 4.0 International)
- **Content**: High-quality vector anatomy illustrations (19 images)
- **Attribution**: "Image from InjuryMap (https://www.injurymap.com/free-human-anatomy-illustrations). Licensed under CC BY 4.0."
- **Usage**: Musculoskeletal anatomy, body parts, injury illustrations
- **In Use**: ✅ Active



## How Attribution is Displayed

When users click on an image to zoom in, they can click the **Info (ℹ️) button** in the top-right corner to see full attribution details including:

- Source name and organization
- License type
- Description of the source
- Link to the original source website
- Attribution requirements notice

## License Compliance

### CC BY 4.0 (InjuryMap)
Under Creative Commons Attribution 4.0 International License, you are free to:
- **Share**: Copy and redistribute the material
- **Adapt**: Remix, transform, and build upon the material

**Requirements**:
- Give appropriate credit
- Provide a link to the license
- Indicate if changes were made



### Open-i (NLM)
Images from PubMed Central are generally free for reuse with attribution. Specific licensing may vary by article.

## Attribution in Code

All images in MedGuidence AI include structured attribution data:

```typescript
{
  url: string;           // Image URL
  title: string;         // Image title
  source: string;        // Source badge (e.g., "Open-i", "InjuryMap")
  license: string;       // License type (e.g., "CC BY 4.0")
  attribution: string;   // Full attribution text
}
```

## Acknowledgments

We thank the following organizations for making their medical images freely available:

- **National Library of Medicine (NLM)** - Open-i biomedical image search
- **InjuryMap** - Free human anatomy illustrations
- **PubMed Central** - Open-access biomedical literature

## Questions?

For questions about image licensing or attribution, please refer to the original source websites listed above.

---

*Last Updated: December 2025*
