
-- Restrict group_challenges SELECT to owner + members
DROP POLICY IF EXISTS "Authenticated can read challenges" ON public.group_challenges;

CREATE POLICY "Owner or members can read challenges"
  ON public.group_challenges FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner_id
    OR public.is_challenge_member(id, auth.uid())
  );

-- Helper to look up a challenge by invite code (does not expose other challenges)
CREATE OR REPLACE FUNCTION public.lookup_challenge_by_code(p_invite_code text)
RETURNS TABLE(id uuid, name text, description text, owner_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, description, owner_id
  FROM public.group_challenges
  WHERE invite_code = p_invite_code
  LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION public.lookup_challenge_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_challenge_by_code(text) TO authenticated;
