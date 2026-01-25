"""
测试前端会调用的 API
"""
import asyncio
import httpx

async def test_frontend_apis():
    """测试前端调用的 API"""
    print("=== 测试前端 API 调用 ===\n")
    
    user_id = "dev-user-001"
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # 1. 获取版本列表（前端在 workspace 页面加载时调用）
            print("1. 获取版本列表 (GET /api/v1/versions)")
            response = await client.get(
                "http://127.0.0.1:8000/api/v1/versions",
                params={"user_id": user_id, "limit": 20}
            )
            
            print(f"   状态码: {response.status_code}")
            if response.status_code == 200:
                versions = response.json()
                print(f"   ✅ 成功获取 {len(versions)} 个版本")
                
                if versions:
                    print(f"\n   版本列表:")
                    for i, v in enumerate(versions[:5], 1):
                        print(f"   {i}. v{v['version_number']} - {v['type']} - {v.get('topic', 'N/A')[:30]}")
                else:
                    print(f"   ⚠️ 版本列表为空")
                    print(f"   这就是为什么前端显示'暂无版本记录'")
            else:
                print(f"   ❌ 请求失败")
                print(f"   响应: {response.text}")
            
            # 2. 检查 Supabase 中是否真的有数据
            print(f"\n2. 直接查询 Supabase")
            import os
            from dotenv import load_dotenv
            load_dotenv()
            
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_KEY")
            
            if supabase_url and supabase_key:
                response = await client.get(
                    f"{supabase_url}/rest/v1/versions",
                    headers={
                        "apikey": supabase_key,
                        "Authorization": f"Bearer {supabase_key}",
                    },
                    params={
                        "user_id": f"eq.{user_id}",
                        "order": "created_at.desc",
                        "limit": "5"
                    }
                )
                
                print(f"   状态码: {response.status_code}")
                if response.status_code == 200:
                    db_versions = response.json()
                    print(f"   ✅ Supabase 中有 {len(db_versions)} 个版本")
                    
                    if db_versions:
                        print(f"\n   Supabase 版本列表:")
                        for i, v in enumerate(db_versions, 1):
                            print(f"   {i}. v{v['version_number']} - {v['type']} - {v.get('topic', 'N/A')[:30]}")
                    else:
                        print(f"   ⚠️ Supabase 中没有数据")
                else:
                    print(f"   ❌ 查询失败: {response.text}")
            
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_frontend_apis())
