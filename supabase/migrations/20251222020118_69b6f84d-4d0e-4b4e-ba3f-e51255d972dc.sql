-- Add tags column to user_clothing table
ALTER TABLE public.user_clothing 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create index for tags search
CREATE INDEX idx_user_clothing_tags ON public.user_clothing USING GIN(tags);