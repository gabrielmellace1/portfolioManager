#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const testScripts = {
  unit: 'jest --testPathPattern=__tests__/utils --verbose',
  entities: 'jest --testPathPattern=__tests__/entities --verbose',
  services: 'jest --testPathPattern=__tests__/services --verbose',
  api: 'jest --testPathPattern=__tests__/api --verbose',
  all: 'jest --verbose',
  coverage: 'jest --coverage --verbose',
  watch: 'jest --watch --verbose',
};

const args = process.argv.slice(2);
const testType = args[0] || 'all';

if (!testScripts[testType as keyof typeof testScripts]) {
  console.error(`Invalid test type: ${testType}`);
  console.error(`Available types: ${Object.keys(testScripts).join(', ')}`);
  process.exit(1);
}

const script = testScripts[testType as keyof typeof testScripts];

console.log(`Running ${testType} tests...`);
console.log(`Command: ${script}`);

try {
  execSync(script, { 
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log(`✅ ${testType} tests completed successfully`);
} catch (error) {
  console.error(`❌ ${testType} tests failed`);
  process.exit(1);
}
