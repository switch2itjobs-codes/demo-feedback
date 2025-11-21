# Quick MCP Setup Instructions

## ✅ Supabase MCP - Already Configured!
Your Supabase credentials are already set in `.cursor/mcp.json`.

## 🔑 Vercel MCP - Need Your Token

To complete the setup, you need to:

### Step 1: Get Your Vercel Token
1. Go to: https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Name it: `Cursor MCP Access`
4. Copy the token (you'll only see it once!)

### Step 2: Add Token to MCP Config
Open `.cursor/mcp.json` and replace `YOUR_VERCEL_TOKEN_HERE` with your actual token.

Or run this command (replace `YOUR_TOKEN` with your actual token):
```bash
# On macOS/Linux:
sed -i '' 's/YOUR_VERCEL_TOKEN_HERE/YOUR_ACTUAL_TOKEN/g' .cursor/mcp.json

# On Windows (PowerShell):
(Get-Content .cursor/mcp.json) -replace 'YOUR_VERCEL_TOKEN_HERE', 'YOUR_ACTUAL_TOKEN' | Set-Content .cursor/mcp.json
```

### Step 3: Restart Cursor
1. Completely quit Cursor IDE (Cmd+Q on Mac, Alt+F4 on Windows)
2. Reopen Cursor
3. The MCP servers should now be connected!

## ✅ Verify It's Working
Once restarted, I (the AI) will be able to:
- Configure Vercel environment variables automatically
- Check deployment status
- Manage your Supabase database
- Deploy and redeploy your app

## 🚀 Next Steps
After MCP is set up, just ask me to:
- "Configure Vercel environment variables"
- "Deploy to Vercel"
- "Check deployment status"
- "Sync data from Google Sheets to Supabase"

And I'll do it all automatically! 🎉

