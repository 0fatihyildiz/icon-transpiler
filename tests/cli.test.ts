import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';

describe('CLI', () => {
  it('should run CLI without errors', () => {

    try {
      const buildOutput = execSync('pnpm build', { stdio: 'pipe' }).toString();
      console.log('Build output:', buildOutput);
    } catch (error) {
      console.error('Build failed:', error.stderr?.toString() || error.message);
      throw new Error('Build process failed. Check the logs for details.');
    }

    const output = execSync('cd example && node ../dist/index.js --help').toString();
    expect(output).toContain('Usage');
  });
});
