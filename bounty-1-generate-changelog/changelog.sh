#!/usr/bin/env bash
set -euo pipefail

OUTPUT_FILE="${1:-CHANGELOG.md}"
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

if [ -n "$LAST_TAG" ]; then
  RANGE="${LAST_TAG}..HEAD"
  HEADER_RANGE="Since ${LAST_TAG}"
else
  RANGE="HEAD"
  HEADER_RANGE="Initial Release"
fi

ADDED=""
FIXED=""
CHANGED=""
REMOVED=""

while IFS='|' read -r hash subject author date; do
  [ -z "$hash" ] && continue
  lower_subj=$(echo "$subject" | tr '[:upper:]' '[:lower:]')
  entry="- ${subject} (`${hash}` by ${author})"
  if [[ "$lower_subj" =~ ^(feat|add|new|create) ]] || [[ "$lower_subj" =~ (add|support|implement) ]]; then
    ADDED+="${entry}"$'\n'
  elif [[ "$lower_subj" =~ ^(fix|bug|hotfix|patch) ]] || [[ "$lower_subj" =~ (fix|resolve|prevent) ]]; then
    FIXED+="${entry}"$'\n'
  elif [[ "$lower_subj" =~ ^(remove|delete|drop|clean|deprecate) ]]; then
    REMOVED+="${entry}"$'\n'
  else
    CHANGED+="${entry}"$'\n'
  fi
done < <(git log "$RANGE" --no-merges --pretty=format:"%h|%s|%an|%ad" --date=short)

{
  echo "# Changelog"
  echo ""
  echo "## [Unreleased] - $(date +%Y-%m-%d) (${HEADER_RANGE})"
  echo ""
  echo "### Added"
  echo "${ADDED:-- _No additions_}"
  echo ""
  echo "### Fixed"
  echo "${FIXED:-- _No fixes_}"
  echo ""
  echo "### Changed"
  echo "${CHANGED:-- _No changes_}"
  echo ""
  echo "### Removed"
  echo "${REMOVED:-- _No removals_}"
} > "$OUTPUT_FILE"

echo "Generated structured changelog at $OUTPUT_FILE"
