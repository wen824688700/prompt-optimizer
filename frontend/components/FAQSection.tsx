'use client';

import { useState } from 'react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // 默认展开第一个

  const faqs = [
    {
      question: '什么是 Prompt 工程框架？',
      answer: 'Prompt 工程框架是一套经过验证的提示词编写方法论，如 Chain of Thought（思维链）、RACEF（角色-行动-上下文-示例-格式）等。这些框架能够显著提升 AI 输出的质量和准确性。我们的系统基于 57 个经过实战验证的框架。'
    },
    {
      question: '我需要学习 Prompt 工程知识吗？',
      answer: '不需要。Prompt Optimizer 的核心价值就是让您无需学习复杂的理论，系统会自动为您匹配和应用最佳框架。您只需要输入需求，回答几个简单的问题，系统就会自动生成专业级的提示词。'
    },
    {
      question: 'Prompt Optimizer 和其他 AI 工具有什么不同？',
      answer: '我们基于 57 个经过验证的 Prompt 工程框架，提供结构化的优化流程。不同于简单的文本改写，我们会智能匹配最适合的框架，通过交互式追问深入理解需求，生成专业的 Markdown 格式输出，并支持版本管理和迭代优化。'
    },
    {
      question: '生成的 Prompt 可以用在哪些 AI 模型上？',
      answer: '适用于所有主流 AI 模型，包括 ChatGPT、Claude、Gemini、DeepSeek、文心一言等。我们优化的是 Prompt 本身的结构和质量，而不是针对特定模型，因此生成的提示词具有通用性，可以在任何大语言模型上获得更好的效果。'
    },
    {
      question: '数据安全吗？',
      answer: '我们采用银行级加密标准，所有数据传输使用 HTTPS 加密，数据库采用加密存储。我们不会存储您的敏感信息，用户数据完全隔离，符合 GDPR 规范。您可以随时删除账户和所有相关数据。'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq-section" className="w-full bg-slate-900 py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <h2 className="text-4xl sm:text-5xl font-bold text-center text-white mb-4">
          常见问题
        </h2>
        <p className="text-xl text-gray-400 text-center mb-16">
          快速了解 Prompt Optimizer
        </p>

        {/* FAQ 列表 */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300"
            >
              {/* 问题 */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-6 h-6 text-cyan-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 答案 */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-400 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
