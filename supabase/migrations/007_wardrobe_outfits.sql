-- ============================================
-- Wardrobe & Outfits Feature
-- ============================================

-- 1. WARDROBE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories')),
  image_url TEXT NOT NULL,
  is_example BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wardrobe_items: select own or examples" ON public.wardrobe_items
  FOR SELECT USING (auth.uid() = user_id OR is_example = true);

CREATE POLICY "wardrobe_items: insert own" ON public.wardrobe_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wardrobe_items: delete own" ON public.wardrobe_items
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS wardrobe_items_user_id_idx 
  ON public.wardrobe_items(user_id, created_at DESC);


-- 2. OUTFITS TABLE
CREATE TABLE IF NOT EXISTS public.outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  occasion TEXT NOT NULL CHECK (occasion IN ('training', 'outdoor', 'night_out', 'date', 'casual', 'work', 'beach')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "outfits: select own" ON public.outfits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "outfits: insert own" ON public.outfits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "outfits: delete own" ON public.outfits
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS outfits_user_id_idx 
  ON public.outfits(user_id, created_at DESC);


-- 3. OUTFIT ITEMS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.outfit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  wardrobe_item_id UUID NOT NULL REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  UNIQUE(outfit_id, wardrobe_item_id)
);

ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;

-- Users can see outfit items for their own outfits
CREATE POLICY "outfit_items: select via outfit" ON public.outfit_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.outfits 
      WHERE outfits.id = outfit_items.outfit_id 
      AND outfits.user_id = auth.uid()
    )
  );

CREATE POLICY "outfit_items: insert via outfit" ON public.outfit_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.outfits 
      WHERE outfits.id = outfit_items.outfit_id 
      AND outfits.user_id = auth.uid()
    )
  );

CREATE POLICY "outfit_items: delete via outfit" ON public.outfit_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.outfits 
      WHERE outfits.id = outfit_items.outfit_id 
      AND outfits.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS outfit_items_outfit_id_idx 
  ON public.outfit_items(outfit_id);
