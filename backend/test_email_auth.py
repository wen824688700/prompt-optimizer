"""
测试邮箱认证功能
"""
import asyncio
import os
from app.services.email_auth_service import EmailAuthService
from app.config import get_settings

# 设置开发模式
os.environ["ENVIRONMENT"] = "development"

async def test_email_auth():
    """测试邮箱认证服务"""
    settings = get_settings()
    service = EmailAuthService(settings)
    
    print("=" * 60)
    print("测试邮箱验证码认证服务（开发模式）")
    print("=" * 60)
    
    # 测试1: 发送验证码
    print("\n1. 测试发送验证码")
    success, message = await service.send_verification_code(
        email="test@example.com"
    )
    print(f"   结果: {'✓ 成功' if success else '✗ 失败'}")
    print(f"   消息: {message}")
    
    # 测试2: 验证验证码并注册
    print("\n2. 测试验证验证码并注册")
    success, user_data, message = await service.verify_code_and_register(
        email="test@example.com",
        code="123456",
        username="testuser",
        password="123456"
    )
    print(f"   结果: {'✓ 成功' if success else '✗ 失败'}")
    print(f"   消息: {message}")
    if user_data:
        print(f"   用户: {user_data}")
    
    # 测试3: 邮箱登录
    print("\n3. 测试邮箱登录")
    success, user_data, message = await service.login_with_email(
        email="test@example.com",
        password="123456"
    )
    print(f"   结果: {'✓ 成功' if success else '✗ 失败'}")
    print(f"   消息: {message}")
    if user_data:
        print(f"   用户: {user_data}")
    
    # 测试4: 用户名登录
    print("\n4. 测试用户名登录")
    success, user_data, message = await service.login_with_username(
        username="testuser",
        password="123456"
    )
    print(f"   结果: {'✓ 成功' if success else '✗ 失败'}")
    print(f"   消息: {message}")
    if user_data:
        print(f"   用户: {user_data}")
    
    # 测试5: 错误密码
    print("\n5. 测试错误密码")
    success, user_data, message = await service.login_with_email(
        email="test@example.com",
        password="wrong_password"
    )
    print(f"   结果: {'✓ 成功' if success else '✗ 失败'}")
    print(f"   消息: {message}")
    
    # 测试6: 错误验证码
    print("\n6. 测试错误验证码")
    success, user_data, message = await service.verify_code_and_register(
        email="test2@example.com",
        code="000000",
        username="testuser2",
        password="123456"
    )
    print(f"   结果: {'✓ 成功' if success else '✗ 失败'}")
    print(f"   消息: {message}")
    
    # 测试7: 重置密码（发送验证码）
    print("\n7. 测试重置密码（发送验证码）")
    success, message = await service.send_verification_code(
        email="test@example.com"
    )
    print(f"   结果: {'✓ 成功' if success else '✗ 失败'}")
    print(f"   消息: {message}")
    
    # 测试8: 重置密码（验证码验证）
    print("\n8. 测试重置密码（验证码验证）")
    success, message = await service.reset_password_with_code(
        email="test@example.com",
        code="123456",
        new_password="newpass123"
    )
    print(f"   结果: {'✓ 成功' if success else '✗ 失败'}")
    print(f"   消息: {message}")
    
    # 测试9: 检查用户名可用性
    print("\n9. 测试检查用户名可用性")
    is_available = await service.check_username_available("newuser")
    print(f"   用户名 'newuser': {'可用' if is_available else '已被使用'}")
    
    print("\n" + "=" * 60)
    print("测试完成！")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_email_auth())
