"""
测试框架描述加载功能
"""
import asyncio
from app.services.llm_service import LLMService
from app.services.framework_matcher import FrameworkMatcher
from app.config import get_settings


async def test_framework_descriptions():
    """测试框架描述加载"""
    print("=== 测试框架描述加载 ===\n")
    
    # 初始化服务
    settings = get_settings()
    llm_service = LLMService(
        api_key=settings.deepseek_api_key,
        base_url=settings.deepseek_base_url
    )
    matcher = FrameworkMatcher(llm_service)
    
    # 1. 检查加载的框架数量
    print(f"1. 加载的框架数量: {len(matcher.frameworks_descriptions)}")
    
    # 2. 显示前5个框架的描述
    print("\n2. 前5个框架的描述:\n")
    for idx, (name, description) in enumerate(list(matcher.frameworks_descriptions.items())[:5], 1):
        print(f"{idx}. {name}")
        print(f"   描述: {description[:150]}...")
        print()
    
    # 3. 测试特定框架
    test_frameworks = ["BAB Framework", "SPEAR Framework", "Challenge-Solution-Benefit Framework"]
    print("3. 测试特定框架:\n")
    for framework in test_frameworks:
        description = matcher.frameworks_descriptions.get(framework, "未找到")
        print(f"框架: {framework}")
        print(f"描述: {description}")
        print()
    
    # 4. 测试框架匹配（使用真实输入）
    print("4. 测试框架匹配:\n")
    test_input = "帮我写一个关于产品营销的提示词，目标是提高转化率"
    print(f"用户输入: {test_input}\n")
    
    try:
        candidates = await matcher.match_frameworks(test_input)
        print(f"匹配到 {len(candidates)} 个框架:\n")
        for idx, candidate in enumerate(candidates, 1):
            print(f"{idx}. {candidate.name}")
            print(f"   ID: {candidate.id}")
            print(f"   描述: {candidate.description}")
            print(f"   匹配分数: {candidate.match_score}")
            print(f"   推荐理由: {candidate.reasoning}")
            print()
    except Exception as e:
        print(f"匹配失败: {e}")
    
    print("=== 测试完成 ===")


if __name__ == "__main__":
    asyncio.run(test_framework_descriptions())
