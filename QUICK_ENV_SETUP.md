# Quick Environment Variables Setup

Since Vercel MCP uses OAuth authentication, I need your Vercel token to add environment variables via API.

## Option 1: Use the Script (Recommended)

1. Get your Vercel token:
   - Go to: https://vercel.com/account/tokens
   - Copy your token (or create a new one)

2. Run the setup script:
   ```bash
   export VERCEL_TOKEN=your_token_here
   node setup-vercel-env.js
   ```

## Option 2: Use Vercel CLI

1. Authenticate:
   ```bash
   npx vercel login
   ```

2. Add environment variables:
   ```bash
   # Add SUPABASE_URL
   echo "https://bwuydoljkgiawackigzj.supabase.co" | npx vercel env add SUPABASE_URL production preview development
   
   # Add SUPABASE_SERVICE_ROLE_KEY  
   echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dXlkb2xqa2dpYXdhY2tpZ3pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcxOTQzNiwiZXhwIjoyMDc3Mjk1NDM2fQ.WVNTM9uR7KJy_w6-opLN7i8bjaznXEe0j7JfKQ7sfJE" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development
   ```

## Option 3: Manual (Via Dashboard)

See `ADD_ENV_VARS_TO_VERCEL.md` for step-by-step instructions.

---

**Which option would you prefer?** If you provide your Vercel token, I can run Option 1 for you automatically!

