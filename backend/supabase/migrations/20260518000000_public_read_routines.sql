-- 다른 사용자의 루틴 조회 허용 (루틴 가져오기 기능)
create policy "authenticated users can read all templates"
  on public.routine_templates
  for select
  using (auth.role() = 'authenticated');

create policy "authenticated users can read all template items"
  on public.routine_template_items
  for select
  using (auth.role() = 'authenticated');
