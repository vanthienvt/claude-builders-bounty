# Automated Weekly GitHub Dev Summary — n8n + Claude API (`Closes #5`)

Exportable n8n workflow (`weekly-github-dev-summary.json`) that runs every Friday at 17:00, fetches weekly commits, closed issues, and merged PRs from GitHub, synthesizes a narrative executive digest via `claude-sonnet-4-20250514`, and posts it to Slack or Discord.

## Setup in 4 Steps
1. Open n8n and choose **Import from File** -> select `weekly-github-dev-summary.json`.
2. Set environment variables: `GITHUB_TOKEN`, `ANTHROPIC_API_KEY`, `DISCORD_SLACK_WEBHOOK_URL`.
3. Configure `GITHUB_REPO` (e.g., `owner/repo`) and `SUMMARY_LANGUAGE` (`EN` or `FR`) in the **Config Variables** node.
4. Toggle workflow to **Active**.

## Author / Payout
- GitHub: `@vanthienvt`
- Base/EVM Wallet: `0xbD2FCFF2296D0F364Bf40514Bd964FA4921f6F86`
