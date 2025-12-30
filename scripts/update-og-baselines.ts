/**
 * Update OG image baselines - copies generated images to reference directory.
 * Run this after making intentional changes to OG image generation.
 *
 * Usage: npx tsx scripts/update-og-baselines.ts
 *
 * Note: This script is deprecated. Reference images should be created manually
 * using the HTML templates in public/assets/og-tests/ and verified visually.
 */

import * as fs from 'fs';
import * as path from 'path';

// Mapping of generated images to reference images
const OG_MAPPINGS = [
  { generated: 'index.png', reference: 'about.png' },
  { generated: 'dereferenced.png', reference: 'blog-list.png' },
  { generated: 'geometry-of-attention.png', reference: 'geometry-of-attention.png' },
];

function getGeneratedDir(): string {
  return path.join(process.cwd(), 'public', 'og');
}

function getReferenceDir(): string {
  return path.join(process.cwd(), 'public', 'assets', 'og-tests');
}

function main() {
  const generatedDir = getGeneratedDir();
  const referenceDir = getReferenceDir();

  console.log('Updating OG image references from generated images...\n');
  console.log('⚠️  WARNING: This will overwrite the reference images!');
  console.log('   Only run this if you want to update the ground truth.\n');

  let updated = 0;
  let skipped = 0;

  for (const mapping of OG_MAPPINGS) {
    const sourcePath = path.join(generatedDir, mapping.generated);
    const destPath = path.join(referenceDir, mapping.reference);

    if (!fs.existsSync(sourcePath)) {
      console.log(`  ⚠️  Skipped: ${mapping.generated} (not found)`);
      skipped++;
      continue;
    }

    fs.copyFileSync(sourcePath, destPath);
    console.log(`  ✓  Updated: ${mapping.reference} (from ${mapping.generated})`);
    updated++;
  }

  console.log(`\nDone! Updated ${updated} references, skipped ${skipped}.`);

  if (updated > 0) {
    console.log('\nRemember to commit the updated references:');
    console.log('  git add public/assets/og-tests/*.png');
    console.log('  git commit -m "chore: update OG image references"');
  }
}

main();
