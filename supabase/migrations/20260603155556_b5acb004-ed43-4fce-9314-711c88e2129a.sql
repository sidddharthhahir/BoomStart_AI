
-- Revoke from PUBLIC (default grant) on all SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.generate_invite_code() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.lookup_buddy_invite(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_gita_access(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_challenge_member(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_buddy_weekly_stats(uuid, date) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.protect_invite_immutable_fields() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_buddy_insert() FROM PUBLIC;

-- Grant execute to authenticated only for app-callable funcs
GRANT EXECUTE ON FUNCTION public.generate_invite_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_buddy_invite(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_gita_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_challenge_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_buddy_weekly_stats(uuid, date) TO authenticated;
