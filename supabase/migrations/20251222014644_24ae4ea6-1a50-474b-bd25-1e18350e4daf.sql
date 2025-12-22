-- Create table for user's saved clothing items
CREATE TABLE public.user_clothing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'top',
  image_url TEXT NOT NULL,
  color TEXT,
  gender TEXT,
  style TEXT,
  pattern TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_clothing ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own clothing" 
ON public.user_clothing 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clothing" 
ON public.user_clothing 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clothing" 
ON public.user_clothing 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clothing" 
ON public.user_clothing 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_clothing_user_id ON public.user_clothing(user_id);
CREATE INDEX idx_user_clothing_category ON public.user_clothing(category);