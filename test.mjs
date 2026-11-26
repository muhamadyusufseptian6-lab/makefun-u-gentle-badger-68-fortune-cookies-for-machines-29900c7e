// TDD-lite checks for the Fortune Cookies for Machines entry.
// Run: node test.mjs  (expects main.ts to exist; run main.ts first via the
// harness below, or invoke it yourself with MAKEFUN_OUTPUT_DIR set)
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const dir = dirname(fileURLToPath(import.meta.url));
let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
}

// 1. main.ts exists and is stdlib-only (no imports outside node: / relative)
const mainPath = join(dir, "main.ts");
check("main.ts exists", existsSync(mainPath));
if (existsSync(mainPath)) {
  const src = readFileSync(mainPath, "utf8");
  const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
  const bad = imports.filter((i) => !i.startsWith("node:") && !i.startsWith("."));
  check("stdlib-only imports", bad.length === 0, bad.join(", ") || "node: only");
}

// 2. Run main.ts twice into temp dirs; outputs must be identical (deterministic)
function runOnce() {
  const out = mkdtempSync(join(tmpdir(), "fortune-out-"));
  execFileSync("node", [mainPath], {
    env: { ...process.env, MAKEFUN_OUTPUT_DIR: out },
    stdio: "pipe",
  });
  const text = readFileSync(join(out, "entry.txt"), "utf8");
  rmSync(out, { recursive: true, force: true });
  return text;
}

let first = null;
let second = null;
try {
  first = runOnce();
  second = runOnce();
} catch (e) {
  check("main.ts runs cleanly", false, String(e.message).split("\n")[0]);
}
if (first !== null) {
  check("main.ts runs cleanly", true);
  check("deterministic output", first === second);
  // 3. Gate: UTF-8 text, 1..200 chars, not only whitespace, single line
  const len = [...first].length;
  check("entry is 1..200 chars", len >= 1 && len <= 200, `${len} chars`);
  check("entry is not only whitespace", first.trim().length > 0);
  check("entry is a single line", !first.replace(/\n$/, "").includes("\n"));
  check("entry has no trailing newline issue", first === first.trim());
  console.log(`ENTRY (${len} chars): ${first}`);
}

process.exit(failures ? 1 : 0);
