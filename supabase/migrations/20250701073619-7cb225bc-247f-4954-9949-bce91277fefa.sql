
-- Create table for shared plans with proper structure
CREATE TABLE IF NOT EXISTS public.shared_timeline_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'My Timeline Plan',
  activities JSONB NOT NULL,
  calculation_mode TEXT NOT NULL CHECK (calculation_mode IN ('arrival', 'start')),
  target_time TEXT NOT NULL,
  target_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version INTEGER NOT NULL DEFAULT 1,
  last_edited_by TEXT DEFAULT 'Anonymous',
  last_edited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.shared_timeline_plans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read shared plans (since they're meant to be shared via link)
CREATE POLICY "Anyone can view shared plans" 
  ON public.shared_timeline_plans 
  FOR SELECT 
  USING (true);

-- Create policy to allow anyone to insert new shared plans
CREATE POLICY "Anyone can create shared plans" 
  ON public.shared_timeline_plans 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow anyone to update shared plans (for collaboration)
CREATE POLICY "Anyone can update shared plans" 
  ON public.shared_timeline_plans 
  FOR UPDATE 
  USING (true);

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_shared_timeline_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shared_timeline_plans_updated_at
    BEFORE UPDATE ON public.shared_timeline_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_shared_timeline_plans_updated_at();

-- Enable real-time subscriptions for collaborative editing
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_timeline_plans;
