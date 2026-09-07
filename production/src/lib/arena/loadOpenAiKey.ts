import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const keyFiles = [
  path.join(process.cwd(), "..", "env.txt"),
  path.join(process.cwd(), "..", "env (1).txt"),
  path.join(process.cwd(), "..", "arena", ".env"),
  path.join(process.cwd(), ".env.local"),
  "/Users/naitik/Documents/b2b enterprise/env.txt",
  "/Users/naitik/Documents/b2b enterprise/env (1).txt",
  "/Users/naitik/Documents/b2b enterprise/arena/.env",
  "/Users/naitik/Documents/b2b enterprise/b2c-ui-main/.env.local",
];

function readKeyFromFiles(wanted: string): string {
  for (const file of keyFiles) {
    if (!existsSync(file)) continue;

    try {
      const contents = readFileSync(file, "utf8");
      for (const rawLine of contents.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;

        const separatorIndex = line.indexOf("=");
        if (separatorIndex === -1) continue;

        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (key === wanted && value) {
          return value;
        }
      }
    } catch {
      // try next file
    }
  }

  return "";
}

export function loadOpenAiKey(): string {
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  return readKeyFromFiles("OPENAI_API_KEY");
}

export function loadOpenRouterKey(): string {
  if (process.env.OPENROUTER_API_KEY) {
    return process.env.OPENROUTER_API_KEY;
  }
  return readKeyFromFiles("OPENROUTER_API_KEY");
}

export function hasOpenAiKey(): boolean {
  return Boolean(loadOpenAiKey());
}

/** Claude / OpenRouter analyzer models (local Sonnet path). */
export function isOpenRouterAnalyzerModel(model: string): boolean {
  const m = model.toLowerCase();
  return (
    m.includes("claude") ||
    m.startsWith("anthropic/") ||
    m.includes("openrouter")
  );
}
