#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""测试主题标签生成的端到端流程"""

import asyncio
import httpx
import os
import sys
from dotenv import load_dotenv

# 设置输出编码为 UTF-8
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# 加载环境变量
load_dotenv()

async def test_generate_with_topic():
    """测试生成提示词时的主题标签"""
    
    # 测试用例
    test_cases = [
        {
            "input": "帮我写一个关于产品营销的文案，需要吸引年轻用户",
            "expected_topic": "产品营销",
            "framework_id": "RACEF",
        },
        {
            "input": "请生成一个技术文档，用于介绍我们的新产品功能",
            "expected_topic": "技术文档",
            "framework_id": "RACEF",
        },
        {
            "input": "写一个关于人工智能的介绍，面向非技术人员",
            "expected_topic": "人工智能",
            "framework_id": "RACEF",
        },
    ]
    
    base_url = "http://127.0.0.1:8000"
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n{'='*60}")
            print(f"测试用例 {i}: {test_case['input']}")
            print(f"期望主题: {test_case['expected_topic']}")
            print(f"{'='*60}")
            
            try:
                # 1. 生成提示词
                response = await client.post(
                    f"{base_url}/api/v1/prompts/generate",
                    json={
                        "input": test_case["input"],
                        "framework_id": test_case["framework_id"],
                        "clarification_answers": {
                            "goal_clarity": "清晰",
                            "target_audience": "普通用户",
                            "context_completeness": "完整",
                            "format_requirements": "无特殊要求",
                            "constraints": "无约束",
                        },
                        "user_id": "test_user_topic",
                        "account_type": "free",
                        "model": "deepseek",
                    }
                )
                
                if response.status_code != 200:
                    print(f"❌ 生成失败: {response.status_code}")
                    print(f"   错误: {response.text}")
                    continue
                
                data = response.json()
                version_id = data.get("version_id")
                print(f"✅ 生成成功")
                print(f"   版本ID: {version_id}")
                
                # 2. 获取版本历史，验证主题标签
                response = await client.get(
                    f"{base_url}/api/v1/versions",
                    params={"user_id": "test_user_topic", "limit": 10}
                )
                
                if response.status_code != 200:
                    print(f"❌ 获取版本历史失败: {response.status_code}")
                    continue
                
                versions = response.json()
                
                # 找到刚才生成的版本
                found_version = None
                for version in versions:
                    if version["id"] == version_id:
                        found_version = version
                        break
                
                if not found_version:
                    print(f"❌ 未找到版本 {version_id}")
                    continue
                
                actual_topic = found_version.get("topic", "")
                print(f"✅ 找到版本")
                print(f"   实际主题: {actual_topic}")
                print(f"   版本号: {found_version.get('version_number')}")
                
                # 验证主题标签
                if actual_topic == test_case["expected_topic"]:
                    print(f"✅ 主题标签正确！")
                else:
                    print(f"❌ 主题标签不匹配")
                    print(f"   期望: {test_case['expected_topic']}")
                    print(f"   实际: {actual_topic}")
                
            except Exception as e:
                print(f"❌ 测试失败: {e}")
                import traceback
                traceback.print_exc()

if __name__ == "__main__":
    print("开始测试主题标签生成功能...")
    asyncio.run(test_generate_with_topic())
    print("\n测试完成！")
