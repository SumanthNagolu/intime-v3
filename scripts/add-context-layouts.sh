#!/bin/bash

# Script to add context-specific layouts to all employee portal pages

# Update all bench pages
for file in src/app/employee/bench/*/page.tsx src/app/employee/bench/*/*/page.tsx; do
  if [ -f "$file" ] && ! grep -q "BenchLayout" "$file"; then
    echo "Updating $file..."

    # Add import
    sed -i '' '/import.*AppLayout/a\
import { BenchLayout } from '\''@/components/layouts/BenchLayout'\'';
' "$file"

    # Wrap component in BenchLayout
    sed -i '' 's|<AppLayout showMentor={true}>|<AppLayout showMentor={true}>\n      <BenchLayout>|g' "$file"
    sed -i '' 's|    </AppLayout>|      </BenchLayout>\n    </AppLayout>|g' "$file"
  fi
done

# Update all recruiting pages
for file in src/app/employee/recruiting/*/page.tsx src/app/employee/recruiting/*/*/page.tsx src/app/employee/recruiting/*/*/*/page.tsx; do
  if [ -f "$file" ] && ! grep -q "RecruitingLayout" "$file"; then
    echo "Updating $file..."

    # Add import
    sed -i '' '/import.*AppLayout/a\
import { RecruitingLayout } from '\''@/components/layouts/RecruitingLayout'\'';
' "$file"

    # Wrap component in RecruitingLayout
    sed -i '' 's|<AppLayout showMentor={true}>|<AppLayout showMentor={true}>\n      <RecruitingLayout>|g' "$file"
    sed -i '' 's|    </AppLayout>|      </RecruitingLayout>\n    </AppLayout>|g' "$file"
  fi
done

echo "✅ Context layouts added to all bench and recruiting pages!"
