import { cli } from 'cleye';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { cleanupSVG, importDirectory, isEmptyColor, parseColors, runSVGO } from '@iconify/tools';
const argv = cli({
    name: 'transpile-iconify',
    parameters: [],
    help: {
        description: 'Transform SVG files into JSON format for Iconify',
        examples: [
            'transpile-iconify --config=iconify.config.js',
            'transpile-iconify --config=iconify.config.json',
        ],
        usage: 'transpile-iconify [options]',
        version: '0.1.0',
    },
    flags: {
        config: {
            type: String,
            description: 'Configuration file path',
            default: 'iconify.config.js',
        },
    }
});
async function convertSvgIconsToIconifyJSON(options) {
    const { sourceDir, targetFile, prefix, expectedSize, iconSetInfo, } = options;
    console.log(`Processing icon set: ${prefix}`);
    const iconSet = await importDirectory(sourceDir, {
        prefix,
    });
    iconSet.info = iconSetInfo;
    await iconSet.forEach(async (name, type) => {
        if (type !== 'icon') {
            return;
        }
        const svg = iconSet.toSVG(name);
        if (!svg) {
            console.warn(`Invalid SVG for icon ${name}, removing`);
            iconSet.remove(name);
            return;
        }
        if (expectedSize) {
            const viewBox = svg.viewBox;
            if (viewBox.width !== expectedSize || viewBox.height !== expectedSize) {
                console.error(`Icon ${name} has invalid dimensions: ${viewBox.width} x ${viewBox.height}`);
                iconSet.remove(name);
                return;
            }
        }
        try {
            cleanupSVG(svg);
            parseColors(svg, {
                defaultColor: 'currentColor',
                callback: (_attr, colorStr, color) => {
                    return !color || isEmptyColor(color) ? 'currentColor' : colorStr;
                },
            });
            runSVGO(svg);
        }
        catch (err) {
            console.error(`Error parsing ${name}:`, err);
            iconSet.remove(name);
            return;
        }
        iconSet.fromSVG(name, svg);
    });
    const output = JSON.stringify(iconSet.export(), null, 2);
    const dir = path.dirname(targetFile);
    try {
        await fs.promises.mkdir(dir, { recursive: true });
    }
    catch (err) {
        console.error(`Error creating directory ${dir}:`, err);
    }
    await fs.promises.writeFile(targetFile, output, 'utf8');
    console.log(`Saved ${targetFile} (${output.length} bytes)`);
}
async function processIconSets(options) {
    for (const option of options) {
        await convertSvgIconsToIconifyJSON(option);
    }
}
async function main() {
    const configPath = path.resolve(process.cwd(), argv.flags.config);
    try {
        let config;
        if (configPath.endsWith('.js')) {
            config = require(configPath);
        }
        else {
            const configContent = await fs.promises.readFile(configPath, 'utf8');
            config = JSON.parse(configContent);
        }
        if (!Array.isArray(config)) {
            config = [config];
        }
        await processIconSets(config);
        console.log('All icon sets processed successfully!');
    }
    catch (error) {
        console.error(`Error loading configuration file: ${configPath}`);
        console.error(error);
        process.exit(1);
    }
}
main();
