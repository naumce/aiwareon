-- Migration: Expand wardrobe categories with category groups
-- Run this in Supabase SQL Editor

-- Add category_group column to wardrobe_items
ALTER TABLE wardrobe_items
ADD COLUMN IF NOT EXISTS category_group TEXT DEFAULT 'clothing';

-- Add ai_suggested flag
ALTER TABLE wardrobe_items
ADD COLUMN IF NOT EXISTS ai_suggested BOOLEAN DEFAULT false;

-- Add confidence score for AI categorization
ALTER TABLE wardrobe_items
ADD COLUMN IF NOT EXISTS ai_confidence REAL;

-- Update existing items to have category_group based on category
UPDATE wardrobe_items
SET category_group = CASE
    WHEN category IN ('tops', 'bottoms', 'dresses', 'outerwear') THEN 'clothing'
    WHEN category IN ('bags', 'glasses', 'jewelry', 'hats', 'scarves') THEN 'accessories'
    WHEN category IN ('heels', 'flats', 'sneakers', 'boots') THEN 'footwear'
    ELSE 'clothing'
END
WHERE category_group IS NULL OR category_group = 'clothing';

-- Add index for faster filtering by category_group
CREATE INDEX IF NOT EXISTS idx_wardrobe_category_group 
ON wardrobe_items(user_id, category_group);
