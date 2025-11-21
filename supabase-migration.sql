-- Migration: Create testimonials table for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  review_type TEXT NOT NULL,
  review TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  image TEXT,
  published BOOLEAN DEFAULT true NOT NULL,
  source TEXT DEFAULT 'web' NOT NULL
);

-- Create index on review_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_testimonials_review_type ON testimonials(review_type);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at DESC);

-- Create index on published for faster filtering
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials(published);

-- Enable Row Level Security (RLS)
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read published testimonials
CREATE POLICY "Allow public read access to published testimonials"
  ON testimonials
  FOR SELECT
  USING (published = true);

-- Policy: Allow anonymous inserts (for form submissions)
-- Note: You may want to restrict this to your Next.js API routes only
-- For now, we're allowing anonymous inserts for simplicity
-- If you want to be more secure, remove this policy and only allow inserts via API routes with service role key
CREATE POLICY "Allow anonymous inserts"
  ON testimonials
  FOR INSERT
  WITH CHECK (true);

-- Optional: If you want to migrate existing data from Google Sheets
-- You would run an INSERT statement here after exporting your Google Sheets data
-- Example format:
-- INSERT INTO testimonials (date, review_type, review, rating, name, mobile, published)
-- VALUES ('2024-01-15', 'Demo Feedback Review', 'Review text here', 5, 'John Doe', '1234567890', true);

