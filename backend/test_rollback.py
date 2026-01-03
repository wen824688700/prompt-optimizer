"""
测试版本回滚功能
"""
import asyncio
from app.services.version_manager import VersionManager, VersionType


async def test_rollback():
    """测试版本回滚功能"""
    manager = VersionManager()
    user_id = "test_user"
    
    print("=== 测试版本回滚功能 ===\n")
    
    # 1. 创建几个版本
    print("1. 创建初始版本...")
    v1 = await manager.save_version(
        user_id=user_id,
        content="第一个版本的内容",
        version_type=VersionType.OPTIMIZE
    )
    print(f"   创建版本 1: {v1.id} - {v1.formatted_title}")
    
    await asyncio.sleep(0.1)  # 确保时间戳不同
    
    v2 = await manager.save_version(
        user_id=user_id,
        content="第二个版本的内容",
        version_type=VersionType.SAVE
    )
    print(f"   创建版本 2: {v2.id} - {v2.formatted_title}")
    
    await asyncio.sleep(0.1)
    
    v3 = await manager.save_version(
        user_id=user_id,
        content="第三个版本的内容（最新）",
        version_type=VersionType.OPTIMIZE
    )
    print(f"   创建版本 3: {v3.id} - {v3.formatted_title}")
    
    # 2. 查看版本列表
    print("\n2. 查看版本列表...")
    versions = await manager.get_versions(user_id)
    for i, v in enumerate(versions, 1):
        print(f"   {i}. {v.formatted_title}")
        print(f"      内容: {v.content}")
    
    # 3. 回滚到第一个版本
    print(f"\n3. 回滚到第一个版本 ({v1.id})...")
    rollback_version = await manager.rollback_version(
        user_id=user_id,
        version_id=v1.id
    )
    print(f"   回滚成功！新版本 ID: {rollback_version.id}")
    print(f"   新版本标题: {rollback_version.formatted_title}")
    print(f"   新版本内容: {rollback_version.content}")
    
    # 4. 再次查看版本列表
    print("\n4. 回滚后的版本列表...")
    versions = await manager.get_versions(user_id)
    for i, v in enumerate(versions, 1):
        print(f"   {i}. {v.formatted_title}")
        print(f"      内容: {v.content}")
    
    # 5. 测试错误情况
    print("\n5. 测试错误情况...")
    try:
        await manager.rollback_version(
            user_id=user_id,
            version_id="non-existent-id"
        )
        print("   ❌ 应该抛出异常但没有")
    except ValueError as e:
        print(f"   ✅ 正确捕获异常: {e}")
    
    try:
        await manager.rollback_version(
            user_id="wrong_user",
            version_id=v1.id
        )
        print("   ❌ 应该抛出异常但没有")
    except ValueError as e:
        print(f"   ✅ 正确捕获异常: {e}")
    
    print("\n=== 测试完成 ===")


if __name__ == "__main__":
    asyncio.run(test_rollback())
