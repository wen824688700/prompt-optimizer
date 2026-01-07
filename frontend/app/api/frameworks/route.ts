/**
 * 框架匹配 API - Next.js Route Handler
 * 根据用户输入匹配最合适的 Prompt 框架
 */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface FrameworkCandidate {
  id: string;
  name: string;
  description: string;
  match_score: number;
  reasoning: string;
}

// 加载框架摘要
function loadFrameworksSummary(): string {
  try {
    const summaryPath = path.join(process.cwd(), '..', 'skills-main', 'skills', 'prompt-optimizer', 'references', 'Frameworks_Summary.md');
    return fs.readFileSync(summaryPath, 'utf-8');
  } catch (error) {
    console.error('Error loading frameworks summary:', error);
    // 返回简化版本
    return `
# AI 提示词框架摘要

| 序号 | 框架名称 | 应用场景 |
|:---:|----------|----------|
| 1 | RACEF Framework | 头脑风暴和创意生成、数据分析和市场研究 |
| 2 | CRISPE Framework | 营销活动策划、员工培训计划设计 |
| 3 | BAB Framework | 订阅服务推广、健身应用营销 |
| 48 | Chain of Thought Framework | 数学问题求解、市场分析、科学现象解释 |
`;
  }
}

// 调用 DeepSeek API 分析意图
async function analyzeIntent(userInput: string, frameworksContext: string): Promise<string[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

  const prompt = `你是一个 AI Prompt 工程专家。根据用户的输入，从以下框架列表中选择 1-3 个最合适的框架。

框架列表：
${frameworksContext}

用户输入：
${userInput}

请分析用户的需求，选择最合适的 1-3 个框架。只返回框架名称，每行一个，不要其他解释。

示例输出：
RACEF Framework
CRISPE Framework`;

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepSeek API error:', error);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // 解析返回的框架名称
    const frameworks = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && !line.startsWith('#'))
      .slice(0, 3); // 最多 3 个

    return frameworks.length > 0 ? frameworks : ['RACEF Framework'];
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    // 返回默认框架
    return ['RACEF Framework'];
  }
}

// 加载框架描述
function loadFrameworkDescription(frameworkId: string): string {
  try {
    const frameworksDir = path.join(process.cwd(), '..', 'skills-main', 'skills', 'prompt-optimizer', 'references', 'frameworks');
    const files = fs.readdirSync(frameworksDir);
    
    // 查找匹配的框架文件
    const matchingFile = files.find(file => {
      const fileName = file.replace('.md', '');
      return fileName.toLowerCase().includes(frameworkId.toLowerCase().replace(' framework', ''));
    });

    if (matchingFile) {
      const content = fs.readFileSync(path.join(frameworksDir, matchingFile), 'utf-8');
      
      // 提取概述部分
      const lines = content.split('\n');
      let overviewStarted = false;
      const overviewLines: string[] = [];
      
      for (const line of lines) {
        if (line.startsWith('## 概述')) {
          overviewStarted = true;
          continue;
        } else if (overviewStarted) {
          if (line.startsWith('##')) break;
          if (line.trim()) overviewLines.push(line.trim());
        }
      }
      
      return overviewLines.join(' ') || `适用于用户需求的 ${frameworkId} 框架`;
    }
  } catch (error) {
    console.error(`Error loading description for ${frameworkId}:`, error);
  }
  
  return `适用于用户需求的 ${frameworkId} 框架`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Frameworks API] Received POST request');
    
    const body = await request.json();
    console.log('[Frameworks API] Request body:', JSON.stringify(body));
    
    // 验证必需字段
    if (!body.input) {
      console.error('[Frameworks API] Missing input field');
      return NextResponse.json(
        { error: '缺少必需字段: input' },
        { status: 400 }
      );
    }
    
    if (body.input.length < 10) {
      console.error('[Frameworks API] Input too short:', body.input.length);
      return NextResponse.json(
        { error: '输入至少需要 10 个字符' },
        { status: 400 }
      );
    }

    const { input, model = 'deepseek', user_type = 'free' } = body;
    console.log('[Frameworks API] Processing:', { input: input.substring(0, 50), model, user_type });

    // 加载框架摘要
    const frameworksSummary = loadFrameworksSummary();
    console.log('[Frameworks API] Loaded frameworks summary');

    // 调用 LLM 分析意图
    console.log('[Frameworks API] Calling DeepSeek API...');
    const frameworkIds = await analyzeIntent(input, frameworksSummary);
    console.log('[Frameworks API] Matched frameworks:', frameworkIds);

    // 构建框架候选列表
    const candidates: FrameworkCandidate[] = frameworkIds.map((frameworkId, idx) => ({
      id: frameworkId,
      name: frameworkId,
      description: loadFrameworkDescription(frameworkId),
      match_score: 1.0 - (idx * 0.1),
      reasoning: `基于用户输入分析，${frameworkId} 最适合此场景`,
    }));

    console.log('[Frameworks API] Returning', candidates.length, 'candidates');
    return NextResponse.json({ frameworks: candidates });

  } catch (error: any) {
    console.error('[Frameworks API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
