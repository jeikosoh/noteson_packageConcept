#!/bin/bash
PROJECT_NAME="002_NOTES_ON"
BACKUP_DIR="dev_tools/backups/${PROJECT_NAME}"

mkdir -p "$BACKUP_DIR"

# Function to rotate backups
rotate_file() {
  local filename=$1
  local filepath="NOTES_ON_WEB/$filename"
  
  if [ -f "$BACKUP_DIR/${filename}_2" ]; then mv "$BACKUP_DIR/${filename}_2" "$BACKUP_DIR/${filename}_3"; fi
  if [ -f "$BACKUP_DIR/${filename}_1" ]; then mv "$BACKUP_DIR/${filename}_1" "$BACKUP_DIR/${filename}_2"; fi
  if [ -f "$filepath" ]; then cp "$filepath" "$BACKUP_DIR/${filename}_1"; fi
}

rotate_file "index.html"
rotate_file "index.css"
rotate_file "PRD.md"

echo "Backup completed successfully! Backups are stored in $BACKUP_DIR/"
