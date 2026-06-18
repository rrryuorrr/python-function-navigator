import * as vscode from "vscode";

export type NavigatorSymbolKind =
  | "class"
  | "function"
  | "asyncFunction"
  | "method"
  | "asyncMethod"
  | "constructor";

export class SymbolItem extends vscode.TreeItem {
  public constructor(
    public readonly symbolName: string,
    public readonly symbolKind: NavigatorSymbolKind,
    public readonly uri: vscode.Uri,
    public readonly symbolRange: vscode.Range,
    public readonly selectionRange: vscode.Range,
    public readonly children: SymbolItem[] = [],
    detail?: string
  ) {
    super(
      formatLabel(symbolName, symbolKind),
      children.length > 0
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None
    );

    this.description = detail || undefined;
    this.tooltip = new vscode.MarkdownString(
      `**${formatLabel(symbolName, symbolKind)}**  \nLine ${selectionRange.start.line + 1}`
    );
    this.iconPath = new vscode.ThemeIcon(iconFor(symbolKind));
    this.contextValue = "pythonFunctionNavigator.symbol";
    this.command = {
      command: "pythonFunctionNavigator.revealSymbol",
      title: "Reveal Symbol",
      arguments: [uri, symbolRange, selectionRange]
    };
  }
}

function formatLabel(name: string, kind: NavigatorSymbolKind): string {
  switch (kind) {
    case "class":
      return `class ${name}`;
    case "asyncFunction":
    case "asyncMethod":
      return `async def ${name}`;
    case "function":
      return `def ${name}`;
    case "constructor":
    case "method":
      return `def ${name}`;
  }
}

function iconFor(kind: NavigatorSymbolKind): string {
  switch (kind) {
    case "class":
      return "symbol-class";
    case "constructor":
    case "method":
    case "asyncMethod":
      return "symbol-method";
    case "asyncFunction":
    case "function":
      return "symbol-function";
  }
}
