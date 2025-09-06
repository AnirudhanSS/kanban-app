-- SQL Queries for Manual User Verification Management
-- Use these queries to manually verify users and check authentication status

-- 1. Check current user verification status
SELECT 
    id,
    email,
    first_name,
    last_name,
    is_email_verified,
    "createdAt",
    "updatedAt",
    is_active,
    is_deleted
FROM users 
WHERE is_deleted = false
ORDER BY "createdAt" DESC;

-- 2. Count users by verification status
SELECT 
    CASE 
        WHEN is_email_verified = true THEN 'Verified'
        WHEN is_email_verified = false THEN 'Not Verified'
        ELSE 'Unknown'
    END as verification_status,
    COUNT(*) as user_count
FROM users 
WHERE is_deleted = false
GROUP BY is_email_verified;

-- 3. Manually verify a specific user by email
UPDATE users 
SET 
    is_email_verified = true,
    "updatedAt" = NOW()
WHERE email = 'user@example.com' 
  AND is_deleted = false;

-- 4. Manually verify a specific user by ID
UPDATE users 
SET 
    is_email_verified = true,
    "updatedAt" = NOW()
WHERE id = 'user-uuid-here' 
  AND is_deleted = false;

-- 5. Verify all users at once (BULK VERIFICATION) - RECOMMENDED FOR YOUR 16 USERS
UPDATE users 
SET 
    is_email_verified = true,
    "updatedAt" = NOW()
WHERE is_deleted = false 
  AND is_email_verified = false;

-- 6. Unverify a specific user (for testing)
UPDATE users 
SET 
    is_email_verified = false,
    email_confirmed_at = NULL,
    confirmation_token = 'test-token-' || EXTRACT(EPOCH FROM NOW())::text,
    updated_at = NOW()
WHERE email = 'user@example.com' 
  AND is_deleted = false;

-- 7. Check users who need verification
SELECT 
    id,
    email,
    first_name,
    last_name,
    created_at,
    confirmation_sent_at,
    EXTRACT(EPOCH FROM (NOW() - confirmation_sent_at))/3600 as hours_since_confirmation_sent
FROM users 
WHERE is_deleted = false 
  AND is_email_verified = false
ORDER BY created_at DESC;

-- 8. Generate verification tokens for unverified users
UPDATE users 
SET 
    confirmation_token = 'manual-verify-' || EXTRACT(EPOCH FROM NOW())::text || '-' || SUBSTRING(id::text, 1, 8),
    confirmation_sent_at = NOW(),
    updated_at = NOW()
WHERE is_deleted = false 
  AND is_email_verified = false
  AND confirmation_token IS NULL;

-- 9. Check recent user activity
SELECT 
    id,
    email,
    first_name,
    last_name,
    is_email_verified,
    last_sign_in_at,
    created_at,
    updated_at
FROM users 
WHERE is_deleted = false
ORDER BY updated_at DESC
LIMIT 20;

-- 10. Verify users created in the last 24 hours
UPDATE users 
SET 
    is_email_verified = true,
    email_confirmed_at = NOW(),
    confirmation_token = NULL,
    updated_at = NOW()
WHERE is_deleted = false 
  AND is_email_verified = false
  AND created_at > NOW() - INTERVAL '24 hours';

-- 11. Check for duplicate emails (should be none)
SELECT email, COUNT(*) as count
FROM users 
WHERE is_deleted = false
GROUP BY email 
HAVING COUNT(*) > 1;

-- 12. Get user statistics
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_email_verified = true THEN 1 END) as verified_users,
    COUNT(CASE WHEN is_email_verified = false THEN 1 END) as unverified_users,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
    COUNT(CASE WHEN last_sign_in_at IS NOT NULL THEN 1 END) as users_with_logins
FROM users 
WHERE is_deleted = false;

-- 13. Manual verification with custom timestamp
UPDATE users 
SET 
    is_email_verified = true,
    email_confirmed_at = '2025-09-08 16:00:00'::timestamp,
    confirmation_token = NULL,
    updated_at = NOW()
WHERE email = 'specific@user.com' 
  AND is_deleted = false;

-- 14. Reset verification for testing (makes user unverified again)
UPDATE users 
SET 
    is_email_verified = false,
    email_confirmed_at = NULL,
    confirmation_token = 'reset-token-' || EXTRACT(EPOCH FROM NOW())::text,
    confirmation_sent_at = NOW(),
    updated_at = NOW()
WHERE email = 'test@user.com' 
  AND is_deleted = false;
