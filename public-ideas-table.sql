-- Create public_ideas table
CREATE TABLE public_ideas (
  id SERIAL PRIMARY KEY,
  idea_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id),
  likes INTEGER DEFAULT 0
);

-- Enable RLS but allow public read access
ALTER TABLE public_ideas ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read public ideas
CREATE POLICY "Public ideas are viewable by everyone" 
  ON public_ideas FOR SELECT 
  USING (true);

-- Allow authenticated users to insert public ideas
CREATE POLICY "Authenticated users can insert public ideas" 
  ON public_ideas FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update only their own ideas
CREATE POLICY "Users can update their own public ideas" 
  ON public_ideas FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow users to delete only their own ideas
CREATE POLICY "Users can delete their own public ideas" 
  ON public_ideas FOR DELETE 
  USING (auth.uid() = user_id);
