-- Person Images Table for Quick Reuse
CREATE TABLE IF NOT EXISTS person_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_person_images_user_id ON person_images(user_id);
CREATE INDEX IF NOT EXISTS idx_person_images_last_used ON person_images(user_id, last_used_at DESC);

-- RLS Policies
ALTER TABLE person_images ENABLE ROW LEVEL SECURITY;

-- Users can view their own images
CREATE POLICY "Users can view own person images"
  ON person_images FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own images  
CREATE POLICY "Users can insert own person images"
  ON person_images FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own images
CREATE POLICY "Users can delete own person images"
  ON person_images FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own images (for last_used_at)
CREATE POLICY "Users can update own person images"
  ON person_images FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
