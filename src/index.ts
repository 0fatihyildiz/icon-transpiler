#!/usr/bin/env node

import type { IconSetOptions } from './types.ts';
import { cli } from 'cleye';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { 
  cleanupSVG, 
  importDirectory, 
  isEmptyColor, 
  parseColors, 
  runSVGO 
} from '@iconify/tools';

const argv = cli({
  name: 'transpile-iconify',

  parameters: [],
  help: {
    description: 'Transform SVG files into JSON format for Iconify',
    examples: [
      'transpile-iconify --config=iconify.config.js',
      'transpile-iconify --config=iconify.config.json',
      'transpile-iconify --config=iconify.config.js --debug',
    ],
    usage: 'transpile-iconify [options]',
    version: '0.1.0',
  },

  flags: {
    config: {
      type: String,
      description: 'Configuration file path',
      default: 'iconify.config.json',
    },
    debug: {
      type: Boolean,
      description: 'Enable debug mode for verbose logging',
      default: false,
    },
  }
});

function debugLog(debug: boolean, ...args: any[]) {
  if (debug) {
    console.log('[DEBUG]', ...args);
  }
}

async function convertSvgIconsToIconifyJSON(options: IconSetOptions) {
  const {
    sourceDir,
    targetFile,
    prefix,
    expectedSize,
    iconSetInfo,
    debug = false,
  } = options;

  console.log(`Processing icon set: ${prefix}`);
  debugLog(debug, `Source directory: ${sourceDir}`);
  debugLog(debug, `Target file: ${targetFile}`);
  debugLog(debug, `Expected size:`, expectedSize);

  const iconSet = await importDirectory(sourceDir, {
    prefix,
  });
  

  let iconCount = 0;
  await iconSet.forEach(() => {
    iconCount++;
  });
  
  debugLog(debug, `Imported ${iconCount} icons from directory`);

  iconSet.info = iconSetInfo;
  debugLog(debug, `Set icon set info:`, iconSetInfo);

  await iconSet.forEach(async (name, type) => {
    debugLog(debug, `Processing icon: ${name}, type: ${type}`);
    
    if (type !== 'icon') {
      debugLog(debug, `Skipping non-icon: ${name}`);
      return;
    }

    const svg = iconSet.toSVG(name);
    if (!svg) {
      console.warn(`Invalid SVG for icon ${name}, removing`);
      iconSet.remove(name);
      return;
    }
    
    debugLog(debug, `Icon ${name} dimensions: ${svg.viewBox.width} x ${svg.viewBox.height}`);

    if (
      !options.skipSizeValidation &&
      expectedSize &&
      (typeof expectedSize === 'number'
        ? (svg.viewBox.width !== expectedSize || svg.viewBox.height !== expectedSize)
        : (svg.viewBox.width !== expectedSize.width || svg.viewBox.height !== expectedSize.height))
    ) {
      console.warn(`Icon ${name} has unexpected dimensions: ${svg.viewBox.width} x ${svg.viewBox.height}`);
      debugLog(debug, `Expected: ${typeof expectedSize === 'number' ? `${expectedSize} x ${expectedSize}` : `${expectedSize.width} x ${expectedSize.height}`}`);
    }

    try {
      debugLog(debug, `Cleaning up SVG: ${name}`);
      cleanupSVG(svg);
      
      debugLog(debug, `Parsing colors for: ${name}`);
      parseColors(svg, {
        defaultColor: 'currentColor',
        callback: (_attr, colorStr, color) => {
          const result = !color || isEmptyColor(color) ? 'currentColor' : colorStr;
          debugLog(debug, `Color parsing for ${name}: ${colorStr} -> ${result}`);
          return result;
        },
      });
      
      debugLog(debug, `Running SVGO optimization for: ${name}`);
      runSVGO(svg);
    }
    catch (err) {
      console.error(`Error parsing ${name}:`, err);
      debugLog(debug, `Error details:`, err);
      iconSet.remove(name);
      return;
    }

    iconSet.fromSVG(name, svg);
    debugLog(debug, `Successfully processed icon: ${name}`);
  });

  const output = JSON.stringify(iconSet.export(), null, 2);
  debugLog(debug, `JSON output size: ${output.length} bytes`);
  
  const dir = path.dirname(targetFile);
  try {
    debugLog(debug, `Creating directory: ${dir}`);
    await fs.promises.mkdir(dir, { recursive: true });
  }
  catch (err) {
    console.error(`Error creating directory ${dir}:`, err);
    debugLog(debug, `Directory error details:`, err);
  }

  debugLog(debug, `Writing output to: ${targetFile}`);
  await fs.promises.writeFile(targetFile, output, 'utf8');
  console.log(`Saved ${targetFile} (${output.length} bytes)`);
}

async function processIconSets(options: IconSetOptions[], debug: boolean) {
  debugLog(debug, `Processing ${options.length} icon sets`);
  
  for (const option of options) {

    option.debug = option.debug ?? debug;
    await convertSvgIconsToIconifyJSON(option);
  }
}

async function main() {
  const configPath = path.resolve(process.cwd(), argv.flags.config);
  const debug = argv.flags.debug;
  
  debugLog(debug, `Debug mode: enabled`);
  debugLog(debug, `Config path: ${configPath}`);
  
  try {
    let config;
    
    if (configPath.endsWith('.js')) {
      debugLog(debug, `Loading JavaScript config`);
      config = require(configPath);
    } else {
      debugLog(debug, `Loading JSON config`);
      const configContent = await fs.promises.readFile(configPath, 'utf8');
      debugLog(debug, `Config content length: ${configContent.length} bytes`);
      config = JSON.parse(configContent);
    }
    
    if (!Array.isArray(config)) {
      debugLog(debug, `Converting single config to array`);
      config = [config];
    }
    
    debugLog(debug, `Found ${config.length} icon set configurations`);
    await processIconSets(config, debug);
    console.log('All icon sets processed successfully!');
  } catch (error) {
    console.error(`Error loading configuration file: ${configPath}`);
    console.error(error);
    debugLog(debug, `Error details:`, error);
    throw new Error(`Configuration loading failed: ${error}`);
  }
}

import { fileURLToPath } from 'node:url';
if (await fs.promises.realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}

export { main, convertSvgIconsToIconifyJSON };

