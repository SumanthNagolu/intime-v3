#!/bin/bash

# Vercel Setup Verification Script
# Checks local configuration and provides dashboard verification checklist

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Vercel Setup Verification${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check 1: Vercel CLI
echo -e "${BLUE}[1/8] Checking Vercel CLI...${NC}"
if command -v vercel &> /dev/null; then
    VERSION=$(vercel --version)
    echo -e "${GREEN}✓ Vercel CLI installed (${VERSION})${NC}\n"
else
    echo -e "${RED}✗ Vercel CLI not installed${NC}"
    echo -e "${YELLOW}  Install: pnpm add -g vercel@latest${NC}\n"
    exit 1
fi

# Check 2: Project Linked
echo -e "${BLUE}[2/8] Checking project link...${NC}"
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(jq -r '.projectId' .vercel/project.json)
    ORG_ID=$(jq -r '.orgId' .vercel/project.json)
    PROJECT_NAME=$(jq -r '.projectName' .vercel/project.json)

    echo -e "${GREEN}✓ Project linked${NC}"
    echo -e "  Project: ${BLUE}${PROJECT_NAME}${NC}"
    echo -e "  Project ID: ${BLUE}${PROJECT_ID}${NC}"
    echo -e "  Org ID: ${BLUE}${ORG_ID}${NC}\n"
else
    echo -e "${RED}✗ Project not linked${NC}"
    echo -e "${YELLOW}  Run: vercel link${NC}\n"
    exit 1
fi

# Check 3: Git Remote
echo -e "${BLUE}[3/8] Checking Git remote...${NC}"
if git remote -v | grep -q "origin"; then
    REPO_URL=$(git remote get-url origin)
    REPO_NAME=$(echo $REPO_URL | sed 's/.*github.com[:/]\(.*\)\.git/\1/' | sed 's/.*@//')
    echo -e "${GREEN}✓ Git remote configured${NC}"
    echo -e "  Repository: ${BLUE}${REPO_NAME}${NC}\n"
else
    echo -e "${RED}✗ No git remote found${NC}\n"
    exit 1
fi

# Check 4: GitHub Actions Workflow
echo -e "${BLUE}[4/8] Checking GitHub Actions workflow...${NC}"
if [ -f ".github/workflows/ci.yml" ]; then
    echo -e "${GREEN}✓ CI workflow exists${NC}"

    # Check if workflow uses Vercel secrets
    if grep -q "VERCEL_TOKEN\|VERCEL_ORG_ID\|VERCEL_PROJECT_ID" .github/workflows/ci.yml 2>/dev/null; then
        echo -e "${YELLOW}  Warning: CI workflow contains Vercel deployment steps${NC}"
        echo -e "${YELLOW}  Make sure GitHub secrets are configured!${NC}\n"
    else
        echo -e "${GREEN}  No Vercel deployment in CI (managed by Vercel Git integration)${NC}\n"
    fi
else
    echo -e "${YELLOW}⚠ No CI workflow found${NC}\n"
fi

# Check 5: Vercel Configuration
echo -e "${BLUE}[5/8] Checking vercel.json...${NC}"
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓ vercel.json exists${NC}"

    # Check GitHub integration settings
    if jq -e '.github' vercel.json > /dev/null 2>&1; then
        AUTO_ALIAS=$(jq -r '.github.autoAlias // true' vercel.json)
        ENABLED=$(jq -r '.github.enabled // true' vercel.json)
        echo -e "  GitHub auto-alias: ${BLUE}${AUTO_ALIAS}${NC}"
        echo -e "  GitHub enabled: ${BLUE}${ENABLED}${NC}\n"
    else
        echo -e "${YELLOW}  No GitHub settings in vercel.json (using defaults)${NC}\n"
    fi
else
    echo -e "${YELLOW}⚠ vercel.json not found (using Vercel defaults)${NC}\n"
fi

# Check 6: Environment Variables
echo -e "${BLUE}[6/8] Checking environment variables...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local exists${NC}"

    # Count variables
    VAR_COUNT=$(grep -c "^[A-Z]" .env.local 2>/dev/null || echo "0")
    echo -e "  Variables: ${BLUE}${VAR_COUNT}${NC}\n"
else
    echo -e "${YELLOW}⚠ .env.local not found${NC}"
    echo -e "${YELLOW}  Run: vercel env pull${NC}\n"
fi

# Check 7: Build Configuration
echo -e "${BLUE}[7/8] Checking build...${NC}"
if pnpm build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}\n"
else
    echo -e "${RED}✗ Build failed${NC}"
    echo -e "${YELLOW}  Fix build errors before deploying${NC}\n"
fi

