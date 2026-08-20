-- =====================================================
-- AI LEADS TABLE ADDITIONS
-- Add industry, website_url, and message columns
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Add missing columns to ai_leads if they don't exist
ALTER TABLE ai_leads ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE ai_leads ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE ai_leads ADD COLUMN IF NOT EXISTS message TEXT;

-- Add missing columns to project_inquiries if they don't exist
ALTER TABLE project_inquiries ADD COLUMN IF NOT EXISTS how_found TEXT;
ALTER TABLE project_inquiries ADD COLUMN IF NOT EXISTS additional_info TEXT;
