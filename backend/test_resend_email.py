"""
测试 Resend 邮件发送功能
"""
import asyncio
import os
from app.services.email_auth_service import EmailAuthService
from app.config import get_settings

# 设置为生产模式以测试真实邮件发送
os.environ["ENVIRONMENT"] = "production"

async def test_send_email():
    """测试发送验证码到真实邮箱"""
    settings = get_settings()
    service = EmailAuthService(settings)
    
    print("=" * 60)
    print("测试 Resend 邮件发送")
    print("=" * 60)
    
    test_email = "824688700@qq.com"
    
    print(f"\n发送验证码到: {test_email}")
    print("请稍候...")
    
    try:
        success, message = await service.send_verification_code(test_email)
        
        if success:
            print(f"\n✓ 成功！")
            print(f"消息: {message}")
            print(f"\n请检查邮箱: {test_email}")
            print("提示: 如果收件箱没有，请检查垃圾邮件/垃圾箱")
        else:
            print(f"\n✗ 失败")
            print(f"错误: {message}")
            
    except Exception as e:
        print(f"\n✗ 发生错误")
        print(f"错误详情: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    asyncio.run(test_send_email())
