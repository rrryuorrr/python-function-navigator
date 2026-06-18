import * as vscode from "vscode";
import { parsePythonSymbols, ParsedSymbol } from "./fallbackParser";
import {
  NavigatorSymbolKind,
  SymbolItem
} from "./symbolItem";

type SymbolProviderResult = vscode.DocumentSymbol[] | vscode.SymbolInformation[];

export class SymbolTreeProvider implements vscode.TreeDataProvider<SymbolItem> {
  private readonly treeChanged = new vscode.EventEmitter<SymbolItem | undefined>();
  private items: SymbolItem[] = [];
  private stateMessage = "No Python file active";
  private refreshVersion = 0;

  public readonly onDidChangeTreeData = this.treeChanged.event;

  public getTreeItem(element: SymbolItem): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: SymbolItem): SymbolItem[] {
    if (element) {
      return element.children;
    }

    if (this.items.length > 0) {
      return this.items;
    }

    return [this.createMessageItem(this.stateMessage)];
  }

  public async refresh(editor = vscode.window.activeTextEditor): Promise<void> {
    const version = ++this.refreshVersion;

    if (!editor || editor.document.languageId !== "python") {
      this.items = [];
      this.stateMessage = "No Python file active";
      this.treeChanged.fire(undefined);
      return;
    }

    const document = editor.document;
    let items: SymbolItem[] = [];

    try {
      const result = await vscode.commands.executeCommand<SymbolProviderResult>(
        "vscode.executeDocumentSymbolProvider",
        document.uri
      );
      items = this.fromProviderResult(result, document);
    } catch {
      items = [];
    }

    if (version !== this.refreshVersion) {
      return;
    }

    if (items.length === 0) {
      items = this.fromFallback(document);
    }

    if (version !== this.refreshVersion) {
      return;
    }

    this.items = items;
    this.stateMessage = "No functions found";
    this.treeChanged.fire(undefined);
  }

  private fromProviderResult(
    result: SymbolProviderResult | undefined,
    document: vscode.TextDocument
  ): SymbolItem[] {
    if (!result || result.length === 0) {
      return [];
    }

    if ("children" in result[0]) {
      return (result as vscode.DocumentSymbol[]).flatMap((symbol) =>
        this.fromDocumentSymbol(symbol, document, undefined)
      );
    }

    return (result as vscode.SymbolInformation[])
      .filter((symbol) => isSupportedKind(symbol.kind))
      .map(
        (symbol) =>
          new SymbolItem(
            symbol.name,
            mapKind(symbol.kind, symbol.name, undefined),
            symbol.location.uri,
            symbol.location.range,
            symbol.location.range
          )
      );
  }

  private fromDocumentSymbol(
    symbol: vscode.DocumentSymbol,
    document: vscode.TextDocument,
    parentKind: vscode.SymbolKind | undefined
  ): SymbolItem[] {
    const childItems = symbol.children.flatMap((child) =>
      this.fromDocumentSymbol(child, document, symbol.kind)
    );

    if (!isSupportedKind(symbol.kind)) {
      return childItems;
    }

    const kind = mapKind(
      symbol.kind,
      symbol.name,
      parentKind,
      isAsyncDeclaration(document, symbol.selectionRange)
    );
    return [
      new SymbolItem(
        symbol.name,
        kind,
        document.uri,
        symbol.range,
        symbol.selectionRange,
        childItems,
        symbol.detail
      )
    ];
  }

  private fromFallback(document: vscode.TextDocument): SymbolItem[] {
    return parsePythonSymbols(document.getText()).map((symbol) =>
      this.fromParsedSymbol(symbol, document)
    );
  }

  private fromParsedSymbol(
    symbol: ParsedSymbol,
    document: vscode.TextDocument
  ): SymbolItem {
    const line = document.lineAt(symbol.line);
    const nameStart = Math.max(line.text.indexOf(symbol.name, symbol.character), 0);
    const range = line.range;
    const selectionRange = new vscode.Range(
      symbol.line,
      nameStart,
      symbol.line,
      nameStart + symbol.name.length
    );
    const kind: NavigatorSymbolKind =
      symbol.kind === "class"
        ? "class"
        : symbol.kind === "method"
          ? symbol.name === "__init__"
            ? "constructor"
            : "method"
          : symbol.isAsync
            ? "asyncFunction"
            : "function";

    return new SymbolItem(
      symbol.name,
      kind,
      document.uri,
      range,
      selectionRange,
      symbol.children.map((child) => this.fromParsedSymbol(child, document))
    );
  }

  private createMessageItem(message: string): SymbolItem {
    const item = new SymbolItem(
      message,
      "function",
      vscode.Uri.parse("untitled:python-function-navigator"),
      new vscode.Range(0, 0, 0, 0),
      new vscode.Range(0, 0, 0, 0)
    );
    item.label = message;
    item.iconPath = new vscode.ThemeIcon("info");
    item.command = undefined;
    item.tooltip = message;
    return item;
  }
}

function isSupportedKind(kind: vscode.SymbolKind): boolean {
  return [
    vscode.SymbolKind.Class,
    vscode.SymbolKind.Function,
    vscode.SymbolKind.Method,
    vscode.SymbolKind.Constructor
  ].includes(kind);
}

function mapKind(
  kind: vscode.SymbolKind,
  name: string,
  parentKind: vscode.SymbolKind | undefined,
  isAsync = false
): NavigatorSymbolKind {
  if (kind === vscode.SymbolKind.Class) {
    return "class";
  }
  if (kind === vscode.SymbolKind.Constructor || name === "__init__") {
    return "constructor";
  }
  if (kind === vscode.SymbolKind.Method || parentKind === vscode.SymbolKind.Class) {
    return isAsync ? "asyncMethod" : "method";
  }
  return isAsync ? "asyncFunction" : "function";
}

function isAsyncDeclaration(
  document: vscode.TextDocument,
  selectionRange: vscode.Range
): boolean {
  const lineText = document.lineAt(selectionRange.start.line).text;
  return /^\s*async\s+def\b/.test(lineText);
}
