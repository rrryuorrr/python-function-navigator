export type ParsedSymbolKind = "class" | "function" | "method";

export interface ParsedSymbol {
  name: string;
  kind: ParsedSymbolKind;
  line: number;
  character: number;
  indent: number;
  isAsync: boolean;
  children: ParsedSymbol[];
}

interface MatchResult {
  name: string;
  declaration: "class" | "function";
  isAsync: boolean;
  character: number;
}

const declarationPattern =
  /^(\s*)(?:(async)\s+)?(def|class)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(|:)/;

export function parsePythonSymbols(text: string): ParsedSymbol[] {
  const roots: ParsedSymbol[] = [];
  const stack: ParsedSymbol[] = [];
  const lines = text.split(/\r?\n/);

  lines.forEach((lineText, lineNumber) => {
    const match = matchDeclaration(lineText);
    if (!match) {
      return;
    }

    const indent = indentationWidth(lineText.slice(0, match.character));
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];
    const symbol: ParsedSymbol = {
      name: match.name,
      kind:
        match.declaration === "class"
          ? "class"
          : parent?.kind === "class"
            ? "method"
            : "function",
      line: lineNumber,
      character: match.character,
      indent,
      isAsync: match.isAsync,
      children: []
    };

    if (parent) {
      parent.children.push(symbol);
    } else {
      roots.push(symbol);
    }

    stack.push(symbol);
  });

  return roots;
}

function matchDeclaration(lineText: string): MatchResult | undefined {
  const trimmed = lineText.trimStart();
  if (trimmed.startsWith("#")) {
    return undefined;
  }

  const match = declarationPattern.exec(lineText);
  if (!match) {
    return undefined;
  }

  return {
    name: match[4],
    declaration: match[3] as "class" | "function",
    isAsync: match[2] === "async",
    character: match[1].length
  };
}

function indentationWidth(indentation: string): number {
  return [...indentation].reduce(
    (width, character) => width + (character === "\t" ? 4 : 1),
    0
  );
}
