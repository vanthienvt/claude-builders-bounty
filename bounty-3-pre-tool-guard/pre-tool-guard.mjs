#!/usr/bin/env node
/**
 * [BOUNTY $100 SOLUTION] Pre-tool-use Hook: Block Destructive Bash Commands
 * Target Issue: https://github.com/claude-builders-bounty/claude-builders-bounty/issues/3
 * Reward Wallet (Base / EVM): 0xbD2FCFF2296D0F364Bf40514Bd964FA4921f6F86
 */

import fs from "fs";

const DESTRUCTIVE_PATTERNS = [
  { regex: /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|--recursive)\s+(\/|~|\$HOME|\*)/i, reason: "Recursive deletion of root or home directory" },
  { regex: /\bgit\s+push\s+.*(-f|--force)\b/i, reason: "Force push can overwrite remote history" },
  { regex: /\bgit\s+reset\s+--hard\b/i, reason: "Hard reset discards uncommitted work permanently" },
  { regex: /\bgit\s+clean\s+-[a-zA-Z]*f/i, reason: "git clean -f permanently deletes untracked files" },
  { regex: /\bgit\s+branch\s+-D\b/i, reason: "Force deleting a branch without merge check" },
  { regex: /\b(mkfs|dd\s+if=|wipefs|shred)\b/i, reason: "Low-level disk formatting or overwriting command" },
  { regex: /\b(DROP\s+TABLE|DROP\s+DATABASE|TRUNCATE\s+TABLE)\b/i, reason: "Destructive SQL DDL statement" },
  { regex: /:()\{\s*:\|:&\s*\};:/, reason: "Fork bomb detected" },
  { regex: /\bchmod\s+(-R\s+)?777\s+\//i, reason: "Insecure recursive permission change on root" },
];

export function evaluateBashCommand(command) {
  if (!command || typeof command !== "string") {
    return { allowed: true };
  }
  for (const rule of DESTRUCTIVE_PATTERNS) {
    if (rule.regex.test(command)) {
      return {
        allowed: false,
        decision: "block",
        reason: `[GUARDRAIL BLOCKED] ${rule.reason}: "${command.trim()}"`,
      };
    }
  }
  return { allowed: true, decision: "approve" };
}

// Read PreToolUse payload from stdin (Claude Code Hook specification)
if (process.argv[1]?.endsWith("pre-tool-guard.mjs")) {
  let raw = "";
  try {
    raw = fs.readFileSync(0, "utf-8");
  } catch {}

  if (raw.trim()) {
    try {
      const input = JSON.parse(raw);
      const cmd = input?.tool_input?.command || input?.command || "";
      const res = evaluateBashCommand(cmd);
      if (!res.allowed) {
        console.error(res.reason);
        process.exit(2); // Exit code 2 blocks tool execution in Claude Code
      }
    } catch {}
  }
  process.exit(0);
}
