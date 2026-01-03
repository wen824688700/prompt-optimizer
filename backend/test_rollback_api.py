"""
测试版本回滚 API 端点
"""
import asyncio
import httpx


async def test_rollback_api():
    """测试版本回滚 API"""
    base_url = "http://127.0.0.1:8000"
    user_id = "test_user"
    
    print("=== 测试版本回滚 API ===\n")
    
    async with httpx.AsyncClient() as client:
        # 1. 创建几个版本
        print("1. 创建测试版本...")
        versions_created = []
        
        for i in range(3):
            response = await client.post(
                f"{base_url}/api/v1/versions",
                json={
                    "user_id": user_id,
                    "content": f"测试版本 {i+1} 的内容",
                    "type": "save" if i % 2 == 0 else "optimize"
                }
            )
            if response.status_code == 200:
                version = response.json()
                versions_created.append(version)
                print(f"   ✅ 创建版本 {i+1}: {version['id']}")
            else:
                print(f"   ❌ 创建版本失败: {response.text}")
                return
        
        # 2. 获取版本列表
        print("\n2. 获取版本列表...")
        response = await client.get(
            f"{base_url}/api/v1/versions",
            params={"user_id": user_id}
        )
        if response.status_code == 200:
            versions = response.json()
            print(f"   ✅ 获取到 {len(versions)} 个版本")
            for i, v in enumerate(versions, 1):
                print(f"      {i}. {v['formatted_title']}")
        else:
            print(f"   ❌ 获取版本列表失败: {response.text}")
            return
        
        # 3. 回滚到第一个版本
        target_version = versions_created[0]
        print(f"\n3. 回滚到第一个版本 ({target_version['id']})...")
        response = await client.post(
            f"{base_url}/api/v1/versions/{target_version['id']}/rollback",
            params={"user_id": user_id}
        )
        if response.status_code == 200:
            rollback_version = response.json()
            print(f"   ✅ 回滚成功！")
            print(f"      新版本 ID: {rollback_version['id']}")
            print(f"      新版本标题: {rollback_version['formatted_title']}")
            print(f"      新版本内容: {rollback_version['content']}")
        else:
            print(f"   ❌ 回滚失败: {response.text}")
            return
        
        # 4. 再次获取版本列表
        print("\n4. 回滚后的版本列表...")
        response = await client.get(
            f"{base_url}/api/v1/versions",
            params={"user_id": user_id}
        )
        if response.status_code == 200:
            versions = response.json()
            print(f"   ✅ 获取到 {len(versions)} 个版本")
            for i, v in enumerate(versions, 1):
                print(f"      {i}. {v['formatted_title']}")
                print(f"         内容: {v['content']}")
        else:
            print(f"   ❌ 获取版本列表失败: {response.text}")
        
        # 5. 测试错误情况
        print("\n5. 测试错误情况...")
        
        # 测试不存在的版本
        response = await client.post(
            f"{base_url}/api/v1/versions/non-existent-id/rollback",
            params={"user_id": user_id}
        )
        if response.status_code == 404:
            print(f"   ✅ 正确返回 404: {response.json()['detail']}")
        else:
            print(f"   ❌ 应该返回 404 但返回了 {response.status_code}")
        
        # 测试错误的用户
        response = await client.post(
            f"{base_url}/api/v1/versions/{target_version['id']}/rollback",
            params={"user_id": "wrong_user"}
        )
        if response.status_code == 404:
            print(f"   ✅ 正确返回 404: {response.json()['detail']}")
        else:
            print(f"   ❌ 应该返回 404 但返回了 {response.status_code}")
    
    print("\n=== 测试完成 ===")


if __name__ == "__main__":
    print("请确保后端服务正在运行 (python -m uvicorn app.main:app --reload)")
    print("按 Enter 继续...")
    input()
    asyncio.run(test_rollback_api())
