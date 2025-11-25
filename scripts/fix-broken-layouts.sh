#!/bin/bash

# Script to fix broken layout wrappers in bench and recruiting pages

echo "🔧 Fixing broken layout wrappers..."

# Fix bench pages that have closing </BenchLayout> but no opening tag
for file in src/app/employee/bench/*/page.tsx src/app/employee/bench/*/*/page.tsx; do
  if [ -f "$file" ]; then
    # Check if file has closing tag but is missing proper opening tag
    if grep -q "</BenchLayout>" "$file" && ! grep -q "<BenchLayout>" "$file"; then
      echo "Fixing $file..."

      # Add opening tag after <AppLayout> or <AppLayout showMentor={true}>
      sed -i '' 's|<AppLayout>|<AppLayout>\n      <BenchLayout>|g' "$file"
      sed -i '' 's|<AppLayout showMentor={true}>|<AppLayout showMentor={true}>\n      <BenchLayout>|g' "$file"

      # Ensure closing tags are properly indented
      sed -i '' 's|</BenchLayout>|      </BenchLayout>|g' "$file"
    fi
  fi
done

# Fix recruiting pages that have closing </RecruitingLayout> but no opening tag
for file in src/app/employee/recruiting/*/page.tsx src/app/employee/recruiting/*/*/page.tsx src/app/employee/recruiting/*/*/*/page.tsx; do
  if [ -f "$file" ]; then
    # Check if file has closing tag but is missing proper opening tag
    if grep -q "</RecruitingLayout>" "$file" && ! grep -q "<RecruitingLayout>" "$file"; then
      echo "Fixing $file..."

      # Add opening tag after <AppLayout> or <AppLayout showMentor={true}>
      sed -i '' 's|<AppLayout>|<AppLayout>\n      <RecruitingLayout>|g' "$file"
      sed -i '' 's|<AppLayout showMentor={true}>|<AppLayout showMentor={true}>\n      <RecruitingLayout>|g' "$file"

      # Ensure closing tags are properly indented
      sed -i '' 's|</RecruitingLayout>|      </RecruitingLayout>|g' "$file"
    fi
  fi
done

echo "✅ Layout wrappers fixed!"
