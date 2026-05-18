CREATE TABLE public.workout_log_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id UUID REFERENCES public.workout_logs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  sets INT,
  completed_sets INT,
  weight_kg NUMERIC,
  reps INT,
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE public.workout_log_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_log_items: 누구나 조회"
ON public.workout_log_items FOR SELECT USING (true);

CREATE POLICY "workout_log_items: 본인만 기록"
ON public.workout_log_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_log_items: 본인만 삭제"
ON public.workout_log_items FOR DELETE
USING (auth.uid() = user_id);
