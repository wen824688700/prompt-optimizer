'use client';

import { useEffect, useState } from 'react';

interface EditorPanelProps {
  initialContent?: string;
  onRegenerate: (content: string) => void;
  isLoading?: boolean;
}

export default function EditorPanel({
  initialContent = '',
  onRegenerate,
  isLoading = false,
}: EditorPanelProps) {
  const [content, setContent] = useState(initialContent);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (content) {
        localStorage.setItem('workspace_draft', JSON.stringify({
          content,
          lastModified: new Date().toISOString(),
        }));
        setLastSaved(new Date());
      }
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(saveTimer);
  }, [content]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('workspace_draft');
    if (savedDraft) {
      try {
        const { content: savedContent } = JSON.parse(savedDraft);
        if (savedContent && !initialContent) {
          setContent(savedContent);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [initialContent]);

  // Update content when initialContent changes (e.g., from "Modify" button)
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const handleRegenerate = () => {
    if (content.trim()) {
      onRegenerate(content);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">编辑区</h2>
        {lastSaved && (
          <span className="text-xs text-gray-500">
            已保存 {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full resize-none border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder="在此编辑您的需求，或在末尾追加修改要求..."
          disabled={isLoading}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleRegenerate}
          disabled={isLoading || !content.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </>
          ) : (
            '重新生成'
          )}
        </button>
      </div>
    </div>
  );
}
