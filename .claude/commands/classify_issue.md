# Github Issue Command Selection

Classify the GitHub issue and respond with ONLY the command.

## Rules

- Output ONLY ONE of these exact strings, nothing else:
  - `/chore` - for maintenance, docs, refactoring
  - `/bug` - for bug fixes
  - `/feature` - for new features
  - `0` - if none of the above

- NO explanations, NO reasoning, NO other text
- Your entire response must be exactly one of the 4 options above

## Github Issue

$ARGUMENTS