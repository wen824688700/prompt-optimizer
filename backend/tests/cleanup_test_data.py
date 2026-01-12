#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""清理测试数据"""

import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def cleanup_test_data():
    """清理测试用户的数据"""
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ 缺少 Supabase 配置")
        return
    
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
    }
    
    # 测试用户 ID
    test_user_ids = ["dev-user-001", "test_user", "test_user_topic"]
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for user_id in test_user_ids:
            print(f"\n清理用户 {user_id} 的数据...")
            
            # 1. 删除版本数据
            try:
                response = await client.delete(
                    f"{supabase_url}/rest/v1/versions",
                    headers=headers,
                    params={"user_id": f"eq.{user_id}"}
                )
                if response.status_code in [200, 204]:
                    print(f"  ✅ 已删除版本数据")
                else:
                    print(f"  ⚠️ 删除版本数据失败: {response.status_code}")
            except Exception as e:
                print(f"  ❌ 删除版本数据出错: {e}")
            
            # 2. 删除配额数据
            try:
                response = await client.delete(
                    f"{supabase_url}/rest/v1/user_quotas",
                    headers=headers,
                    params={"user_id": f"eq.{user_id}"}
                )
                if response.status_code in [200, 204]:
                    print(f"  ✅ 已删除配额数据")
                else:
                    print(f"  ⚠️ 删除配额数据失败: {response.status_code}")
            except Exception as e:
                print(f"  ❌ 删除配额数据出错: {e}")

if __name__ == "__main__":
    print("开始清理测试数据...")
    asyncio.run(cleanup_test_data())
    print("\n清理完成！")
