import { describe, it, expect, vi } from 'vitest';

describe('index.ts', () => {
  it('should export all expected functions and classes', async () => {
    // Reset modules and mock dependencies before importing index.ts
    vi.resetModules();
    const index = await import('../src/index');
    expect(index).toMatchObject({
      main: expect.any(Function),
    });
  });

  it('should throw an error when configuration loading fails', async () => {
    vi.resetModules();
    const index = await import('../src/index');
    await expect(index.main()).rejects.toThrow(/Configuration loading failed/);
  });

  it.skip('should correctly execute exported function', () => {
    // expect(result).toBe('expected output');
  });

  it('should process valid configuration file successfully', async () => {
    // Setup temporary directory and config file
    const os = await import('node:os');
    const path = await import('node:path');
    const fs = await import('node:fs');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'iconify-test-'));
    const configPath = path.join(tmpDir, 'iconify.config.json');
    const targetFile = path.join(tmpDir, 'icons.json');
    const config = [{
      sourceDir: tmpDir,
      targetFile,
      prefix: 'test',
      expectedSize: 24,
      iconSetInfo: { 
        name: 'Test', 
        author: { name: 'Test Author', url: '' }, 
        license: { title: 'MIT', url: '' } 
      }
    }];
    fs.writeFileSync(configPath, JSON.stringify(config), 'utf8');

    // Define dummyIconSet and setup mocks for '@iconify/tools'
    const dummyIconSet = {
      info: {},
      forEach: async (_cb: Function) => {},
      toSVG: (_name: string) => ({ viewBox: { width: 24, height: 24 } }),
      remove: (_name: string) => {},
      fromSVG: (_name: string, _svg: any) => {},
      export: () => ({ icons: {} }),
    };

    vi.resetModules();
    vi.doMock('@iconify/tools', () => ({
      importDirectory: async () => dummyIconSet,
      cleanupSVG: () => {},
      parseColors: () => {},
      runSVGO: () => {},
      isEmptyColor: () => false,
    }));

    // Re-import index.ts after setting up the mock
    const index = await import('../src/index');

    // Change working directory so that the config file is found
    const originalCwd = process.cwd();
    process.chdir(tmpDir);
    await expect(index.main()).resolves.toBeUndefined();
    process.chdir(originalCwd);
  });

  it('should cover all branches in convertSvgIconsToIconifyJSON', async () => {
    const os = await import('node:os');
    const path = await import('node:path');
    const fs = await import('node:fs');

    const svgMap = {
      icon1: null,
      icon2: { viewBox: { width: 20, height: 20 } },
      icon3: { viewBox: { width: 24, height: 24 } },
      icon4: { viewBox: { width: 24, height: 24, __isIcon4: true } }
    };

    // Create a dummy iconSet to simulate various branches.
    const dummyIconSet = {
      info: {},
      forEach: async (cb: (name: string, type: string) => Promise<void>) => {
        await cb('nonIcon', 'folder'); // not an icon
        await cb('icon1', 'icon');       // toSVG returns null branch
        await cb('icon2', 'icon');       // wrong size branch
        await cb('icon3', 'icon');       // normal processing branch
        await cb('icon4', 'icon');       // error thrown in try block branch
      },
      toSVG: (name: string) => svgMap[name],
      remove: vi.fn(),
      fromSVG: vi.fn(),
      export: () => ({ icons: { dummy: {} } }),
    };

    vi.resetModules();
    vi.doMock('@iconify/tools', () => ({
      importDirectory: async () => dummyIconSet,
      cleanupSVG: (svg: any) => { /* succeed */ },
      parseColors: (svg: any, opts: any) => opts.callback(null, 'color', 'color'),
      runSVGO: (svg: any) => {
        if (svg && svg.viewBox && svg.viewBox.__isIcon4) {
          throw new Error('SVGO failure');
        }
      },
      isEmptyColor: () => false,
    }));

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'iconify-test-'));
    const targetFile = path.join(tmpDir, 'output.json');
    const configOption = {
      sourceDir: tmpDir,
      targetFile,
      prefix: 'dummy',
      expectedSize: 24,
      iconSetInfo: {
        name: 'Dummy Test',
        author: { name: 'Tester', url: '' },
        license: { title: 'MIT', url: '' }
      }
    };

    const indexModule = await import('../src/index');
    await indexModule.convertSvgIconsToIconifyJSON(configOption);

    // Verify removal calls:
    // icon1 should be removed (invalid, toSVG returned null)
    expect(dummyIconSet.remove).toHaveBeenCalledWith('icon1');
    // icon4 should be removed due to error in runSVGO.
    expect(dummyIconSet.remove).toHaveBeenCalledWith('icon4');
    // And icon3 should be processed via fromSVG.
    expect(dummyIconSet.fromSVG).toHaveBeenCalledWith('icon3', expect.any(Object));
  });
});
