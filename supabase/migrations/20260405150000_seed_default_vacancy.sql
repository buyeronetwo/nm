-- Стартовая вакансия (как в data/vacancies.seed.json). Повторный apply безопасен.
insert into public.vacancies (id, created_at, title, requirements)
values (
  'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  '2026-01-01T12:00:00.000Z'::timestamptz,
  '{
    "en": "Affiliate Manager",
    "ru": "Affiliate Manager",
    "uk": "Affiliate Manager"
  }'::jsonb,
  '{
    "en": "At least 1 year in affiliate, media buying, or other relevant roles.",
    "ru": "Опыт работы от 1 года в affiliate, медиабаинге или на разных позициях.",
    "uk": "Досвід від 1 року в affiliate, медіабаї чи на різних позиціях."
  }'::jsonb
)
on conflict (id) do nothing;
