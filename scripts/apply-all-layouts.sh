#!/bin/bash

# Script to apply context-specific layouts to all employee portal pages

echo "🎨 Applying context layouts to all employee portal pages..."

# Function to apply layout to a set of pages
apply_layout() {
    local pattern=$1
    local layout_name=$2
    local layout_import=$3

    for file in $pattern; do
        if [ -f "$file" ]; then
            # Check if layout is not already applied
            if ! grep -q "$layout_name" "$file"; then
                echo "Applying $layout_name to $file..."

                # Add import if not present
                if ! grep -q "from '@/components/layouts/$layout_name'" "$file"; then
                    sed -i '' "/import.*AppLayout/a\\
import { $layout_name } from '@/components/layouts/$layout_name';
" "$file"
                fi

                # Wrap content in layout (handle both <AppLayout> and <AppLayout showMentor={true}>)
                if ! grep -q "<$layout_name>" "$file"; then
                    # Add opening tag after AppLayout
                    sed -i '' "s|<AppLayout>|<AppLayout>\\
      <$layout_name>|g" "$file"
                    sed -i '' "s|<AppLayout showMentor={true}>|<AppLayout showMentor={true}>\\
      <$layout_name>|g" "$file"

                    # Add closing tag before </AppLayout>
                    sed -i '' "s|</AppLayout>|      </$layout_name>\\
    </AppLayout>|g" "$file"
                fi
            fi
        fi
    done
}

# Apply TALayout to all TA pages
echo "📍 Applying TALayout..."
apply_layout "src/app/employee/ta/*/page.tsx" "TALayout"

# Apply HRLayout to all HR pages
echo "📍 Applying HRLayout..."
apply_layout "src/app/employee/hr/*/page.tsx" "HRLayout"

# Apply SharedLayout to all Shared pages
echo "📍 Applying SharedLayout..."
apply_layout "src/app/employee/shared/*/page.tsx" "SharedLayout"

# Apply AcademyLayout to all Academy pages
echo "📍 Applying AcademyLayout..."
apply_layout "src/app/employee/academy/admin/*/page.tsx" "AcademyLayout"
apply_layout "src/app/employee/academy/admin/*/*/page.tsx" "AcademyLayout"

# Apply AdminLayout to all Admin pages
echo "📍 Applying AdminLayout..."
apply_layout "src/app/employee/admin/*/page.tsx" "AdminLayout"

# Apply CEOLayout to all CEO pages
echo "📍 Applying CEOLayout..."
apply_layout "src/app/employee/ceo/*/page.tsx" "CEOLayout"

# Apply ImmigrationLayout to all Immigration pages
echo "📍 Applying ImmigrationLayout..."
apply_layout "src/app/employee/immigration/*/page.tsx" "ImmigrationLayout"

echo "✅ All context layouts applied successfully!"
