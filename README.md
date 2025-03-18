# Iconify Transpile

![Coverage](https://img.shields.io/badge/coverage-92.1%25-brightgreen)

A powerful tool for converting SVG icons to Iconify JSON format with advanced features like icon cleanup and optimization.

## Features

- Convert SVG icons to Iconify JSON format
- Clean and optimize SVG files using @iconify/tools
- Configurable expected sizes and validation
- Multiple icon sets processing in a single run
- Custom prefixes for icon sets

## Installation

```bash
# Install globally
npm install -g iconify-transpile

# Or run with npx
npx iconify-transpile
```

## Usage

```bash
iconify-transpile --config=iconify.config.js
```

### Options

- `--config`: Path to configuration file (default: 'iconify.config.json')

## Configuration File

Create a JavaScript or JSON configuration file that defines your icon sets:

```js
// iconify.config.js
module.exports = [
  {
    sourceDir: './path/to/icons',
    targetFile: './dist/icons.json',
    prefix: 'custom-icons',
    expectedSize: 24,
    iconSetInfo: {
      name: 'Custom Icon Set',
      author: {
        name: 'Your Name',
        url: 'https://example.com'
      },
      license: {
        title: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    }
  },
  // You can add more icon sets here
];
```

### Configuration Options

Each icon set configuration supports these properties:

- `sourceDir`: Directory containing SVG icon files
- `targetFile`: Output JSON file path
- `prefix`: Icon set prefix used in Iconify
- `expectedSize` (optional): Validates that icons have the expected dimensions
- `iconSetInfo`: Metadata about the icon set (name, author, license, etc.)

## How It Works

1. The tool reads your configuration file
2. For each icon set in the configuration:
   - Imports SVG files from the specified directory
   - Cleans and optimizes SVG content
   - Validates dimensions if expectedSize is provided
   - Converts colors to `currentColor` for proper theming
   - Exports to Iconify JSON format

## Output Format

The generated JSON files follow the Iconify JSON format:

```json
{
  "prefix": "custom-icons",
  "icons": {
    "icon-name": {
      "body": "<path d=\"...\" fill=\"currentColor\"/>",
      "width": 24,
      "height": 24
    }
  }
}
```

## Test Coverage

This project uses `vitest` for testing. To generate a coverage report, run the following command:

```bash
pnpm test
```

The coverage report will be available in the `coverage/` directory. Open `coverage/index.html` in your browser to view detailed coverage information.

## Dependencies

- @iconify/tools: For SVG cleaning and optimization
- @iconify/types: For TypeScript type definitions
- cleye: For command-line argument parsing

## License

[MIT License](https://opensource.org/licenses/MIT)
