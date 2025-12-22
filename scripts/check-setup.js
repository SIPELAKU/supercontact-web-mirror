#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking project setup...\n');

// Check tsconfig.json
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  
  console.log('✅ tsconfig.json found');
  
  if (tsconfig.compilerOptions?.baseUrl === '.') {
    console.log('✅ baseUrl is correctly set to "."');
  } else {
    console.log('❌ baseUrl should be set to "."');
  }
  
  if (tsconfig.compilerOptions?.paths?.['@/*']) {
    console.log('✅ Path mapping for "@/*" is configured');
  } else {
    console.log('❌ Path mapping for "@/*" is missing');
  }
} else {
  console.log('❌ tsconfig.json not found');
}

// Check VSCode settings
const vscodeSettingsPath = path.join(process.cwd(), '.vscode', 'settings.json');
if (fs.existsSync(vscodeSettingsPath)) {
  console.log('✅ VSCode settings found');
  
  const settings = JSON.parse(fs.readFileSync(vscodeSettingsPath, 'utf8'));
  
  if (settings['typescript.preferences.importModuleSpecifier'] === 'shortest') {
    console.log('✅ TypeScript import preferences configured');
  } else {
    console.log('⚠️  Consider setting typescript.preferences.importModuleSpecifier to "shortest"');
  }
} else {
  console.log('⚠️  VSCode settings not found - consider adding .vscode/settings.json');
}

// Check package.json scripts
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  console.log('✅ package.json found');
  
  const requiredScripts = ['dev', 'build', 'lint', 'type-check'];
  const missingScripts = requiredScripts.filter(script => !pkg.scripts?.[script]);
  
  if (missingScripts.length === 0) {
    console.log('✅ All required scripts are present');
  } else {
    console.log(`⚠️  Missing scripts: ${missingScripts.join(', ')}`);
  }
}

// Check environment file
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
} else {
  console.log('⚠️  .env file not found - copy from .env.example if available');
}

console.log('\n🎉 Setup check complete!');
console.log('\nIf you see any ❌ or ⚠️  items, please fix them for optimal development experience.');
console.log('\nFor more details, see DEVELOPMENT.md');