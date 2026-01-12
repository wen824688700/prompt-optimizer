-- 创建邮箱验证码表
-- 用于存储邮箱验证码，支持注册和重置密码功能

CREATE TABLE IF NOT EXISTS email_verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_email_codes_email ON email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_email_codes_expires ON email_verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_codes_used ON email_verification_codes(used);

-- 添加注释
COMMENT ON TABLE email_verification_codes IS '邮箱验证码表，用于注册和重置密码';
COMMENT ON COLUMN email_verification_codes.email IS '接收验证码的邮箱地址';
COMMENT ON COLUMN email_verification_codes.code IS '6位数字验证码';
COMMENT ON COLUMN email_verification_codes.created_at IS '创建时间';
COMMENT ON COLUMN email_verification_codes.expires_at IS '过期时间（创建时间 + 10分钟）';
COMMENT ON COLUMN email_verification_codes.used IS '是否已使用（防止重复使用）';
COMMENT ON COLUMN email_verification_codes.ip_address IS '请求IP地址（用于频率限制）';

-- 创建清理过期验证码的函数
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verification_codes
    WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- 创建定时清理任务（可选，需要 pg_cron 扩展）
-- SELECT cron.schedule('cleanup-expired-codes', '0 * * * *', 'SELECT cleanup_expired_codes()');
