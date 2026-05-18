-- workout_goals: SELECT 공개, 나머지는 본인만
DROP POLICY "users can manage own goals" ON public.workout_goals;

CREATE POLICY "workout_goals: 누구나 조회"
ON public.workout_goals FOR SELECT USING (true);

CREATE POLICY "workout_goals: 본인만 수정"
ON public.workout_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_goals: 본인만 업데이트"
ON public.workout_goals FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_goals: 본인만 삭제"
ON public.workout_goals FOR DELETE
USING (auth.uid() = user_id);

-- workout_logs: SELECT 공개, 나머지는 본인만
DROP POLICY "users can manage own logs" ON public.workout_logs;

CREATE POLICY "workout_logs: 누구나 조회"
ON public.workout_logs FOR SELECT USING (true);

CREATE POLICY "workout_logs: 본인만 기록"
ON public.workout_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_logs: 본인만 삭제"
ON public.workout_logs FOR DELETE
USING (auth.uid() = user_id);
