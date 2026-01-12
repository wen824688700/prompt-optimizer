"""
邮箱认证 API
支持邮箱验证码注册和登录
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, EmailStr, validator
import re
from app.services.email_auth_service import EmailAuthService
from app.config import get_settings

router = APIRouter(prefix="/api/v1/auth/email", tags=["email-auth"])
settings = get_settings()

# 全局服务实例
_email_auth_service: EmailAuthService | None = None


def get_email_auth_service() -> EmailAuthService:
    """获取邮箱认证服务实例"""
    global _email_auth_service
    if _email_auth_service is None:
        _email_auth_service = EmailAuthService(settings)
    return _email_auth_service


class SendCodeRequest(BaseModel):
    """发送验证码请求"""
    email: EmailStr = Field(..., description="邮箱地址")


class VerifyCodeRequest(BaseModel):
    """验证验证码并注册请求"""
    email: EmailStr = Field(..., description="邮箱地址")
    code: str = Field(..., min_length=6, max_length=6, description="6位验证码")
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    password: str = Field(..., min_length=6, max_length=100, description="密码")
    
    @validator("code")
    def validate_code(cls, v):
        if not v.isdigit():
            raise ValueError("验证码必须是6位数字")
        return v
    
    @validator("username")
    def validate_username(cls, v):
        # 用户名只能包含字母、数字、下划线
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError("用户名只能包含字母、数字和下划线")
        return v


class LoginRequest(BaseModel):
    """登录请求"""
    identifier: str = Field(..., description="邮箱或用户名")
    password: str = Field(..., min_length=6, max_length=100, description="密码")


class ResetPasswordRequest(BaseModel):
    """重置密码请求"""
    email: EmailStr = Field(..., description="邮箱地址")
    code: str = Field(..., min_length=6, max_length=6, description="6位验证码")
    new_password: str = Field(..., min_length=6, max_length=100, description="新密码")
    
    @validator("code")
    def validate_code(cls, v):
        if not v.isdigit():
            raise ValueError("验证码必须是6位数字")
        return v


class CheckUsernameRequest(BaseModel):
    """检查用户名可用性请求"""
    username: str = Field(..., min_length=3, max_length=50)


@router.post("/send-code")
async def send_verification_code(body: SendCodeRequest):
    """
    发送验证码到邮箱
    
    - 用于注册或重置密码
    - 验证码有效期10分钟
    - 每个邮箱每小时最多发送5次
    """
    service = get_email_auth_service()
    
    success, message = await service.send_verification_code(body.email)
    
    if not success:
        raise HTTPException(
            status_code=429 if "频繁" in message else 400,
            detail={
                "code": "SEND_CODE_FAILED",
                "message": message
            }
        )
    
    return {
        "success": True,
        "message": message
    }


@router.post("/verify-code")
async def verify_code_and_register(body: VerifyCodeRequest):
    """
    验证验证码并注册
    
    - 验证码必须正确且未过期
    - 用户名不能重复
    - 注册成功后自动登录
    """
    service = get_email_auth_service()
    
    success, user_data, message = await service.verify_code_and_register(
        email=body.email,
        code=body.code,
        username=body.username,
        password=body.password
    )
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "VERIFY_FAILED",
                "message": message
            }
        )
    
    return {
        "success": True,
        "message": message,
        "user": {
            "id": user_data["id"],
            "email": user_data["email"],
            "username": user_data["username"],
            "email_confirmed": user_data.get("email_confirmed", False),
            "accountType": "free"  # 测试阶段所有用户都是 free
        }
    }


@router.post("/login")
async def login(body: LoginRequest):
    """
    使用邮箱或用户名登录
    
    - 支持邮箱+密码登录
    - 支持用户名+密码登录
    """
    service = get_email_auth_service()
    
    # 判断是邮箱还是用户名
    is_email = "@" in body.identifier
    
    if is_email:
        success, user_data, message = await service.login_with_email(
            email=body.identifier,
            password=body.password
        )
    else:
        success, user_data, message = await service.login_with_username(
            username=body.identifier,
            password=body.password
        )
    
    if not success:
        raise HTTPException(
            status_code=401,
            detail={
                "code": "INVALID_CREDENTIALS",
                "message": message
            }
        )
    
    return {
        "success": True,
        "message": message,
        "user": {
            "id": user_data["id"],
            "email": user_data.get("email"),
            "username": user_data.get("username"),
            "email_confirmed": user_data.get("email_confirmed", False),
            "accountType": "free"
        }
    }


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    """
    使用验证码重置密码
    
    - 先调用 /send-code 获取验证码
    - 验证码必须正确且未过期
    - 重置成功后需要使用新密码登录
    """
    service = get_email_auth_service()
    
    success, message = await service.reset_password_with_code(
        email=body.email,
        code=body.code,
        new_password=body.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "RESET_FAILED",
                "message": message
            }
        )
    
    return {
        "success": True,
        "message": message
    }


@router.post("/check-username")
async def check_username(body: CheckUsernameRequest):
    """
    检查用户名是否可用
    """
    service = get_email_auth_service()
    
    is_available = await service.check_username_available(body.username)
    
    return {
        "available": is_available,
        "message": "用户名可用" if is_available else "用户名已被使用"
    }