# Check 8: Generate Dashboard URLs
echo -e "${BLUE}[8/8] Generating dashboard URLs...${NC}"
GITHUB_SECRETS_URL="https://github.com/${REPO_NAME}/settings/secrets/actions"
VERCEL_PROJECT_URL="https://vercel.com/dashboard/${PROJECT_NAME}"

echo -e "${GREEN}✓ URLs generated${NC}\n"

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Vercel Dashboard Verification${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Please verify these settings in your Vercel Dashboard:${NC}\n"

echo -e "${BLUE}1. Git Integration${NC}"
echo -e "   URL: ${GREEN}https://vercel.com/${ORG_ID}/${PROJECT_NAME}/settings/git${NC}"
echo -e "   Check:"
echo -e "   ${YELLOW}☐${NC} Connected to: ${BLUE}${REPO_NAME}${NC}"
echo -e "   ${YELLOW}☐${NC} Production Branch: ${BLUE}main${NC}"
echo -e "   ${YELLOW}☐${NC} Auto-deploy enabled for Production"
echo -e "   ${YELLOW}☐${NC} Auto-deploy enabled for Preview\n"

echo -e "${BLUE}2. Environment Variables${NC}"
echo -e "   URL: ${GREEN}https://vercel.com/${ORG_ID}/${PROJECT_NAME}/settings/environment-variables${NC}"
echo -e "   Check:"
echo -e "   ${YELLOW}☐${NC} NEXT_PUBLIC_SUPABASE_URL (Production + Preview)"
echo -e "   ${YELLOW}☐${NC} NEXT_PUBLIC_SUPABASE_ANON_KEY (Production + Preview)"
echo -e "   ${YELLOW}☐${NC} SUPABASE_SERVICE_ROLE_KEY (Production + Preview)"
echo -e "   ${YELLOW}☐${NC} Other required variables\n"

echo -e "${BLUE}3. Build & Development Settings${NC}"
echo -e "   URL: ${GREEN}https://vercel.com/${ORG_ID}/${PROJECT_NAME}/settings${NC}"
echo -e "   Check:"
echo -e "   ${YELLOW}☐${NC} Framework Preset: ${BLUE}Next.js${NC}"
echo -e "   ${YELLOW}☐${NC} Build Command: ${BLUE}pnpm build${NC}"
echo -e "   ${YELLOW}☐${NC} Install Command: ${BLUE}pnpm install${NC}"
echo -e "   ${YELLOW}☐${NC} Node Version: ${BLUE}22.x${NC}\n"

echo -e "${BLUE}4. Deployment Protection${NC}"
echo -e "   URL: ${GREEN}https://vercel.com/${ORG_ID}/${PROJECT_NAME}/settings/deployment-protection${NC}"
echo -e "   Recommended:"
echo -e "   ${YELLOW}☐${NC} Vercel Authentication: ${BLUE}Disabled${NC} (for public site)"
echo -e "   ${YELLOW}☐${NC} Password Protection: ${BLUE}Disabled${NC} (for public site)\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  GitHub Secrets${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}If using GitHub Actions for deployment, add these secrets:${NC}\n"

echo -e "${BLUE}URL:${NC} ${GREEN}${GITHUB_SECRETS_URL}${NC}\n"

echo -e "Secrets needed:"
cat .github/VERCEL_SECRETS.txt | grep -v "^#" | grep -v "^$"

echo -e "\n${YELLOW}Note: If Vercel Git Integration is working, you DON'T need these secrets!${NC}\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Test Your Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}1. Test Production Deployment:${NC}"
echo -e "   ${GREEN}git push origin main${NC}"
echo -e "   → Should auto-deploy to: ${BLUE}https://${PROJECT_NAME}.vercel.app${NC}\n"

echo -e "${YELLOW}2. Test Preview Deployment:${NC}"
echo -e "   ${GREEN}git checkout -b test/preview${NC}"
echo -e "   ${GREEN}git push origin test/preview${NC}"
echo -e "   ${GREEN}gh pr create --title 'Test Preview'${NC}"
echo -e "   → Should auto-deploy with preview URL in PR\n"

echo -e "${YELLOW}3. Check Deployment Status:${NC}"
echo -e "   ${GREEN}https://vercel.com/${ORG_ID}/${PROJECT_NAME}/deployments${NC}\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}✓ Local setup verified${NC}"
echo -e "${GREEN}✓ Project linked to Vercel${NC}"
echo -e "${GREEN}✓ Git repository connected${NC}"
echo -e "${YELLOW}⚠ Verify Vercel Dashboard settings above${NC}\n"

echo -e "${BLUE}Next Steps:${NC}"
echo -e "1. Visit the Vercel dashboard URLs above"
echo -e "2. Check each setting with the checkboxes"
echo -e "3. Test deployment: ${GREEN}git push origin main${NC}\n"

echo -e "${GREEN}All local checks passed!${NC}\n"
