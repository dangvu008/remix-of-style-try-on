
-- Add missing columns to user_clothing
ALTER TABLE public.user_clothing ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false;
ALTER TABLE public.user_clothing ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

-- Create favorite_outfits table
CREATE TABLE IF NOT EXISTS public.favorite_outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  outfit_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, outfit_id)
);

ALTER TABLE public.favorite_outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorite outfits" ON public.favorite_outfits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorite outfits" ON public.favorite_outfits
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorite outfits" ON public.favorite_outfits
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
