import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('CLI Entry Point', () => {
  it('should work with the dedicated CLI entry point', () => {
    const output = execSync('node ../dist/cli.js --help', { cwd: 'example' }).toString();
    expect(output).toContain('Usage:');
    expect(output).toContain('Transform SVG files into JSON format for Iconify');
    expect(output).toContain('--config');
    expect(output).toContain('--debug');
  });

  it('should be able to import index.js without auto-execution', async () => {
    // This test ensures that importing index.js doesn't automatically execute main()
    // This is crucial for npx compatibility
    const indexModule = await import('../src/index.js');
    expect(indexModule.main).toBeDefined();
    expect(indexModule.convertSvgIconsToIconifyJSON).toBeDefined();
    expect(typeof indexModule.main).toBe('function');
  });
});