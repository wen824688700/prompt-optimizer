'use client';

import { useState, useEffect } from 'react';
import EditorPanel from '@/components/EditorPanel';
import OutputTabs from '@/components/OutputTabs';
import MarkdownTab from '@/components/MarkdownTab';
import VersionsTab from '@/components/VersionsTab';

interface Version {
  id: string;
  content: string;
  type: 'save' | 'optimize';
  createdAt: string;
}

export default function WorkspacePage() {
  const [outputContent, setOutputContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [editorContent, setEditorContent] = useState('');

  // 从 localStorage 加载初始数据
  useEffect(() => {
    const savedPrompt = localStorage.getItem('currentPrompt');
    const originalInput = localStorage.getItem('originalInput');
    
    if (savedPrompt) {
      setOutputContent(savedPrompt);
      // 清除 localStorage 中的数据，避免刷新时重复加载
      localStorage.removeItem('currentPrompt');
    }
    
    if (originalInput) {
      setEditorContent(originalInput);
      localStorage.removeItem('originalInput');
    }
  }, []);

  const handleRegenerate = async (content: string) => {
    setIsLoading(true);
    try {
      // 从 localStorage 获取之前保存的框架和追问答案
      const savedFramework = localStorage.getItem('selectedFramework');
      const savedAnswers = localStorage.getItem('clarificationAnswers');
      
      if (!savedFramework || !savedAnswers) {
        console.error('Missing framework or clarification answers');
        // TODO: 使用 Toast 组件替代 alert
        alert('缺少必要的信息，请返回首页重新开始');
        setIsLoading(false);
        return;
      }

      const framework = JSON.parse(savedFramework);
      const answers = JSON.parse(savedAnswers);

      // 使用环境变量获取 API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

      // 调用后端 API 重新生成
      const response = await fetch(`${apiUrl}/api/v1/prompts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: content,
          framework_id: framework.id,
          clarification_answers: answers,
          user_id: 'test_user',
          account_type: 'free',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '生成失败');
      }

      const data = await response.json();
      const newContent = data.output;
      setOutputContent(newContent);
      
      // 自动保存为新版本
      const newVersion: Version = {
        id: data.version_id,
        content: newContent,
        type: 'optimize',
        createdAt: new Date().toISOString(),
      };
      setVersions(prev => [newVersion, ...prev]);
    } catch (error) {
      console.error('Failed to regenerate:', error);
      // TODO: 使用 Toast 组件替代 alert
      alert(`重新生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModify = (content: string) => {
    setEditorContent(content);
  };

  const handleSave = (content: string) => {
    const newVersion: Version = {
      id: Date.now().toString(),
      content,
      type: 'save',
      createdAt: new Date().toISOString(),
    };
    setVersions(prev => [newVersion, ...prev]);
  };

  const handleViewVersion = (version: Version) => {
    setOutputContent(version.content);
  };

  const handleRollback = (version: Version) => {
    setOutputContent(version.content);
    setEditorContent(version.content);
  };

  const tabs = [
    {
      id: 'markdown',
      label: 'Markdown 原文',
      content: (
        <MarkdownTab
          content={outputContent}
          onModify={handleModify}
          onSave={handleSave}
        />
      ),
    },
    {
      id: 'versions',
      label: '版本记录',
      content: (
        <VersionsTab
          versions={versions}
          onViewVersion={handleViewVersion}
          onRollback={handleRollback}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop: 5:5 split layout, Mobile: stacked layout */}
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Left Editor Panel - 50% on desktop */}
        <div className="w-full lg:w-1/2 border-r border-gray-200 bg-white">
          <EditorPanel
            initialContent={editorContent}
            onRegenerate={handleRegenerate}
            isLoading={isLoading}
          />
        </div>

        {/* Right Output Panel - 50% on desktop */}
        <div className="w-full lg:w-1/2 bg-white">
          <OutputTabs tabs={tabs} defaultTab="markdown" />
        </div>
      </div>
    </div>
  );
}
