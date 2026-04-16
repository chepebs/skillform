-- Add FK from service_talent_matches.user_id -> auth.users(id)
-- (Cannot FK to profiles.user_id since it isn't unique by default; auth.users.id is the canonical user ref)
ALTER TABLE public.service_talent_matches
  ADD CONSTRAINT service_talent_matches_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;