-- ============================================
-- 启用 RLS 并配置策略
-- 用于邮箱认证功能的安全配置
-- ============================================

-- ============================================
-- 1. 启用 RLS
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. user_profiles 表的策略
-- ============================================

-- 删除已存在的策略（如果有）
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can access all profiles" ON user_profiles;

-- 用户可以查看自己的资料
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = id);

-- 用户可以插入自己的资料（注册时）
CREATE POLICY "Users can insert own profile"
ON user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- 用户可以更新自己的资料
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 允许服务角色（后端）访问所有数据
CREATE POLICY "Service role can access all profiles"
ON user_profiles
FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- 3. email_verification_codes 表的策略
-- ============================================

-- 删除已存在的策略（如果有）
DROP POLICY IF EXISTS "Service role can access verification codes" ON email_verification_codes;
DROP POLICY IF EXISTS "Anyone can insert verification codes" ON email_verification_codes;

-- 只允许服务角色（后端）完全访问验证码表
CREATE POLICY "Service role can access verification codes"
ON email_verification_codes
FOR ALL
USING (auth.role() = 'service_role');

-- 允许匿名用户插入验证码（发送验证码时）
-- 注意：实际插入操作应该通过后端 API 完成，这里只是备用
CREATE POLICY "Anyone can insert verification codes"
ON email_verification_codes
FOR INSERT
WITH CHECK (true);

-- ============================================
-- 4. 验证配置
-- ============================================

-- 查看 RLS 状态
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('user_profiles', 'email_verification_codes');

-- 查看策略
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('user_profiles', 'email_verification_codes')
ORDER BY tablename, policyname;

