alter table public.ai_generations
  add column if not exists input_tokens integer check (input_tokens >= 0),
  add column if not exists output_tokens integer check (output_tokens >= 0),
  add column if not exists total_tokens integer check (total_tokens >= 0);

alter table public.ai_generations
  drop constraint if exists ai_generations_prompt_type_check;

alter table public.ai_generations
  add constraint ai_generations_prompt_type_check check (
    prompt_type in (
      'course_structure',
      'course_analysis',
      'course_improvement',
      'course_import',
      'lesson_generate',
      'lesson_improve',
      'lesson_expand',
      'lesson_examples',
      'lesson_exercise',
      'lesson_analyze',
      'lesson_outline',
      'lesson_plan',
      'lesson_intro',
      'lesson_summary',
      'lesson_simplify'
    )
  );