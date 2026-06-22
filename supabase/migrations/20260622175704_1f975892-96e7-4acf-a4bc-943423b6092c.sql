
-- Revoke broad PUBLIC execute on SECURITY DEFINER functions, then grant only to required roles.

-- Trigger-only functions: no direct execute needed
REVOKE ALL ON FUNCTION public.prevent_seniority_self_escalation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_last_login() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Helper functions used by RLS policies / app code: authenticated only
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_platform_master(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_platform_master(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_company_admin(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_company_admin(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_direct_manager(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_direct_manager(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.can_access_services(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_services(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.can_edit_service(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_edit_service(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_user_company(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_company(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_company_invite_token(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_company_invite_token(uuid) TO authenticated;

-- Invite/signup functions: anon also needs to call them before login
REVOKE ALL ON FUNCTION public.validate_invitation_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_invitation_token(text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.use_invitation_token(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.use_invitation_token(text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_company_by_invite(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_company_by_invite(text, text) TO anon, authenticated;
