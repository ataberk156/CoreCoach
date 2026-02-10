-- =============================================
-- AI Coach - Supabase Database Migration
-- =============================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın.
-- =============================================

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  age INTEGER,
  gender TEXT,
  height REAL,
  weight REAL,
  goal TEXT,
  activity_level INTEGER DEFAULT 3,
  experience TEXT DEFAULT 'orta',
  equipment TEXT DEFAULT 'gym',
  health_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKOUT PLANS
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_message TEXT,
  schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NUTRITION PLANS
CREATE TABLE IF NOT EXISTS public.nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_message TEXT,
  targets JSONB NOT NULL DEFAULT '{}'::jsonb,
  meal_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROGRESS ENTRIES
CREATE TABLE IF NOT EXISTS public.progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight REAL,
  chest REAL,
  waist REAL,
  arm REAL,
  neck REAL,
  hips REAL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SCANNED MEALS (food photo analysis)
CREATE TABLE IF NOT EXISTS public.scanned_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  calories INTEGER,
  protein REAL,
  carbs REAL,
  fats REAL,
  items JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanned_meals ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Workout Plans
CREATE POLICY "Users can view own workout plans" ON public.workout_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout plans" ON public.workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout plans" ON public.workout_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout plans" ON public.workout_plans FOR DELETE USING (auth.uid() = user_id);

-- Nutrition Plans
CREATE POLICY "Users can view own nutrition plans" ON public.nutrition_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition plans" ON public.nutrition_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nutrition plans" ON public.nutrition_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nutrition plans" ON public.nutrition_plans FOR DELETE USING (auth.uid() = user_id);

-- Progress Entries
CREATE POLICY "Users can view own progress" ON public.progress_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.progress_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON public.progress_entries FOR DELETE USING (auth.uid() = user_id);

-- Chat Messages
CREATE POLICY "Users can view own chats" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Scanned Meals
CREATE POLICY "Users can view own scanned meals" ON public.scanned_meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scanned meals" ON public.scanned_meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scanned meals" ON public.scanned_meals FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON public.workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_user_id ON public.nutrition_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_user_id ON public.progress_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_scanned_meals_user_id ON public.scanned_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_created ON public.progress_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(user_id, created_at ASC);
