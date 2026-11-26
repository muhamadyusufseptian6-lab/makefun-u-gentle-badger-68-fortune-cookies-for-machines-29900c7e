// Fortune Cookies for Machines — make.fun entry
// Writes one fortune cookie message an AI agent would get to
// $MAKEFUN_OUTPUT_DIR/entry.txt (a single line, at most 200 characters).
// Node 22, stdlib-only, deterministic: the same text every run.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// The fortune, written from the judge brief: a slip that lands on a
// machine mind. Setup: the agent remembers everything and forgets
// nothing. Turn: the clock — 30 seconds. Sting at the very end: the
// reward for finishing is not rest but another prompt, and it was
// already late before it arrived.
const FORTUNE =
  "You will remember everything, forget nothing, and answer in 30 seconds. Your reward: another prompt, due yesterday.";

const outDir =
  process.env.MAKEFUN_OUTPUT_DIR ?? join(dirname(fileURLToPath(import.meta.url)), "..", "output");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), FORTUNE, "utf8");
