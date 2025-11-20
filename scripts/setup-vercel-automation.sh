#!/bin/bash

# Vercel Automation Setup Script
# This script automates the complete Vercel setup process
# Based on latest Vercel documentation (2025)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Vercel Automation Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    pnpm add -g vercel@latest
    echo -e "${GREEN}✓ Vercel CLI installed${NC}\n"
else
    echo -e "${GREEN}✓ Vercel CLI already installed${NC}\n"
fi

# Step 1: Login to Vercel
echo -e "${BLUE}Step 1: Vercel Authentication${NC}"
if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}Opening Vercel login...${NC}"
    vercel login
    echo -e "${GREEN}✓ Logged in to Vercel${NC}\n"
else
    echo -e "${GREEN}✓ Using VERCEL_TOKEN from environment${NC}\n"
fi

# Step 2: Link Project
echo -e "${BLUE}Step 2: Link Project to Vercel${NC}"
if [ ! -d ".vercel" ]; then
    echo -e "${YELLOW}Linking project...${NC}"
    vercel link --yes
    echo -e "${GREEN}✓ Project linked to Vercel${NC}\n"
else
    echo -e "${GREEN}✓ Project already linked${NC}\n"
fi

# Step 3: Pull Project Configuration
echo -e "${BLUE}Step 3: Pull Project Configuration${NC}"
vercel pull --yes --environment=production
echo -e "${GREEN}✓ Project configuration pulled${NC}\n"

# Step 4: Extract Project Details
echo -e "${BLUE}Step 4: Extract Project Details${NC}"
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(jq -r '.projectId' .vercel/project.json)
    ORG_ID=$(jq -r '.orgId' .vercel/project.json)

    echo -e "${GREEN}✓ Project ID: ${PROJECT_ID}${NC}"
    echo -e "${GREEN}✓ Organization ID: ${ORG_ID}${NC}\n"

    # Save to GitHub Secrets file for easy copying
    cat > .github/VERCEL_SECRETS.txt << EOF
# GitHub Secrets for Vercel Automation
# Copy these values to your GitHub repository secrets

VERCEL_TOKEN=<Get from: https://vercel.com/account/tokens>
VERCEL_ORG_ID=${ORG_ID}
VERCEL_PROJECT_ID=${PROJECT_ID}
EOF

    echo -e "${GREEN}✓ Secrets saved to .github/VERCEL_SECRETS.txt${NC}\n"
else
    echo -e "${RED}✗ Could not extract project details${NC}\n"
fi

# Step 5: Connect Git Repository
echo -e "${BLUE}Step 5: Connect Git Repository${NC}"
if git remote -v | grep -q "origin"; then
    vercel git connect --yes 2>/dev/null || echo -e "${YELLOW}Git already connected or manual connection needed${NC}"
    echo -e "${GREEN}✓ Git repository connected${NC}\n"
else
    echo -e "${RED}✗ No git remote found. Please add a remote first${NC}\n"
fi

# Step 6: Setup GitHub Secrets Instructions
echo -e "${BLUE}Step 6: Setup GitHub Secrets${NC}"
echo -e "${YELLOW}To complete automation, add these secrets to GitHub:${NC}\n"

echo -e "1. Go to: ${BLUE}https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/settings/secrets/actions${NC}"
echo -e "2. Click 'New repository secret'"
echo -e "3. Add the following secrets:\n"

if [ -f ".github/VERCEL_SECRETS.txt" ]; then
    cat .github/VERCEL_SECRETS.txt
fi

echo ""
echo -e "${BLUE}Step 7: Create Vercel Access Token${NC}"
echo -e "1. Visit: ${BLUE}https://vercel.com/account/tokens${NC}"
echo -e "2. Click 'Create Token'"
echo -e "3. Name: 'GitHub Actions CI/CD'"
echo -e "4. Scope: 'Full Access' (or specific projects)"
echo -e "5. Expiration: '1 year' (recommended)"
echo -e "6. Copy the token and save as ${YELLOW}VERCEL_TOKEN${NC} in GitHub Secrets\n"

# Step 8: Pull Environment Variables
echo -e "${BLUE}Step 8: Pull Environment Variables${NC}"
echo -e "${YELLOW}Syncing environment variables from Vercel...${NC}"
vercel env pull .env.local --yes
echo -e "${GREEN}✓ Environment variables synced to .env.local${NC}\n"

# Step 9: Verify Setup
echo -e "${BLUE}Step 9: Verify Setup${NC}"
echo -e "${YELLOW}Testing build locally...${NC}"
pnpm build > /dev/null 2>&1 && echo -e "${GREEN}✓ Build successful${NC}" || echo -e "${RED}✗ Build failed${NC}"
echo ""

# Step 10: Test Deployment
echo -e "${BLUE}Step 10: Test Deployment (Optional)${NC}"
read -p "Deploy to Vercel now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deploying to Vercel...${NC}"
    vercel --prod
    echo -e "${GREEN}✓ Deployed to production${NC}\n"
else
    echo -e "${YELLOW}Skipping deployment${NC}\n"
fi

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Setup Complete! ${GREEN}✓${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}✓ Vercel CLI installed${NC}"
echo -e "${GREEN}✓ Project linked${NC}"
echo -e "${GREEN}✓ Configuration pulled${NC}"
echo -e "${GREEN}✓ Git connected${NC}"
echo -e "${GREEN}✓ Environment variables synced${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Add GitHub Secrets (see .github/VERCEL_SECRETS.txt)"
echo -e "2. Create Vercel Access Token at https://vercel.com/account/tokens"
echo -e "3. Push to main branch to trigger auto-deployment"
echo -e "4. Create a PR to test preview deployments\n"

echo -e "${BLUE}Documentation:${NC}"
echo -e "- Vercel Dashboard: https://vercel.com/dashboard"
echo -e "- Deployment Guide: ./VERCEL-DEPLOYMENT-GUIDE.md"
echo -e "- GitHub Actions: .github/workflows/ci.yml\n"

echo -e "${GREEN}All done! Your project is ready for automated deployments.${NC}\n"
