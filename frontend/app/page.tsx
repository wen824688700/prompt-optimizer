'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ModelSelector from '@/components/ModelSelector';
import AttachmentUploader from '@/components/AttachmentUploader';
import InputTextarea from '@/components/InputTextarea';
import OptimizeButton from '@/components/OptimizeButton';
import ClarificationModal, { Framework, ClarificationAnswers } from '@/components/ClarificationModal';
import Toast from '@/components/Toast';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { validateInputLength } from '@/lib/utils';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { apiClient } from '@/lib/api/client';

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useLocalStorage('selectedModel', 'deepseek');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const handleOptimize = async () => {
    if (!validateInputLength(input)) {
      showToast('请输入至少 10 个字符', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      // Call backend API to match frameworks
      const response = await apiClient.matchFrameworks({
        input,
        user_type: 'free', // TODO: Get from auth store
      });

      if (response.frameworks && response.frameworks.length > 0) {
        setFrameworks(response.frameworks);
        setIsModalOpen(true);
        showToast(`找到 ${response.frameworks.length} 个推荐框架`, 'success');
      } else {
        showToast('未找到合适的框架，请尝试更详细的描述', 'error');
      }
    } catch (error) {
      console.error('Framework matching error:', error);
      showToast(
        error instanceof Error ? error.message : '框架匹配失败，请稍后重试',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalSubmit = async (answers: ClarificationAnswers) => {
    try {
      setIsLoading(true);
      showToast('正在生成优化提示词...', 'info');
      
      // 保存框架和追问答案到 localStorage，供重新生成时使用
      const selectedFramework = frameworks.find(f => f.id === answers.frameworkId);
      if (selectedFramework) {
        localStorage.setItem('selectedFramework', JSON.stringify(selectedFramework));
      }
      localStorage.setItem('clarificationAnswers', JSON.stringify({
        goalClarity: answers.goalClarity,
        targetAudience: answers.targetAudience,
        contextCompleteness: answers.contextCompleteness,
        formatRequirements: answers.formatRequirements,
        constraints: answers.constraints,
      }));
      
      // 调用生成提示词 API
      const response = await apiClient.generatePrompt({
        input,
        framework_id: answers.frameworkId,
        clarification_answers: {
          goalClarity: answers.goalClarity,
          targetAudience: answers.targetAudience,
          contextCompleteness: answers.contextCompleteness,
          formatRequirements: answers.formatRequirements,
          constraints: answers.constraints,
        },
        user_id: 'test_user', // TODO: Get from auth store
        account_type: 'free', // TODO: Get from auth store
      });
      
      // 关闭弹窗
      setIsModalOpen(false);
      
      // 保存到 localStorage，供工作台页面使用
      localStorage.setItem('currentPrompt', response.output);
      localStorage.setItem('originalInput', input);
      localStorage.setItem('frameworkUsed', response.framework_used);
      localStorage.setItem('versionId', response.version_id);
      
      showToast('提示词生成成功！', 'success');
      
      // 跳转到工作台页面
      router.push('/workspace');
    } catch (error) {
      console.error('Prompt generation error:', error);
      showToast(
        error instanceof Error ? error.message : '提示词生成失败，请稍后重试',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const isOptimizeDisabled = !validateInputLength(input);

  // Show loading skeleton on server-side render
  if (!isClient) {
    return <LoadingSkeleton />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Clarification Modal */}
      <ClarificationModal
        frameworks={frameworks}
        isOpen={isModalOpen}
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
      />
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Prompt Optimizer
            </h1>
            <div className="text-sm text-gray-500">
              MVP
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            智能提示词优化工具
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            基于 57 个经过验证的 Prompt 工程框架，自动匹配最合适的框架，生成高质量的优化提示词
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          {/* Model Selector */}
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

          {/* Attachment Uploader */}
          <AttachmentUploader
            onFileSelect={setAttachment}
          />

          {/* Input Textarea */}
          <InputTextarea
            value={input}
            onChange={setInput}
            placeholder="例如：帮我写一个关于产品营销的提示词..."
          />

          {/* Optimize Button */}
          <OptimizeButton
            onClick={handleOptimize}
            disabled={isOptimizeDisabled}
            loading={isLoading}
          />
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">智能匹配</h3>
            <p className="text-sm text-gray-600">自动匹配最合适的框架</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">交互式追问</h3>
            <p className="text-sm text-gray-600">通过标准问题收集需求</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">迭代优化</h3>
            <p className="text-sm text-gray-600">支持多轮优化和版本管理</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2026 Prompt Optimizer MVP. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
