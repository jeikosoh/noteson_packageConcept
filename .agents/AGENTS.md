
# 1. BACKUP RULE
CRITICAL RULE: Before making ANY modifications to `index.html`, `index.css`, or any other code files, you MUST run `./backup.sh` in the project root.
This script will automatically backup the current state into a project-specific vault (`_BACKUPS/<Project_Name>/`) and keep the last 3 versions to prevent accidental data loss.

# 2. PRD (PRODUCT REQUIREMENTS DOCUMENT) RULE
CRITICAL RULE: After completing a feature or making significant UI/UX/Logic changes, you MUST update the `PRD.md` file in the root directory.
This document serves as the central source of truth for the project's purpose, features, design constraints, and technical stack. Always ensure `PRD.md` accurately reflects the latest project state.
