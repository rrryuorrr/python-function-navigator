# Python Function Navigator

A lightweight VS Code Explorer view for navigating Python classes and
functions. It uses VS Code document symbols when a Python language server is
available and falls back to a small indentation-aware parser when it is not.

## Features

- Lists `class`, `def`, `async def`, methods, constructors, and nested functions.
- Preserves class and nested-function hierarchy.
- Jumps to and selects the symbol name when clicked.
- Refreshes on editor switches and saves.
- Refreshes 400 ms after edits to avoid work on every keystroke.
- Supports offline installation from a prebuilt VSIX file.

## Screenshot

Open `test/sample.py` to see a tree similar to:

```text
Python Functions
├─ def main
│  └─ def nested_helper
├─ class ReportParser
│  ├─ def __init__
│  ├─ def parse
│  └─ def export_csv
└─ async def load_data
```

## Requirements

- VS Code 1.85.0 or newer.
- The Microsoft Python extension is recommended for high-accuracy symbols.
  The bundled fallback parser works without it.

## Offline installation

Copy `python-function-navigator-0.0.1.vsix` to the offline computer, then use
either method:

1. In VS Code, open **Extensions: Install from VSIX...** from the Command
   Palette and select the file.
2. From a terminal:

   ```bash
   code --install-extension python-function-navigator-0.0.1.vsix
   ```

The target computer does not need Node.js, npm, or internet access to install
the VSIX.

## Usage

1. Open a Python file.
2. Open the Explorer side bar.
3. Find the **Python Functions** view.
4. Click a class or function name.
5. The editor jumps to the selected symbol.

Use the refresh icon in the view title or run
**Python Function Navigator: Refresh** if a language server is still starting.

## Development

Node.js 20 or newer and npm are required only on the build computer.

```bash
npm install
npm run compile
npm test
```

Press `F5` in VS Code to launch an Extension Development Host with
`test/sample.py`.

## Packaging

Install dependencies once on an internet-connected build computer:

```bash
npm install
npm run compile
npm test
npm run package
```

The package command creates `python-function-navigator-0.0.1.vsix`. Keep this
file as the offline distribution artifact.

## Verification

The included `test/sample.py` covers:

- a top-level function;
- a nested function;
- a class with constructor and methods;
- an async method;
- an async top-level function.

`npm test` validates fallback parsing. For UI verification, press `F5`, open
the Explorer view, click each symbol, then add or rename a function and confirm
the view refreshes after editing or saving.

## Limitations

- The fallback parser is intentionally lightweight. It does not fully parse
  Python strings, decorators, or every multiline declaration.
- Complete argument lists and docstrings are not displayed.
- Cross-file search and call/import analysis are outside the initial scope.
- Python is the only supported language in version 0.0.1.

## Troubleshooting

### No functions are shown

- Confirm the editor language mode is **Python**.
- Install or enable a Python extension for more accurate document symbols.
- Run **Python Function Navigator: Refresh**.
- If no provider is available, save the file and the fallback parser is used.

### The VSIX cannot be installed

- Confirm VS Code is version 1.85.0 or newer.
- Recopy the VSIX in case the file was corrupted.
- Use the absolute path with `code --install-extension`.

## License

MIT
