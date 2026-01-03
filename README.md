# Prompt Optimizer MVP

基于 57 个经过验证的 Prompt 工程框架的智能提示词优化工具。

## 功能特性

- **智能框架匹配**：自动匹配最合适的 Prompt 框架
- **交互式追问**：通过标准问题收集用户需求
- **迭代优化**：支持多轮对话式优化和版本管理
- **配额管理**：Free 用户每日 5 次，Pro 用户每日 100 次
- **付费订阅**：$19/月的 Pro 订阅（通过 Creem）
- **极简界面**：响应式设计，Markdown 展示

## 技术栈

### Frontend
- Next.js 14+ (App Router)
- React 18+
- Tailwind CSS 3+
- TypeScript
- Zustand (状态管理)
- React Query (数据获取)

### Backend
- FastAPI 0.100+
- Python 3.11+
- SQLAlchemy 2.0+ (ORM)
- Alembic (数据库迁移)
- Pydantic (数据验证)

### Database
- PostgreSQL 15+ (Supabase)

### External Services
- DeepSeek API (LLM)
- Supabase Auth (Google 登录)
- Creem (支付订阅)

## 项目结构

```
prompt-optimizer-mvp/
├── .github/
│   └── workflows/          # CI/CD workflows
├── frontend/               # Next.js app
├── backend/                # FastAPI app
├── skills-main/            # Prompt frameworks
├── .kiro/                  # Kiro specs
└── README.md
```

## 本地开发

### 前置要求

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

### Frontend 开发

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

### Backend 开发

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

访问 http://localhost:8000/docs

## 部署

- Frontend: Vercel (https://384866.xyz)
- Backend: Railway (https://api.384866.xyz)
- Database: Supabase

详见 [部署文档](.kiro/specs/prompt-optimizer-mvp/design.md#deployment)

## License

MIT
