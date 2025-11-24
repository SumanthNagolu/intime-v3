#!/bin/bash

# Environment Variables Checker
# Shows which variables are set and which need values

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Environment Variables Status${NC}"
echo -e "${BLUE}========================================${NC}\n"

if [ ! -f ".env.local" ]; then
    echo -e "${RED}✗ .env.local file not found${NC}\n"
    exit 1
fi

# Function to check if variable has a real value
check_var() {
    local VAR_NAME=$1
    local REQUIRED=$2
    local VALUE=$(grep "^${VAR_NAME}=" .env.local | cut -d'=' -f2- | tr -d '"' | tr -d "'")

    # Check if variable exists and has a non-placeholder value
    if [ -z "$VALUE" ] || [[ "$VALUE" == *"your_"* ]] || [[ "$VALUE" == *"your-"* ]]; then
        if [ "$REQUIRED" = "required" ]; then
            echo -e "${RED}✗ ${VAR_NAME}${NC} ${RED}[REQUIRED - MISSING]${NC}"
            return 1
        else
            echo -e "${YELLOW}⊘ ${VAR_NAME}${NC} ${YELLOW}[OPTIONAL - NOT SET]${NC}"
            return 2
        fi
    else
        # Mask sensitive values
        local DISPLAY_VALUE="$VALUE"
        if [ ${#VALUE} -gt 20 ]; then
            DISPLAY_VALUE="${VALUE:0:10}...${VALUE: -10}"
        fi
        echo -e "${GREEN}✓ ${VAR_NAME}${NC} = ${BLUE}${DISPLAY_VALUE}${NC}"
        return 0
    fi
}

echo -e "${BLUE}Required Variables:${NC}\n"
REQUIRED_MISSING=0

check_var "NEXT_PUBLIC_SUPABASE_URL" "required" || ((REQUIRED_MISSING++))
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "required" || ((REQUIRED_MISSING++))
check_var "SUPABASE_SERVICE_ROLE_KEY" "required" || ((REQUIRED_MISSING++))
check_var "NEXT_PUBLIC_APP_URL" "required" || ((REQUIRED_MISSING++))

echo -e "\n${BLUE}Optional Variables:${NC}\n"

check_var "NEXT_PUBLIC_SENTRY_DSN" "optional"
check_var "SENTRY_ORG" "optional"
check_var "SENTRY_PROJECT" "optional"
check_var "SENTRY_AUTH_TOKEN" "optional"
check_var "OPENAI_API_KEY" "optional"
check_var "ANTHROPIC_API_KEY" "optional"
check_var "RESEND_API_KEY" "optional"
check_var "REMINDER_EMAIL_FROM" "optional"
check_var "REMINDER_CRON_SECRET" "optional"
check_var "GITHUB_TOKEN" "optional"

echo -e "\n${BLUE}Vercel-Generated Variables:${NC}\n"
check_var "VERCEL_OIDC_TOKEN" "optional"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}========================================${NC}\n"

if [ $REQUIRED_MISSING -eq 0 ]; then
    echo -e "${GREEN}✓ All required variables are set!${NC}\n"
    echo -e "${YELLOW}Next step: Add these same variables to Vercel dashboard${NC}"
    echo -e "${YELLOW}URL: https://vercel.com/team_OTUu5KkOBTEFrGO5RjFdSlSY/intime-v3/settings/environment-variables${NC}\n"
else
    echo -e "${RED}✗ ${REQUIRED_MISSING} required variable(s) missing${NC}\n"
    echo -e "${YELLOW}To get values:${NC}"
    echo -e "  Supabase: ${BLUE}https://app.supabase.com/project/_/settings/api${NC}\n"
    echo -e "${YELLOW}After filling in values, run this script again to verify.${NC}\n"
fi
