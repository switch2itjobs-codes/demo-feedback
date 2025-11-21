#!/bin/bash

# Script to add environment variables to Vercel project
# Usage: ./add-env-vars.sh

PROJECT_ID="prj_DJBkVdTprLNSlaV26vvz7jWlZxLg"
TEAM_ID="team_rZ0Krgnx7nLsUDAH1Nuo1SsZ"
VERCEL_TOKEN="${VERCEL_TOKEN:-}"

if [ -z "$VERCEL_TOKEN" ]; then
  echo "Error: VERCEL_TOKEN environment variable is not set"
  echo "Please set it by running: export VERCEL_TOKEN=your_token_here"
  echo "Or run: vercel login"
  exit 1
fi

echo "Adding environment variables to Vercel project..."

# Add SUPABASE_URL
echo "Adding SUPABASE_URL..."
curl -X POST "https://api.vercel.com/v10/projects/${PROJECT_ID}/env?upsert=true&teamId=${TEAM_ID}" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "SUPABASE_URL",
    "value": "https://bwuydoljkgiawackigzj.supabase.co",
    "type": "plain",
    "target": ["production", "preview", "development"]
  }'

echo ""
echo ""

# Add SUPABASE_SERVICE_ROLE_KEY
echo "Adding SUPABASE_SERVICE_ROLE_KEY..."
curl -X POST "https://api.vercel.com/v10/projects/${PROJECT_ID}/env?upsert=true&teamId=${TEAM_ID}" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "SUPABASE_SERVICE_ROLE_KEY",
    "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dXlkb2xqa2dpYXdhY2tpZ3pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcxOTQzNiwiZXhwIjoyMDc3Mjk1NDM2fQ.WVNTM9uR7KJy_w6-opLN7i8bjaznXEe0j7JfKQ7sfJE",
    "type": "encrypted",
    "target": ["production", "preview", "development"]
  }'

echo ""
echo ""
echo "✅ Environment variables added successfully!"
echo "Next step: Redeploy your project from the Vercel dashboard"

