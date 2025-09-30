-- Create blogs table for storing blog posts
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blogs table
-- Allow users to view all published blogs
CREATE POLICY "Anyone can view published blogs"
  ON public.blogs FOR SELECT
  USING (status = 'published');

-- Allow users to view their own drafts
CREATE POLICY "Users can view their own blogs"
  ON public.blogs FOR SELECT
  USING (auth.uid() = author_id);

-- Allow users to insert their own blogs
CREATE POLICY "Users can insert their own blogs"
  ON public.blogs FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Allow users to update their own blogs
CREATE POLICY "Users can update their own blogs"
  ON public.blogs FOR UPDATE
  USING (auth.uid() = author_id);

-- Allow users to delete their own blogs
CREATE POLICY "Users can delete their own blogs"
  ON public.blogs FOR DELETE
  USING (auth.uid() = author_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS blogs_author_id_idx ON public.blogs(author_id);
CREATE INDEX IF NOT EXISTS blogs_category_idx ON public.blogs(category);
CREATE INDEX IF NOT EXISTS blogs_status_idx ON public.blogs(status);
CREATE INDEX IF NOT EXISTS blogs_slug_idx ON public.blogs(slug);
