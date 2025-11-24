#!/usr/bin/env tsx
/**
 * Automated React Router → Next.js conversion script
 * Converts imports, navigation, and adds 'use client' directives
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const COMPONENTS_DIR = 'src/components';

// Conversion patterns
const conversions = [
  // Import conversions
  {
    from: /import\s+{\s*Link,\s*useLocation,\s*useNavigate\s*}\s+from\s+['"]react-router-dom['"];?/g,
    to: "import Link from 'next/link';\nimport { useRouter, usePathname } from 'next/navigation';",
  },
  {
    from: /import\s+{\s*Link\s*}\s+from\s+['"]react-router-dom['"];?/g,
    to: "import Link from 'next/link';",
  },
  {
    from: /import\s+{\s*useNavigate\s*}\s+from\s+['"]react-router-dom['"];?/g,
    to: "import { useRouter } from 'next/navigation';",
  },
  {
    from: /import\s+{\s*useLocation\s*}\s+from\s+['"]react-router-dom['"];?/g,
    to: "import { usePathname } from 'next/navigation';",
  },
  {
    from: /import\s+{\s*Navigate\s*}\s+from\s+['"]react-router-dom['"];?/g,
    to: "import { redirect } from 'next/navigation';",
  },

  // Hook conversions
  {
    from: /const\s+navigate\s*=\s*useNavigate\(\);?/g,
    to: 'const router = useRouter();',
  },
  {
    from: /const\s+location\s*=\s*useLocation\(\);?/g,
    to: 'const pathname = usePathname();',
  },

  // Navigation conversions
  {
    from: /navigate\(['"]([^'"]+)['"]\)/g,
    to: 'router.push(\'$1\')',
  },
  {
    from: /location\.pathname/g,
    to: 'pathname',
  },

  // Link component conversions (to attribute)
  {
    from: /<Link\s+to=/g,
    to: '<Link href=',
  },
];

function shouldProcessFile(filename: string): boolean {
  return filename.endsWith('.tsx') || filename.endsWith('.ts');
}

function addUseClientDirective(content: string): string {
  // Add 'use client' if file uses hooks or event handlers
  const needsUseClient = content.match(
    /(useState|useEffect|useRouter|usePathname|onClick|onChange|onSubmit)/
  );

  if (needsUseClient && !content.startsWith("'use client'")) {
    return "'use client';\n\n" + content;
  }

  return content;
}

function convertFile(filepath: string): void {
  try {
    let content = readFileSync(filepath, 'utf-8');
    let modified = false;

    // Apply all conversions
    for (const { from, to } of conversions) {
      const newContent = content.replace(from, to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }

    // Add 'use client' if needed
    const withDirective = addUseClientDirective(content);
    if (withDirective !== content) {
      content = withDirective;
      modified = true;
    }

    // Update relative imports
    content = content.replace(
      /from\s+['"]\.\.\/lib\/([^'"]+)['"]/g,
      "from '@/lib/$1'"
    );
    content = content.replace(
      /from\s+['"]\.\.\/components\/([^'"]+)['"]/g,
      "from '@/components/$1'"
    );
    content = content.replace(
      /from\s+['"]\.\/([^'"]+)['"]/g,
      (match, path) => {
        if (path.startsWith('types')) return `from '@/types'`;
        if (path.startsWith('lib/')) return `from '@/${path}'`;
        return match;
      }
    );

    if (modified) {
      writeFileSync(filepath, content, 'utf-8');
      console.log(`✓ Converted: ${filepath}`);
    }
  } catch (error) {
    console.error(`✗ Error converting ${filepath}:`, error);
  }
}

function processDirectory(dir: string): void {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && entry !== 'ui') {
      // Recursively process subdirectories (skip ui folder)
      processDirectory(fullPath);
    } else if (stat.isFile() && shouldProcessFile(entry)) {
      convertFile(fullPath);
    }
  }
}

console.log('🔄 Converting React Router → Next.js...\n');
processDirectory(COMPONENTS_DIR);
console.log('\n✅ Conversion complete!');
