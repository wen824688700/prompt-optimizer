"""
测试完整的工作流程
"""
import asyncio
import httpx

async def test_full_workflow():
    """测试从生成到版本历史的完整流程"""
    print("=== 测试完整工作流程 ===\n")
    
    user_id = "dev-user-001"
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            # 1. 生成提示词
            print("1. 生成提示词")
            response = await client.post(
                "http://127.0.0.1:8000/api/v1/prompts/generate",
                json={
                    "input": "帮我写一个关于产品营销的文案",
                    "framework_id": "RACEF",
                    "clarification_answers": {
                        "goal_clarity": "写一篇营销文案",
                        "target_audience": "潜在客户",
                        "context_completeness": "介绍产品特点",
                        "format_requirements": "markdown格式",
                        "constraints": "500字左右"
                    },
                    "user_id": user_id,
                    "account_type": "free",
                    "model": "deepseek"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ 生成成功")
                print(f"   版本ID: {data['version_id']}")
                print(f"   使用框架: {data['framework_used']}")
                version_id = data['version_id']
            else:
                print(f"   ❌ 生成失败: {response.status_code}")
                print(f"   错误: {response.text}")
                return
            
            # 2. 获取版本历史
            print("\n2. 获取版本历史")
            response = await client.get(
                "http://127.0.0.1:8000/api/v1/versions",
                params={"user_id": user_id, "limit": 20}
            )
            
            if response.status_code == 200:
                versions = response.json()
                print(f"   ✅ 获取成功，共 {len(versions)} 个版本")
                for i, v in enumerate(versions[:3], 1):
                    print(f"   版本 {i}:")
                    print(f"     ID: {v['id']}")
                    print(f"     版本号: {v['version_number']}")
                    print(f"     类型: {v['type']}")
                    print(f"     主题: {v.get('topic', 'N/A')}")
                    print(f"     创建时间: {v['created_at']}")
            else:
                print(f"   ❌ 获取失败: {response.status_code}")
                print(f"   错误: {response.text}")
                return
            
            # 3. 验证版本是否保存
            print("\n3. 验证版本是否保存到数据库")
            response = await client.get(
                f"http://127.0.0.1:8000/api/v1/versions/{version_id}"
            )
            
            if response.status_code == 200:
                version = response.json()
                print(f"   ✅ 版本已保存")
                print(f"   版本号: {version['version_number']}")
                print(f"   主题: {version.get('topic', 'N/A')}")
                print(f"   内容长度: {len(version['content'])} 字符")
            else:
                print(f"   ❌ 版本不存在: {response.status_code}")
            
            # 4. 再次生成（同一主题）
            print("\n4. 再次生成（同一主题，版本号应该递增）")
            response = await client.post(
                "http://127.0.0.1:8000/api/v1/prompts/generate",
                json={
                    "input": "帮我写一个关于产品营销的文案",  # 相同主题
                    "framework_id": "RACEF",
                    "clarification_answers": {
                        "goal_clarity": "写一篇营销文案",
                        "target_audience": "潜在客户",
                        "context_completeness": "介绍产品特点",
                        "format_requirements": "markdown格式",
                        "constraints": "500字左右"
                    },
                    "user_id": user_id,
                    "account_type": "free",
                    "model": "deepseek"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ 生成成功")
                print(f"   版本ID: {data['version_id']}")
                
                # 获取新版本详情
                response = await client.get(
                    f"http://127.0.0.1:8000/api/v1/versions/{data['version_id']}"
                )
                if response.status_code == 200:
                    version = response.json()
                    print(f"   版本号: {version['version_number']} (应该是 1.1)")
            else:
                print(f"   ❌ 生成失败: {response.status_code}")
            
            # 5. 最终版本列表
            print("\n5. 最终版本列表")
            response = await client.get(
                "http://127.0.0.1:8000/api/v1/versions",
                params={"user_id": user_id, "limit": 20}
            )
            
            if response.status_code == 200:
                versions = response.json()
                print(f"   共 {len(versions)} 个版本:")
                for v in versions:
                    print(f"   - v{v['version_number']} ({v['type']}) - {v.get('topic', 'N/A')}")
            
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("注意：此测试需要有效的 DeepSeek API Key\n")
    asyncio.run(test_full_workflow())
