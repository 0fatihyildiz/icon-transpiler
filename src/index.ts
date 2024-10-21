import { glob } from "glob";
import * as fs from "fs";
import * as path from "path";
import * as xml2js from "xml2js";
import { cli } from "cleye";

const argv = cli({
    name: 'transpile-iconify',

    parameters: ['<svg-path>'],
    help: {
        description: 'Transform SVG files into JSON format for Iconify',
        examples: [
            'transpile-iconify ./path/to/icons/**/*.svg',
            'transpile-iconify ./path/to/icons/**/*.svg --output=icons.json',
            'transpile-iconify ./path/to/icons/**/*.svg --output=icons.json --prefix=iconify',
        ],
        usage: 'transpile-iconify <svg-path> [options]',
        version: '0.0.3',
    },

    flags: {
        output: {
            type: String,
            description: 'Output JSON filename',
            default: 'icons.json',
        },
        prefix: {
            type: String,
            description: 'Prefix for the icons',
        }
    }
});

async function TransformSVG(svgPath: string, outputFilename: string, prefix?: string) {
    const svgFiles = await glob(svgPath);

    const output: Record<string, any> = {};

    for (const svgFilePath of svgFiles) {
        const svgContent = await fs.promises.readFile(svgFilePath, "utf8");

        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(svgContent);

        const svgInnerContent = result.svg;
        delete svgInnerContent.$;

        const body = svgInnerContent.path?.map((p: any) => p.$).map((p: any) => `<path d="${p.d}" fill="currentColor"/>`).join('\n') || '';

        const width = svgInnerContent.$?.width || 24;
        const height = svgInnerContent.$?.height || 24;

        const iconName = path.basename(svgFilePath, '.svg');

        const folderName = prefix || path.basename(path.dirname(svgFilePath));

        if (!output[folderName]) {
            output[folderName] = {
                prefix: folderName,
                icons: {}
            };
        }

        output[folderName].icons[iconName] = {
            body,
            width: parseInt(width),
            height: parseInt(height)
        };
    }

    const outputPath = path.join(process.cwd(), outputFilename);
    await fs.promises.writeFile(outputPath, JSON.stringify(output, null, 2), "utf8");

    console.log(`All SVG files have been transformed into ${outputPath}`);
}

TransformSVG(argv._.svgPath, argv.flags.output, argv.flags.prefix);

