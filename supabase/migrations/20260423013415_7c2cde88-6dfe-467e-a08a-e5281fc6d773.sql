
-- 1) Remove invite_token from default SELECT for non-admin members
REVOKE SELECT (invite_token) ON public.companies FROM authenticated, anon;

-- Provide a secure way for company admins / platform master to fetch the invite token
CREATE OR REPLACE FUNCTION public.get_company_invite_token(_company_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.invite_token
  FROM public.companies c
  WHERE c.id = _company_id
    AND (
      public.is_company_admin(auth.uid(), _company_id)
      OR public.is_platform_master(auth.uid())
      OR c.created_by = auth.uid()
    )
$$;

GRANT EXECUTE ON FUNCTION public.get_company_invite_token(uuid) TO authenticated;

-- 2) Tighten company-logos storage bucket so files are scoped by {company_id}/...
DROP POLICY IF EXISTS "Authenticated can upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read company logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read company logos" ON storage.objects;

-- Anyone may read (bucket is public for logo display)
CREATE POLICY "Public can read company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

-- Only company admins may write to their own company's folder
CREATE POLICY "Company admin can upload own company logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-logos'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND (
    public.is_company_admin(auth.uid(), ((storage.foldername(name))[1])::uuid)
    OR public.is_platform_master(auth.uid())
  )
);

CREATE POLICY "Company admin can update own company logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND (
    public.is_company_admin(auth.uid(), ((storage.foldername(name))[1])::uuid)
    OR public.is_platform_master(auth.uid())
  )
);

CREATE POLICY "Company admin can delete own company logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND (
    public.is_company_admin(auth.uid(), ((storage.foldername(name))[1])::uuid)
    OR public.is_platform_master(auth.uid())
  )
);

-- 3) Add Realtime channel authorization so users only receive events
-- for messages/notifications addressed to them.
-- realtime.messages governs Realtime subscriptions/broadcasts.
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can subscribe to own user channel" ON realtime.messages;

-- Convention: use channel topics like "user:{auth.uid()}" for per-user streams
-- and only allow auth'd users to read messages on a topic that matches their own user id.
CREATE POLICY "Authenticated can subscribe to own user channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Allow the standard postgres_changes stream (topic 'realtime:*' is managed by Supabase)
  -- but disallow arbitrary user-to-user broadcast eavesdropping.
  topic = ('user:' || auth.uid()::text)
);
