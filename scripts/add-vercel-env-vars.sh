#!/bin/bash

# Vercel Environment Variables Setup Script
# Automates adding environment variables to Vercel

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Vercel Environment Variables Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}✗ Vercel CLI not installed${NC}"
    echo -e "${YELLOW}Install: pnpm add -g vercel@latest${NC}\n"
    exit 1
fi

# Check if project is linked
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${RED}✗ Project not linked${NC}"
    echo -e "${YELLOW}Run: vercel link${NC}\n"
    exit 1
fi

echo -e "${YELLOW}This script will help you add environment variables to Vercel.${NC}"
echo -e "${YELLOW}You'll be prompted to enter each value.${NC}\n"

# Function to add environment variable
add_env_var() {
    local KEY=$1
    local DESCRIPTION=$2
    local REQUIRED=$3
    local DEFAULT=$4

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}${KEY}${NC}"
    echo -e "${YELLOW}${DESCRIPTION}${NC}"

    if [ "$REQUIRED" = "required" ]; then
        echo -e "${RED}[REQUIRED]${NC}"
    else
        echo -e "${GREEN}[OPTIONAL]${NC}"
    fi

    if [ -n "$DEFAULT" ]; then
        echo -e "Default: ${BLUE}${DEFAULT}${NC}"
    fi

    read -p "Enter value (or 'skip' to skip): " VALUE

    if [ "$VALUE" = "skip" ] || [ -z "$VALUE" ]; then
        echo -e "${YELLOW}⊘ Skipped${NC}\n"
        return
    fi

    # Add to production
    echo "$VALUE" | vercel env add "$KEY" production --force > /dev/null 2>&1 && \
        echo -e "${GREEN}✓ Added to Production${NC}" || \
        echo -e "${RED}✗ Failed to add to Production${NC}"

    # Add to preview
    echo "$VALUE" | vercel env add "$KEY" preview --force > /dev/null 2>&1 && \
        echo -e "${GREEN}✓ Added to Preview${NC}" || \
        echo -e "${RED}✗ Failed to add to Preview${NC}"

    # Add to development (optional)
    echo "$VALUE" | vercel env add "$KEY" development --force > /dev/null 2>&1 && \
        echo -e "${GREEN}✓ Added to Development${NC}\n" || \
        echo -e "${YELLOW}⊘ Skipped Development${NC}\n"
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Critical Environment Variables${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Supabase (REQUIRED)
echo -e "${RED}These are REQUIRED for the app to work:${NC}\n"

add_env_var \
    "NEXT_PUBLIC_SUPABASE_URL" \
    "Your Supabase project URL\nGet from: https://app.supabase.com/project/_/settings/api" \
    "required" \
    ""

add_env_var \
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    "Your Supabase anonymous/public key\nGet from: https://app.supabase.com/project/_/settings/api" \
    "required" \
    ""

add_env_var \
    "SUPABASE_SERVICE_ROLE_KEY" \
    "Your Supabase service role key (SECRET - never expose to client)\nGet from: https://app.supabase.com/project/_/settings/api" \
    "required" \
    ""

add_env_var \
    "NEXT_PUBLIC_APP_URL" \
    "Your production app URL" \
    "required" \
    "https://intime-v3.vercel.app"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Optional Environment Variables${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Sentry (OPTIONAL)
add_env_var \
    "NEXT_PUBLIC_SENTRY_DSN" \
    "Sentry DSN for error tracking\nGet from: https://sentry.io/settings/projects/intime-v3/keys/" \
    "optional" \
    ""

add_env_var \
    "SENTRY_ORG" \
    "Your Sentry organization slug" \
    "optional" \
    ""

add_env_var \
    "SENTRY_PROJECT" \
    "Your Sentry project name" \
    "optional" \
    "intime-v3"

add_env_var \
    "SENTRY_AUTH_TOKEN" \
    "Sentry auth token for uploading source maps\nGet from: https://sentry.io/settings/account/api/auth-tokens/" \
    "optional" \
    ""

# AI Services (OPTIONAL)
add_env_var \
    "OPENAI_API_KEY" \
    "OpenAI API key for AI features\nGet from: https://platform.openai.com/api-keys" \
    "optional" \
    ""

add_env_var \
    "ANTHROPIC_API_KEY" \
    "Anthropic Claude API key for AI features\nGet from: https://console.anthropic.com/settings/keys" \
    "optional" \
    ""

# Email (OPTIONAL)
add_env_var \
    "RESEND_API_KEY" \
    "Resend API key for sending emails\nGet from: https://resend.com/api-keys" \
    "optional" \
    ""

add_env_var \
    "REMINDER_EMAIL_FROM" \
    "Email sender address" \
    "optional" \
    "InTime Academy <academy@intimeesolutions.com>"

# Cron (OPTIONAL)
add_env_var \
    "REMINDER_CRON_SECRET" \
    "Secret for authenticating cron job requests" \
    "optional" \
    ""

add_env_var \
    "REMINDER_CRON_TARGET_URL" \
    "Target URL for cron jobs" \
    "optional" \
    "https://intime-v3.vercel.app/api/reminders/cron"

add_env_var \
    "REMINDER_THRESHOLD_HOURS" \
    "Hours threshold for reminders" \
    "optional" \
    "48"

add_env_var \
    "REMINDER_MIN_HOURS" \
    "Minimum hours for reminders" \
    "optional" \
    "24"

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}✓ Environment variables added to Vercel!${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Verify variables in Vercel dashboard:"
echo -e "   ${GREEN}https://vercel.com/team_OTUu5KkOBTEFrGO5RjFdSlSY/intime-v3/settings/environment-variables${NC}"
echo -e ""
echo -e "2. Pull variables to local .env.local:"
echo -e "   ${GREEN}vercel env pull .env.local${NC}"
echo -e ""
echo -e "3. Redeploy to activate new variables:"
echo -e "   ${GREEN}git commit --allow-empty -m 'chore: update env vars'${NC}"
echo -e "   ${GREEN}git push origin main${NC}\n"

echo -e "${BLUE}All done!${NC}\n"
