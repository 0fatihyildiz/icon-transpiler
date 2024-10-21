# Transpile Iconify

Transpile Iconify is a command-line tool that transforms SVG files into JSON format for use with Iconify.

## Installation

To install the dependencies, run:

```bash
npm install glob xml2js cleye
```

## Usage

```bash
node transpile-iconify.js <svg-path> [options]
```

### Parameters

- `<svg-path>`: Path to the SVG files you want to transform. Supports glob patterns.

### Options

- `--output`: Output JSON filename (default: 'icons.json')
- `--prefix`: Prefix for the icons

### Examples

```bash
node transpile-iconify.js ./path/to/icons/**/*.svg
node transpile-iconify.js ./path/to/icons/**/*.svg --output=icons.json
node transpile-iconify.js ./path/to/icons/**/*.svg --output=icons.json --prefix=iconify
```

## How It Works

1. The script reads all SVG files from the specified path.
2. It parses each SVG file and extracts the necessary information.
3. The extracted data is transformed into the Iconify JSON format.
4. The resulting JSON is written to the specified output file.

## Output Format

The output JSON file will have the following structure:

```json
{
  "folderName": {
    "prefix": "folderName",
    "icons": {
      "iconName": {
        "body": "<path d=\"...\" fill=\"currentColor\"/>",
        "width": 24,
        "height": 24
      }
    }
  }
}
```

## Dependencies

- glob: For file pattern matching
- xml2js: For parsing SVG files
- cleye: For command-line argument parsing

## License

[MIT License](https://opensource.org/licenses/MIT)
