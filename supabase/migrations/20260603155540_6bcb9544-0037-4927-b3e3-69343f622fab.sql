
-- 1. Remove public SELECT policies (public profile feature was removed)
DROP POLICY IF EXISTS "Public profiles are viewable by anyone" ON public.profiles;
DROP POLICY IF EXISTS "Public workouts viewable when profile public" ON public.workout_logs;
DROP POLICY IF EXISTS "Public checkins viewable when profile public" ON public.gym_checkins;

-- 2. Remove privilege-escalation INSERT policy on gita_access
DROP POLICY IF EXISTS "Gita members can grant access" ON public.gita_access;

-- 3. Add explicit UPDATE policy on rest_days
DROP POLICY IF EXISTS "Users update own rest days" ON public.rest_days;
CREATE POLICY "Users update own rest days"
  ON public.rest_days FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Lock down SECURITY DEFINER functions from anon (and trigger-only funcs from authenticated)
REVOKE EXECUTE ON FUNCTION public.generate_invite_code() FROM anon;
REVOKE EXECUTE ON FUNCTION public.lookup_buddy_invite(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_gita_access(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_challenge_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_buddy_weekly_stats(uuid, date) FROM anon;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_invite_immutable_fields() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_buddy_insert() FROM anon, authenticated;
