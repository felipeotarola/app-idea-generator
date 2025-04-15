-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create app_ideas table with user_id foreign key
CREATE TABLE app_ideas (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  idea_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create RLS policies for app_ideas
ALTER TABLE app_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ideas" 
  ON app_ideas FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ideas" 
  ON app_ideas FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" 
  ON app_ideas FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas" 
  ON app_ideas FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
