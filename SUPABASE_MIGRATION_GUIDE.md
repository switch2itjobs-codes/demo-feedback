# Supabase Migration Guide

This guide will help you complete the migration from Google Sheets to Supabase for the feedback system.

## Prerequisites

1. A Supabase account (create one at https://supabase.com if you don't have one)
2. A new or existing Supabase project

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - Name: e.g., "SIT Feedback System"
   - Database Password: Choose a strong password (save this!)
   - Region: Choose closest to your users
4. Wait for the project to be provisioned (usually 1-2 minutes)

## Step 2: Run Database Migration

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `supabase-migration.sql`
4. Paste it into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success" message

This creates:
- `testimonials` table with all necessary columns
- Indexes for performance
- Row Level Security (RLS) policies

## Step 3: Get Your Supabase Credentials

1. Go to **Settings** → **API** (in your Supabase project)
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **service_role key** (under "Project API keys" → "service_role" - **this is secret!**)

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following variables:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important Security Notes:**
- Never commit `.env.local` to git (it should be in `.gitignore`)
- The `service_role` key has admin privileges - keep it secret!
- Only use this key in server-side code (API routes)

## Step 5: Test the Migration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test form submission:
   - Visit any feedback form page (e.g., `/demo-feedback`)
   - Submit a test review
   - Check your Supabase **Table Editor** → `testimonials` table
   - You should see your test submission

3. Test testimonials display:
   - Visit the homepage (`/`)
   - You should see testimonials displayed (including your test submission)

## Step 6: (Optional) Migrate Existing Data

If you have existing data in Google Sheets that you want to migrate:

1. Export your Google Sheets data as CSV
2. In Supabase, go to **Table Editor** → `testimonials`
3. You can either:
   - **Manual Import**: Use the Supabase UI to import CSV
   - **SQL Import**: Use an INSERT statement (see example in `supabase-migration.sql`)

## Verification Checklist

- [ ] Database migration SQL executed successfully
- [ ] Environment variables set in `.env.local`
- [ ] Form submissions working (check Supabase table)
- [ ] Testimonials displaying on homepage
- [ ] All feedback form types working:
  - [ ] Demo Feedback
  - [ ] Course Experience
  - [ ] Enrollment Experience
  - [ ] Placement Review
  - [ ] Support Review
  - [ ] Classes Review

## Troubleshooting

### "Missing Supabase environment variables" error
- Ensure `.env.local` exists in project root
- Restart your dev server after adding env variables
- Check that variable names match exactly

### Form submission fails
- Check Supabase RLS policies are correctly set up
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check browser console and server logs for errors

### Testimonials not showing
- Verify data exists in Supabase `testimonials` table
- Check that `published = true` for testimonials you want to display
- Clear browser cache
- Check API route logs: `/api/live-testimonials`

### Database connection issues
- Verify `SUPABASE_URL` is correct (should end with `.supabase.co`)
- Check your internet connection
- Verify Supabase project is active (not paused)

## What Changed

### Files Modified:
- ✅ `lib/supabase.ts` - New Supabase client configuration
- ✅ `app/api/google-sheets-direct/route.ts` - Now writes to Supabase
- ✅ `app/api/live-testimonials/route.ts` - Now reads from Supabase
- ✅ `app/api/submit-review/route.ts` - Updated to use Supabase
- ✅ `app/api/submit-to-sheets/route.ts` - Updated to use Supabase

### Files Created:
- ✅ `supabase-migration.sql` - Database schema
- ✅ `SUPABASE_MIGRATION_GUIDE.md` - This guide

### Dependencies:
- ✅ Added `@supabase/supabase-js` to `package.json`

### Google Sheets:
- ❌ All Google Sheets integration has been removed
- The `config/google-sheets.ts` file is no longer used
- You can safely remove it if you want

## Next Steps

1. **Remove Google Sheets dependencies** (optional):
   - You can remove the `googleapis` package if you're not using it elsewhere:
     ```bash
     npm uninstall googleapis
     ```

2. **Set up production environment variables**:
   - Add the same env variables to your hosting platform (Vercel, etc.)
   - Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code

3. **Monitor your Supabase project**:
   - Check the Supabase dashboard for usage and performance
   - Set up alerts if needed

4. **Backup strategy**:
   - Supabase automatically backs up your database
   - Consider exporting data periodically for additional safety

## Support

If you encounter any issues, check:
1. Supabase documentation: https://supabase.com/docs
2. Next.js environment variables: https://nextjs.org/docs/basic-features/environment-variables
3. Server logs and browser console for error messages

