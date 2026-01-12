-- CRITICAL FIX: invitation_tokens security vulnerability
-- The current policy allows anyone to browse all valid tokens, which is a major security risk

-- Drop the insecure policy
DROP POLICY IF EXISTS "Anyone can view valid tokens for registration" ON public.invitation_tokens;

-- Create a secure policy: only allow viewing a token if you know the email associated with it
-- This prevents token enumeration while still allowing registration flow
CREATE POLICY "Users can view their own invitation token" 
ON public.invitation_tokens 
FOR SELECT 
USING (
  -- Allow master admins to see all tokens
  has_role(auth.uid(), 'master_admin'::app_role)
  OR
  -- Allow anonymous access ONLY when token is provided as RPC parameter (not direct table access)
  -- For registration, we'll use an RPC function instead
  false
);

-- Create a secure RPC function for token validation during registration
CREATE OR REPLACE FUNCTION public.validate_invitation_token(p_token TEXT)
RETURNS TABLE (
  email TEXT,
  role app_role,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    it.email::TEXT,
    it.role,
    (it.used = false AND it.expires_at > now())::BOOLEAN as is_valid
  FROM public.invitation_tokens it
  WHERE it.token = p_token
  LIMIT 1;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.validate_invitation_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_invitation_token(TEXT) TO authenticated;

-- Create function to mark token as used (called after successful registration)
CREATE OR REPLACE FUNCTION public.use_invitation_token(p_token TEXT, p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token_id UUID;
BEGIN
  -- Find and validate the token
  SELECT id INTO v_token_id
  FROM public.invitation_tokens
  WHERE token = p_token 
    AND email = p_email
    AND used = false 
    AND expires_at > now();
  
  IF v_token_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Mark as used
  UPDATE public.invitation_tokens
  SET used = true
  WHERE id = v_token_id;
  
  RETURN true;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.use_invitation_token(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.use_invitation_token(TEXT, TEXT) TO authenticated;