#!/bin/bash

# Fix operations screens TypeScript errors
# This script fixes common patterns across all operations screen files

cd /Users/sumanthrajkumarnagolu/Projects/intime-v3/src/screens/operations

# 1. Fix span: 'full' -> span: 4
# 2. Fix span: 'half' -> span: 2
find . -name "*.screen.ts" -type f -exec sed -i '' "s/span: 'full',/span: 4,/g" {} \;
find . -name "*.screen.ts" -type f -exec sed -i '' "s/span: 'half',/span: 2,/g" {} \;

# 3. Fix columns: [ -> columns_config: [ (but preserve columns: number)
find . -name "*.screen.ts" -type f -exec perl -i -pe 's/(\s+)columns: \[/\1columns_config: [/g unless /columns: \d/' {} \;

# 4. Fix field: -> path: in table columns (TableColumnDefinition uses path, not field)
# This is tricky - only in columns_config arrays, not in fields arrays
find . -name "*.screen.ts" -type f -exec perl -i -0777 -pe 's/(columns_config: \[[^\]]*?)(\n\s+)field: /\1\2path: /gs' {} \;

echo "Phase 1 complete: Fixed span, columns, and field->path in columns"
