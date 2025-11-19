#!/usr/bin/env node

/**
 * Simple validation script for Compatibility Chaos
 * Checks for common issues before deployment
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

let hasErrors = false;

console.log('🔍 Validating project files...\n');

// Check required files exist
const requiredFiles = [
  'index.html',
  'index-prod.html',
  'app.js',
  'app-prod.js',
  'questions.js',
  'questions-scenarios.js',
  'style.css',
  'style-prod.css',
  'email-service.js',
  'llm-config.js',
  'supabase-config.js',
  'auth-extended.js',
  'db-helpers.js',
  'api/send-email.js',
  'api/generate-insights.js',
  '.env.example',
  'vercel.json',
  'package.json'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  const filePath = join(rootDir, file);
  if (!existsSync(filePath)) {
    console.error(`  ❌ Missing: ${file}`);
    hasErrors = true;
  } else {
    console.log(`  ✅ Found: ${file}`);
  }
});

// Check API functions have proper export
console.log('\n🔌 Checking API functions...');
const apiFiles = ['api/send-email.js', 'api/generate-insights.js'];
apiFiles.forEach(file => {
  const filePath = join(rootDir, file);
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf-8');
    if (!content.includes('export default')) {
      console.error(`  ❌ ${file} missing 'export default'`);
      hasErrors = true;
    } else {
      console.log(`  ✅ ${file} has export default`);
    }
  }
});

// Check vercel.json is valid JSON
console.log('\n📋 Checking vercel.json...');
try {
  const vercelConfig = JSON.parse(readFileSync(join(rootDir, 'vercel.json'), 'utf-8'));
  if (!vercelConfig.version) {
    console.error('  ❌ vercel.json missing version field');
    hasErrors = true;
  } else {
    console.log('  ✅ vercel.json is valid');
  }
} catch (error) {
  console.error(`  ❌ vercel.json parse error: ${error.message}`);
  hasErrors = true;
}

// Check package.json is valid
console.log('\n📦 Checking package.json...');
try {
  const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
  if (!pkg.name || !pkg.version) {
    console.error('  ❌ package.json missing name or version');
    hasErrors = true;
  } else {
    console.log(`  ✅ package.json valid (${pkg.name} v${pkg.version})`);
  }
} catch (error) {
  console.error(`  ❌ package.json parse error: ${error.message}`);
  hasErrors = true;
}

// Check .env.example has all required variables
console.log('\n🔐 Checking .env.example...');
const requiredEnvVars = [
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'RESEND_FROM_NAME',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'LLM_PROVIDER',
  'LLM_MODEL',
  'LLM_TEMPERATURE'
];

const envExample = readFileSync(join(rootDir, '.env.example'), 'utf-8');
requiredEnvVars.forEach(envVar => {
  if (!envExample.includes(envVar)) {
    console.error(`  ❌ Missing env var: ${envVar}`);
    hasErrors = true;
  } else {
    console.log(`  ✅ Found: ${envVar}`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('❌ Validation FAILED - Please fix errors above');
  process.exit(1);
} else {
  console.log('✅ All validations PASSED');
  console.log('🚀 Ready for deployment!');
  process.exit(0);
}
