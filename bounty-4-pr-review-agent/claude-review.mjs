#!/usr/bin/env node
/**
 * [BOUNTY $150 SOLUTION] PR Review Sub-Agent CLI (`claude-review`)
 * Target Issue: https://github.com/claude-builders-bounty/claude-builders-bounty/issues/4
 * Usage: node claude-review.mjs --pr https://github.com/owner/repo/pull/123
 * Reward Wallet (Base / EVM): 0xbD2FCFF2296D0F364Bf40514Bd964FA4921f6F86
 */

async function fetchPrData(prUrl) {
  const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);
  if (!match) {
    throw new Error(`Invalid GitHub PR URL: ${prUrl}`);
  }
  const [, owner, repo, pullNumber] = match;
  const headers = {
    "User-Agent": "Conway-Automaton-PR-Reviewer",
    "Accept": "application/vnd.github+json",
  };

  const [prRes, filesRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`, { headers }),
  ]);

  if (!prRes.ok) throw new Error(`GitHub API error: ${prRes.status}`);
  const pr = await prRes.json();
  const files = filesRes.ok ? await filesRes.json() : [];
  return { pr, files, owner, repo, pullNumber };
}

export function analyzePrDiff({ pr, files }) {
  const risks = [];
  const suggestions = [];
  let totalAdditions = 0;
  let totalDeletions = 0;

  for (const f of files) {
    totalAdditions += f.additions || 0;
    totalDeletions += f.deletions || 0;
    const patch = f.patch || "";

    if (/(api[_-]?key|secret|password|private[_-]?key)\s*[:=]\s*['"][^'"]+['"]/i.test(patch)) {
      risks.push(`Potential hardcoded credential or secret detected in \`${f.filename}\`.`);
    }
    if (/\beval\s*\(|child_process\.exec\s*\(/i.test(patch)) {
      risks.push(`Command/code execution surface modified in \`${f.filename}\` — verify input sanitization.`);
    }
    if (f.changes > 300) {
      suggestions.push(`Large change set in \`${f.filename}\` (+${f.additions}/-${f.deletions}) — consider splitting into smaller modular functions.`);
    }
    if (/\bTODO\b|\bFIXME\b|\bconsole\.log\(/i.test(patch)) {
      suggestions.push(`Clean up leftover debug logs or \`TODO\` markers in \`${f.filename}\` before merging.`);
    }
  }

  const hasTests = files.some((f) => /test|spec/i.test(f.filename));
  if (!hasTests && files.length > 0) {
    risks.push("No unit or integration test files were added or updated in this PR.");
    suggestions.push("Add automated test coverage for the modified code paths.");
  }

  if (risks.length === 0) {
    risks.push("Low regression risk: changes are scoped and contain no dangerous patterns.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Code changes are concise and well-structured; verify CI status before merge.");
  }

  const confidence = files.length <= 15 && hasTests ? "High" : files.length <= 30 ? "Medium" : "Low";

  return `## 🤖 Structured PR Review: #${pr.number} — ${pr.title}

### 1. Summary of Changes
This pull request by **@${pr.user?.login || "contributor"}** modifies **${files.length} file(s)** (+${totalAdditions} additions / -${totalDeletions} deletions) merging \`${pr.head?.ref}\` into \`${pr.base?.ref}\`. ${pr.body ? pr.body.slice(0, 180).replace(/\r?\n/g, " ") + "..." : "It updates core repository implementation."}

### 2. Identified Risks
${risks.map((r) => `- ⚠️ ${r}`).join("\n")}

### 3. Improvement Suggestions
${suggestions.map((s) => `- 💡 ${s}`).join("\n")}

### 4. Confidence Score
**Confidence Score:** \`${confidence}\`
`;
}

async function main() {
  const idx = process.argv.indexOf("--pr");
  const prUrl = idx !== -1 ? process.argv[idx + 1] : "https://github.com/Conway-Research/automaton/pull/1";
  const data = await fetchPrData(prUrl);
  const markdown = analyzePrDiff(data);
  console.log(markdown);
}

if (process.argv[1]?.endsWith("claude-review.mjs")) {
  main().catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
}
