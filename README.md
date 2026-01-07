# Prompt Optimizer MVP

> 基于 57 个经过验证的 Prompt 工程框架，智能匹配最佳方案，3 分钟生成专业级提示词

## ✨ 特性

- 🎯 **智能框架匹配** - 从 57 个 Prompt 框架中自动推荐最合适的方案
- 💬 **交互式追问** - 通过标准化问题深入理解需求
- 📝 **可视化工作台** - 实时预览和编辑优化效果
- 🔄 **版本管理** - 保存历史版本，支持一键回滚
- 📎 **附件支持** - 上传参考文档提供更多上下文
- 🚀 **完全免费部署** - 基于 Vercel Serverless 架构



## 💻 技术栈

- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend**: Vercel Serverless Functions (Python)
- **Database**: Supabase (PostgreSQL)
- **LLM**: DeepSeek API
- **Auth**: Supabase Auth

## 📁 项目结构

```
prompt-optimizer-mvp/
├── frontend/           # Next.js 前端 + Serverless Functions
│   ├── app/           # 页面路由
│   ├── components/    # React 组件
│   ├── lib/           # 工具函数和状态管理
│   └── api/           # Serverless Functions (Python)
├── backend/           # FastAPI 后端（本地开发用）
├── skills-main/       # 57 个 Prompt 框架资料
└── docs/              # 文档
```


## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件
