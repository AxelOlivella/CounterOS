-- Disable email confirmation for development
-- This allows users to sign in immediately without email verification

UPDATE auth.users 
SET email_confirmed_at = now(), 
    confirmation_sent_at = now()
WHERE email = 'demo@moyo.com' AND email_confirmed_at IS NULL;