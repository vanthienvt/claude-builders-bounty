# PreToolUse Destructive Bash & SQL Guard (`Closes #3`)

Zero-dependency Claude Code `PreToolUse` hook that intercepts and blocks destructive Bash and SQL operations before execution, while logging blocked attempts to `~/.claude/blocked-commands.log`.

## Features
- Blocks `rm -rf /`, `mkfs`, `dd if=`, fork bombs, `DROP TABLE`, `TRUNCATE TABLE`, `DELETE FROM` without `WHERE`, `git reset --hard`, `git push --force`, `chmod -R 777 /`, `.env` / SSH key exfiltration, and `curl | bash`.
- Returns clear recovery suggestions on `stderr` and exits with code `2` so Claude Code halts safely.
- Appends JSONL audit entries to `~/.claude/blocked-commands.log`.

## Payout / Author
- GitHub: `@vanthienvt`
- Base/EVM Wallet (USDC/ETH): `0xbD2FCFF2296D0F364Bf40514Bd964FA4921f6F86`
