# Add Environment Variables to Vercel

## 🎯 Quick Steps

Your Vercel project is deployed but needs Supabase environment variables to work properly.

### Step 1: Go to Vercel Project Settings
1. Open: https://vercel.com/sits-projects-b1a77a2d/demo-feedback/settings/environment-variables
2. Or navigate: **Project** → **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Click **"Add New"** and add these two variables:

#### Variable 1:
- **Key**: `SUPABASE_URL`
- **Value**: `https://bwuydoljkgiawackigzj.supabase.co`
- **Environment**: Select all three:
  - ✅ Production
  - ✅ Preview  
  - ✅ Development
- Click **Save**

#### Variable 2:
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dXlkb2xqa2dpYXdhY2tpZ3pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcxOTQzNiwiZXhwIjoyMDc3Mjk1NDM2fQ.WVNTM9uR7KJy_w6-opLN7i8bjaznXEe0j7JfKQ7sfJE`
- **Environment**: Select all three:
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- **Type**: Select **"Encrypted"** (for security)
- Click **Save**

### Step 3: Redeploy

After adding the variables, you need to redeploy:

1. Go to: https://vercel.com/sits-projects-b1a77a2d/demo-feedback/deployments
2. Find the latest deployment
3. Click the **"..."** menu (three dots)
4. Click **"Redeploy"**
5. Wait for the deployment to complete

## ✅ Verify It's Working

After redeployment, test your app:
1. Visit: https://demo-feedback-ebon.vercel.app
2. Check that testimonials load from Supabase
3. Submit a test review
4. Verify it appears in your Supabase database

## 🔗 Quick Links

- **Project Dashboard**: https://vercel.com/sits-projects-b1a77a2d/demo-feedback
- **Environment Variables**: https://vercel.com/sits-projects-b1a77a2d/demo-feedback/settings/environment-variables
- **Deployments**: https://vercel.com/sits-projects-b1a77a2d/demo-feedback/deployments
- **Live App**: https://demo-feedback-ebon.vercel.app

## 📝 Notes

- Environment variables are case-sensitive
- Make sure to select all three environments (Production, Preview, Development)
- After adding variables, you must redeploy for them to take effect
- The service role key is sensitive - keep it encrypted in Vercel

