import * as vscode from "vscode";
import { SymbolTreeProvider } from "./symbolTreeProvider";

const EDIT_DEBOUNCE_MS = 400;

export function activate(context: vscode.ExtensionContext): void {
  const provider = new SymbolTreeProvider();
  let refreshTimer: NodeJS.Timeout | undefined;

  const scheduleRefresh = (): void => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
    refreshTimer = setTimeout(() => {
      void provider.refresh();
    }, EDIT_DEBOUNCE_MS);
  };

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      "pythonFunctionNavigator",
      provider
    ),
    vscode.commands.registerCommand(
      "pythonFunctionNavigator.refresh",
      () => provider.refresh()
    ),
    vscode.commands.registerCommand(
      "pythonFunctionNavigator.revealSymbol",
      async (
        uri: vscode.Uri,
        range: vscode.Range,
        selectionRange?: vscode.Range
      ) => {
        const document = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(document);
        const target = selectionRange ?? range;
        editor.selection = new vscode.Selection(target.start, target.end);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
      }
    ),
    vscode.window.onDidChangeActiveTextEditor(() => {
      void provider.refresh();
    }),
    vscode.workspace.onDidSaveTextDocument((document) => {
      if (document.languageId === "python") {
        void provider.refresh();
      }
    }),
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (
        event.document.languageId === "python" &&
        event.document === vscode.window.activeTextEditor?.document
      ) {
        scheduleRefresh();
      }
    }),
    {
      dispose: () => {
        if (refreshTimer) {
          clearTimeout(refreshTimer);
        }
      }
    }
  );

  void provider.refresh();
}

export function deactivate(): void {
  // VS Code disposes registered resources through the extension context.
}
