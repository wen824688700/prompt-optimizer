"""
Versions API endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List

from app.services.version_manager import VersionManager, Version, VersionType

router = APIRouter(prefix="/api/v1/versions", tags=["versions"])

# 全局服务实例
version_manager = VersionManager()


class VersionResponse(BaseModel):
    """版本响应"""
    id: str
    user_id: str
    content: str
    type: str
    created_at: str
    formatted_title: str


class SaveVersionRequest(BaseModel):
    """保存版本请求"""
    user_id: str = Field("test_user", description="用户 ID")
    content: str = Field(..., description="提示词内容")
    type: str = Field("save", description="版本类型（save/optimize）")


@router.get("", response_model=List[VersionResponse])
async def get_versions(user_id: str = "test_user", limit: int = 10):
    """
    获取用户的版本列表
    
    返回用户最近的版本列表（最多10个）
    """
    try:
        versions = await version_manager.get_versions(
            user_id=user_id,
            limit=limit
        )
        
        return [
            VersionResponse(
                id=v.id,
                user_id=v.user_id,
                content=v.content,
                type=v.type.value,
                created_at=v.created_at.isoformat(),
                formatted_title=v.formatted_title
            )
            for v in versions
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取版本列表失败: {str(e)}"
        )


@router.post("", response_model=VersionResponse)
async def save_version(request: SaveVersionRequest):
    """
    保存新版本
    
    保存用户的提示词版本
    """
    try:
        version_type = VersionType.SAVE if request.type == "save" else VersionType.OPTIMIZE
        
        version = await version_manager.save_version(
            user_id=request.user_id,
            content=request.content,
            version_type=version_type
        )
        
        return VersionResponse(
            id=version.id,
            user_id=version.user_id,
            content=version.content,
            type=version.type.value,
            created_at=version.created_at.isoformat(),
            formatted_title=version.formatted_title
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"保存版本失败: {str(e)}"
        )


@router.get("/{version_id}", response_model=VersionResponse)
async def get_version(version_id: str):
    """
    获取特定版本
    
    根据版本 ID 获取版本详情
    """
    try:
        version = await version_manager.get_version(version_id)
        
        if version is None:
            raise HTTPException(
                status_code=404,
                detail="版本不存在"
            )
        
        return VersionResponse(
            id=version.id,
            user_id=version.user_id,
            content=version.content,
            type=version.type.value,
            created_at=version.created_at.isoformat(),
            formatted_title=version.formatted_title
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取版本失败: {str(e)}"
        )


@router.post("/{version_id}/rollback", response_model=VersionResponse)
async def rollback_version(version_id: str, user_id: str = "test_user"):
    """
    回滚到特定版本
    
    将指定版本的内容作为新版本保存
    """
    try:
        new_version = await version_manager.rollback_version(
            user_id=user_id,
            version_id=version_id
        )
        
        return VersionResponse(
            id=new_version.id,
            user_id=new_version.user_id,
            content=new_version.content,
            type=new_version.type.value,
            created_at=new_version.created_at.isoformat(),
            formatted_title=new_version.formatted_title
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"回滚版本失败: {str(e)}"
        )
