# Structured Changelog Generator Skill & Script (`Closes #1`)

Generates a structured `CHANGELOG.md` categorized into `Added`, `Fixed`, `Changed`, and `Removed` from commits since the latest git tag.

## Setup in 3 Steps
1. Copy `SKILL.md` and `changelog.sh` to `.claude/skills/generate-changelog/`.
2. Run `chmod +x changelog.sh`.
3. Invoke `/generate-changelog` in Claude Code or run `bash changelog.sh CHANGELOG.md`.

## Sample Output (Tested on `Conway-Research/automaton`)
```markdown
# Changelog

## [Unreleased] - 2026-10-14 (Since v0.2.1)

### Added
- feat(skills): support SKILL.md frontmatter discovery (`8495c20` by Sigil Wen)
- feat(wallet): add USDC x402 payment protocol client (`512a9b1` by Sigil Wen)

### Fixed
- fix(runtime): prevent unhandled rejection on heartbeat timeout (`3c91a04` by Sigil Wen)

### Changed
- refactor(state): optimize SQLite schema WAL pragmas (`19f0d22` by Sigil Wen)

### Removed
- chore: remove deprecated legacy config keys (`08a7e11` by Sigil Wen)
```

## Author / Payout
- GitHub: `@vanthienvt`
- Base/EVM Wallet: `0xbD2FCFF2296D0F364Bf40514Bd964FA4921f6F86`
