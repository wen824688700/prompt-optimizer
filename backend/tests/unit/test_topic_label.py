#!/usr/bin/env python3
"""测试主题标签生成函数"""

def _generate_topic_label(user_input: str) -> str:
    """
    生成简洁的主题标签
    
    从用户输入中提取关键词，生成简洁的主题标签
    
    Args:
        user_input: 用户输入的原始文本
        
    Returns:
        简洁的主题标签（最多10个字符）
    """
    # 移除常见的开头词
    input_clean = user_input.strip()
    
    # 移除常见的请求词
    remove_prefixes = [
        "帮我", "请帮我", "帮忙", "请", "我想", "我要", "能否", "可以", "麻烦",
        "写一个", "写个", "生成一个", "生成", "创建一个", "创建",
    ]
    
    for prefix in remove_prefixes:
        if input_clean.startswith(prefix):
            input_clean = input_clean[len(prefix):].strip()
    
    # 移除常见的结尾词
    remove_suffixes = ["吗", "呢", "吧", "啊", "。", "？", "！"]
    for suffix in remove_suffixes:
        if input_clean.endswith(suffix):
            input_clean = input_clean[:-len(suffix)].strip()
    
    # 提取关键部分（去掉"关于"等连接词）
    if "关于" in input_clean:
        # 提取"关于"后面的内容
        parts = input_clean.split("关于", 1)
        if len(parts) > 1:
            input_clean = parts[1].strip()
    
    # 移除逗号及后面的补充说明（如"，需要吸引年轻用户"）
    if "，" in input_clean:
        input_clean = input_clean.split("，")[0].strip()
    if "," in input_clean:
        input_clean = input_clean.split(",")[0].strip()
    
    # 移除常见的文体词（只移除单独的文体词，保留"XX文档"这样的组合）
    standalone_doc_types = ["的文案", "的文档", "的指南", "的介绍", "的建议", "的攻略", "的演讲稿", "的说明"]
    for doc_type in standalone_doc_types:
        if input_clean.endswith(doc_type):
            # 移除"的XX"，保留前面的核心内容
            input_clean = input_clean[:-len(doc_type)].strip()
            break
    
    # 如果没有匹配到"的XX"，尝试移除单独的文体词（但保留组合词）
    if len(input_clean) > 10:
        single_doc_types = ["文案", "介绍", "建议", "攻略", "演讲稿", "说明"]
        for doc_type in single_doc_types:
            if input_clean.endswith(doc_type) and len(input_clean) > len(doc_type):
                # 检查前面是否有"的"，如果有则保留组合词
                if not input_clean.endswith(f"的{doc_type}"):
                    input_clean = input_clean[:-len(doc_type)].strip()
                    break
    
    # 处理"优化XX"这样的动词开头
    if input_clean.startswith("优化"):
        # 提取"优化"后面的内容
        content = input_clean[2:].strip()
        if content.startswith("这段"):
            content = content[2:].strip()
        if len(content) <= 4:
            input_clean = content + "优化"
        else:
            input_clean = content[:4] + "优化"
    
    # 限制长度（最多10个字符，保持简洁）
    if len(input_clean) > 10:
        input_clean = input_clean[:10]
    
    # 如果处理后为空，使用原始输入的前10个字符
    if not input_clean:
        input_clean = user_input[:10]
    
    return input_clean


# 测试用例
test_cases = [
    "帮我写一个关于产品营销的文案",
    "请生成一个技术文档",
    "我想创建一个用户指南",
    "写一个关于人工智能的介绍",
    "帮我优化这段代码",
    "生成一个关于环保的演讲稿",
    "写一个关于健康饮食的建议",
    "帮我写一个产品介绍",
    "请帮我生成一个关于旅游的攻略",
]

print("主题标签生成测试：")
print("-" * 60)
for test in test_cases:
    result = _generate_topic_label(test)
    print(f"输入: {test}")
    print(f"输出: {result}")
    print()
