-- Add background_images JSONB column to hero_sections for multi-image slider configuration
alter table public.hero_sections add column if not exists background_images jsonb;
