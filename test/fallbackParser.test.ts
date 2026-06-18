import assert from "node:assert/strict";
import test from "node:test";
import { parsePythonSymbols } from "../src/fallbackParser";

test("parses classes, methods, functions, async functions, and nesting", () => {
  const symbols = parsePythonSymbols(`
def main():
    def nested():
        pass

class ReportParser:
    def __init__(self):
        pass

    async def parse(self):
        pass

async def load_data():
    pass
`);

  assert.deepEqual(
    symbols.map((symbol) => ({
      name: symbol.name,
      kind: symbol.kind,
      async: symbol.isAsync,
      children: symbol.children.map((child) => ({
        name: child.name,
        kind: child.kind,
        async: child.isAsync
      }))
    })),
    [
      {
        name: "main",
        kind: "function",
        async: false,
        children: [{ name: "nested", kind: "function", async: false }]
      },
      {
        name: "ReportParser",
        kind: "class",
        async: false,
        children: [
          { name: "__init__", kind: "method", async: false },
          { name: "parse", kind: "method", async: true }
        ]
      },
      {
        name: "load_data",
        kind: "function",
        async: true,
        children: []
      }
    ]
  );
});

test("ignores comments and declaration-like text that does not start a line", () => {
  const symbols = parsePythonSymbols(`
# def commented_out():
message = "def not_a_function():"
    # class AlsoIgnored:
`);

  assert.deepEqual(symbols, []);
});
