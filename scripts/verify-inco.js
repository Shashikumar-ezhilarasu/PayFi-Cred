#!/usr/bin/env node
/* eslint-disable */

/**
 * Verify incoJS Integration
 * Run: node scripts/verify-inco.js
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  'lib/inco-config.ts',
  'lib/inco-encryption.ts',
  'lib/inco-decrypt.ts',
  'lib/inco-compute.ts',
  'hooks/useIncoEncryption.ts',
  'hooks/useIncoDecryption.ts',
  'hooks/useIncoCompute.ts',
  'components/inco/PrivateCreditCheck.tsx',
  'components/inco/PrivateIncomeVerification.tsx',
  'app/test-inco/page.tsx',
];

const REQUIRED_DEPENDENCIES = ['@inco/js', 'viem'];

console.log('🔍 Verifying incoJS Integration...\n');

let allPassed = true;

// Check package.json
console.log('📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
  );
  
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  REQUIRED_DEPENDENCIES.forEach(dep => {
    if (allDeps[dep]) {
      console.log(`  ✅ ${dep} v${allDeps[dep]}`);
    } else {
      console.log(`  ❌ ${dep} - NOT FOUND`);
      allPassed = false;
    }
  });
} catch (error) {
  console.log('  ❌ Could not read package.json');
  allPassed = false;
}

console.log('\n📁 Checking required files...');
REQUIRED_FILES.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`  ✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`  ❌ ${file} - NOT FOUND`);
    allPassed = false;
  }
});

// Check TypeScript configuration
console.log('\n⚙️  Checking TypeScript configuration...');
try {
  const tsConfig = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'tsconfig.json'), 'utf8')
  );
  
  if (tsConfig.compilerOptions?.paths?.['@/*']) {
    console.log('  ✅ Path alias @/* configured');
  } else {
    console.log('  ⚠️  Path alias @/* not found (may cause import issues)');
  }
} catch (error) {
  console.log('  ⚠️  Could not verify tsconfig.json');
}

// Summary
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ All checks passed! incoJS is properly integrated.');
  console.log('\n📋 Next steps:');
  console.log('  1. Run: npm run dev');
  console.log('  2. Visit: http://localhost:3000/test-inco');
  console.log('  3. Connect your wallet (MetaMask)');
  console.log('  4. Run the automated tests');
  console.log('\n📖 See INCO_VERIFICATION_GUIDE.md for detailed testing');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please review the errors above.');
  console.log('\n🔧 To fix:');
  console.log('  1. Run: npm install @inco/js');
  console.log('  2. Ensure all files are created');
  console.log('  3. Run this script again');
  process.exit(1);
}
