# Vercel Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. MCP Configuration ✅
- [x] Vercel token added to `.cursor/mcp.json`
- [x] Supabase credentials added to `.cursor/mcp.json`
- [ ] **ACTION REQUIRED**: Restart Cursor IDE completely for MCP to initialize

### 2. Required Environment Variables for Vercel

These need to be set in Vercel Dashboard:

```env
SUPABASE_URL=https://bwuydoljkgiawackigzj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dXlkb2xqa2dpYXdhY2tpZ3pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcxOTQzNiwiZXhwIjoyMDc3Mjk1NDM2fQ.WVNTM9uR7KJy_w6-opLN7i8bjaznXEe0j7JfKQ7sfJE
```

### 3. GitHub Repository
- [x] Repository: `https://github.com/switch2itjobs-codes/demo-feedback.git`
- [x] All changes pushed to GitHub

## 🚀 Deployment Steps

### Option A: Using MCP (After Restart)
Once MCP is working, I can:
1. Configure environment variables automatically
2. Deploy to Vercel
3. Verify deployment

### Option B: Manual Deployment

#### Step 1: Link Project to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository: `switch2itjobs-codes/demo-feedback`
3. Vercel will auto-detect Next.js

#### Step 2: Add Environment Variables
1. In Vercel project settings, go to **Settings** → **Environment Variables**
2. Add these variables:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://bwuydoljkgiawackigzj.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dXlkb2xqa2dpYXdhY2tpZ3pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcxOTQzNiwiZXhwIjoyMDc3Mjk1NDM2fQ.WVNTM9uR7KJy_w6-opLN7i8bjaznXEe0j7JfKQ7sfJE` |

3. Make sure to select **Production**, **Preview**, and **Development** environments
4. Click **Save**

#### Step 3: Deploy
1. Click **Deploy** button
2. Wait for build to complete
3. Your app will be live at: `https://your-project.vercel.app`

## ✅ Post-Deployment Verification

After deployment, verify:
1. [ ] Homepage loads correctly
2. [ ] Testimonials display from Supabase
3. [ ] Form submissions work (submit a test review)
4. [ ] New review appears in Supabase database
5. [ ] Latest reviews appear first (sorted by date)

## 🔧 Troubleshooting

### Build Fails
- Check that all environment variables are set
- Verify Node.js version (should be 18+)
- Check build logs in Vercel dashboard

### Environment Variables Not Working
- Ensure variables are set for the correct environment (Production/Preview/Development)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### MCP Not Working
- Ensure Cursor is completely restarted
- Check that Node.js and npx are available: `npx --version`
- Verify MCP config file is in `.cursor/mcp.json`


