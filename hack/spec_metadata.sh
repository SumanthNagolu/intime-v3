#!/bin/bash
# Outputs metadata for research documents

echo "date: $(date -Iseconds)"
echo "git_commit: $(git rev-parse --short HEAD)"
echo "branch: $(git branch --show-current)"
echo "repository: $(basename $(git rev-parse --show-toplevel))"



