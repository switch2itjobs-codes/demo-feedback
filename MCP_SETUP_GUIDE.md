# MCP Setup Guide for Vercel and Supabase

This guide will help you configure MCP (Model Context Protocol) access for Vercel and Supabase in Cursor IDE.

## Prerequisites

1. **Vercel Account** - You need a Vercel account with API access
2. **Supabase Account** - You need a Supabase account with API access
3. **Node.js** - MCP servers typically run via Node.js

## Step 1: Get Your API Tokens

### Vercel Token
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: "Cursor MCP Access"
4. Set expiration (or leave as "No expiration")
5. Copy the token (you'll only see it once!)

### Supabase Credentials
You already have these from your project:
- **Supabase URL**: `https://bwuydoljkgiawackigzj.supabase.co`
- **Supabase Service Role Key**: (from your Supabase project settings)

## Step 2: Install MCP Servers

Open your terminal and run:

```bash
# Install Vercel MCP Server
npm install -g @modelcontextprotocol/server-vercel

# Install Supabase MCP Server  
npm install -g @supabase/mcp-server
```

Or if using npx (no global install needed):
- Vercel: `npx @modelcontextprotocol/server-vercel`
- Supabase: `npx @supabase/mcp-server`

## Step 3: Configure MCP in Cursor

### Option A: Via Cursor Settings UI
1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Search for "MCP" or "Model Context Protocol"
3. Click "Add MCP Server"
4. Add both servers with their configurations

### Option B: Via Settings File
1. Open Cursor Settings
2. Click the "Open Settings (JSON)" icon
3. Add the following configuration:

```json
{
  "mcpServers": {
    "vercel": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-vercel"],
      "env": {
        "VERCEL_TOKEN": "your-vercel-token-here"
      }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "https://bwuydoljkgiawackigzj.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key-here"
      }
    }
  }
}
```

## Step 4: Restart Cursor

After adding the configuration, restart Cursor IDE completely for the MCP servers to initialize.

## Step 5: Verify MCP Access

Once configured, I (the AI assistant) will be able to:
- ✅ Configure Vercel environment variables
- ✅ Check deployment status
- ✅ Trigger redeployments
- ✅ Query Supabase database
- ✅ Manage Supabase resources

## Troubleshooting

### MCP servers not connecting
- Ensure Node.js is installed: `node --version`
- Check that npx is available: `npx --version`
- Restart Cursor completely
- Check Cursor's MCP logs (usually in Developer Tools)

### Authentication errors
- Verify your Vercel token is valid
- Ensure Supabase credentials are correct
- Check that tokens haven't expired

### Server not found
- Try installing globally: `npm install -g @modelcontextprotocol/server-vercel`
- Or use the full path to npx/node

## Alternative: Manual Configuration

If MCP setup is complex, I can guide you through manual Vercel configuration instead. Just let me know!

