# Prompt Optimizer MVP

> 基于 57 个经过验证的 Prompt 工程框架，智能匹配最佳方案，3 分钟生成专业级提示词

## 🎯 核心功能

### 1. 智能框架匹配
- 从 57 个经过验证的 Prompt 工程框架中自动匹配最合适的方案
- 支持思维链、角色扮演、结构化输出等多种框架类型
- AI 自动分析用户需求，推荐 1-3 个最佳框架

### 2. 交互式追问优化
通过 5 个标准问题深入理解需求：
- 目标清晰度：期望的结果是什么？
- 目标受众：谁会接收 AI 的回复？
- 上下文完整性：是否提供了足够的背景信息？
- 格式要求：是否有特定的输出格式需求？
- 约束条件：是否有任何限制或约束？

### 3. 可视化工作台
- 左侧编辑区 + 右侧展示区（5:5 分栏布局）
- 实时预览优化效果
- 支持继续编辑和迭代优化
- 自动保存草稿到本地

### 4. 版本管理与回滚
- 自动保存每次优化的版本
- 保留最近 10 个版本（本地）
- 一键回滚到任意历史版本
- 登录用户可永久保存到云端

### 5. 附件上传支持
- 支持 .txt、.md、.pdf 格式（最大 5MB）
- 上传参考文档，提供更多上下文
- 让 AI 更好地理解需求

### 6. 配额管理
- **Free 用户**：每日 5 次优化配额
- **Pro 用户**：每日 100 次优化配额（$19/月）
- 按 UTC 时区每日 00:00 重置

## 🚀 用户流程

1. 在首页输入原始提示词（最少 10 字符）
2. 可选择上传附件（.txt, .md, .pdf，最大 5MB）
3. 系统匹配推荐框架（最多 3 个）
4. 选择框架并回答追问问题
5. 生成优化后的提示词
6. 在工作台页面查看、编辑、保存版本
7. 支持继续优化或回滚到历史版本

## 💻 技术栈

### Frontend
- Next.js 14+ (App Router) + React 18+ + TypeScript
- Tailwind CSS 3+ (样式框架)
- Zustand (状态管理) + React Query (数据获取)

### Backend
- FastAPI 0.100+ + Python 3.11+
- SQLAlchemy 2.0+ (ORM) + Alembic (数据库迁移)
- Pydantic (数据验证)

### 基础设施
- PostgreSQL 15+ (Supabase)
- DeepSeek API (LLM 服务)
- Supabase Auth (Google 登录)
- Creem (支付订阅)

## 📁 项目结构

```
prompt-optimizer-mvp/
├── .github/              # GitHub Actions CI/CD 配置
├── .kiro/                # Kiro 配置和规范文档
│   ├── specs/           # 项目规范（需求、设计、任务）
│   └── steering/        # AI 助手引导规则
├── backend/             # FastAPI 后端应用
│   ├── app/            # 应用代码
│   │   ├── api/       # API 路由层
│   │   ├── services/  # 业务逻辑层
│   │   ├── models/    # 数据模型
│   │   └── main.py    # 应用入口
│   └── tests/          # 测试代码
├── frontend/            # Next.js 前端应用
│   ├── app/            # 页面路由
│   ├── components/     # React 组件
│   └── lib/            # 工具函数和状态管理
├── skills-main/         # Prompt 框架参考资料（57 个框架）
└── README.md            # 项目主文档
```

## 📄 License

MIT
