import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

// Mapping of generated OG images to their reference images
const OG_IMAGE_MAPPINGS = [
  { generated: 'index.png', reference: 'about.png', description: 'About page' },
  { generated: 'dereferenced.png', reference: 'blog-list.png', description: 'Blog index' },
  { generated: 'geometry-of-attention.png', reference: 'geometry-of-attention.png', description: 'Article' },
];

// Target dimensions (standard OG size)
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 630;

// Get the directory containing generated OG images
function getGeneratedDir(): string {
  return path.join(process.cwd(), 'public', 'og');
}

// Get the directory containing reference images (ground truth)
function getReferenceDir(): string {
  return path.join(process.cwd(), 'public', 'assets', 'og-tests');
}

function getDiffDir(): string {
  return path.join(process.cwd(), 'tests', 'og-diff');
}

// Simple nearest-neighbor downscale for PNG (halves dimensions)
function downscale2x(img: PNG): PNG {
  const newWidth = Math.floor(img.width / 2);
  const newHeight = Math.floor(img.height / 2);
  const scaled = new PNG({ width: newWidth, height: newHeight });

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const srcX = x * 2;
      const srcY = y * 2;
      const srcIdx = (srcY * img.width + srcX) * 4;
      const dstIdx = (y * newWidth + x) * 4;

      // Simple average of 2x2 block
      let r = 0, g = 0, b = 0, a = 0;
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const idx = ((srcY + dy) * img.width + (srcX + dx)) * 4;
          r += img.data[idx];
          g += img.data[idx + 1];
          b += img.data[idx + 2];
          a += img.data[idx + 3];
        }
      }

      scaled.data[dstIdx] = Math.round(r / 4);
      scaled.data[dstIdx + 1] = Math.round(g / 4);
      scaled.data[dstIdx + 2] = Math.round(b / 4);
      scaled.data[dstIdx + 3] = Math.round(a / 4);
    }
  }

  return scaled;
}

// These tests are debug-only - run with: npx playwright test tests/og-visual.spec.ts
test.describe('OG Image Visual Regression', () => {
  test.beforeAll(() => {
    // Ensure diff directory exists for failed comparisons
    const diffDir = getDiffDir();
    if (!fs.existsSync(diffDir)) {
      fs.mkdirSync(diffDir, { recursive: true });
    }
  });

  for (const mapping of OG_IMAGE_MAPPINGS) {
    test(`OG image matches reference: ${mapping.description} (${mapping.generated})`, async () => {
      const generatedDir = getGeneratedDir();
      const referenceDir = getReferenceDir();

      const generatedPath = path.join(generatedDir, mapping.generated);
      const referencePath = path.join(referenceDir, mapping.reference);

      // Skip if generated image doesn't exist
      if (!fs.existsSync(generatedPath)) {
        test.skip(true, `Generated OG image not found: ${generatedPath}. Run 'npm run generate-og' first.`);
        return;
      }

      // Reference must exist
      if (!fs.existsSync(referencePath)) {
        throw new Error(`Reference image not found: ${referencePath}`);
      }

      // Load both images
      const generatedImg = PNG.sync.read(fs.readFileSync(generatedPath));
      let referenceImg = PNG.sync.read(fs.readFileSync(referencePath));

      // If reference is 2x (2400x1260), downscale to 1200x630
      if (referenceImg.width === TARGET_WIDTH * 2 && referenceImg.height === TARGET_HEIGHT * 2) {
        console.log(`Downscaling reference image from ${referenceImg.width}x${referenceImg.height} to ${TARGET_WIDTH}x${TARGET_HEIGHT}`);
        referenceImg = downscale2x(referenceImg);
      }

      // Images must have same dimensions
      expect(generatedImg.width, `Width mismatch for ${mapping.generated}`).toBe(referenceImg.width);
      expect(generatedImg.height, `Height mismatch for ${mapping.generated}`).toBe(referenceImg.height);

      const { width, height } = generatedImg;
      const diff = new PNG({ width, height });

      // Compare images
      const numDiffPixels = pixelmatch(
        generatedImg.data,
        referenceImg.data,
        diff.data,
        width,
        height,
        { threshold: 0.1 } // Allow 10% color threshold per pixel
      );

      const totalPixels = width * height;
      const diffPercentage = (numDiffPixels / totalPixels) * 100;

      // Save diff image for debugging
      if (numDiffPixels > 0) {
        const diffPath = path.join(getDiffDir(), `diff-${mapping.generated}`);
        fs.writeFileSync(diffPath, PNG.sync.write(diff));

        // Save generated and scaled reference for easy comparison
        fs.copyFileSync(generatedPath, path.join(getDiffDir(), `generated-${mapping.generated}`));
        fs.writeFileSync(path.join(getDiffDir(), `reference-scaled-${mapping.reference}`), PNG.sync.write(referenceImg));

        console.log(`\nDiff saved to: ${diffPath}`);
        console.log(`Generated: ${path.join(getDiffDir(), `generated-${mapping.generated}`)}`);
        console.log(`Reference (scaled): ${path.join(getDiffDir(), `reference-scaled-${mapping.reference}`)}`);
        console.log(`Diff percentage: ${diffPercentage.toFixed(2)}%`);
      }

      // Allow up to 10% pixel difference (generous for now, tighten later)
      expect(diffPercentage, `OG image ${mapping.generated} differs from reference by ${diffPercentage.toFixed(2)}%`).toBeLessThan(10);
    });
  }
});
