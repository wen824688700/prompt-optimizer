# 技术栈

## Frontend

### 核心技术
- **Next.js 14+**：React 框架，使用 App Router
- **React 18+**：UI 库
- **TypeScript**：类型安全
- **Tailwind CSS 3+**：样式框架

### 状态管理与数据获取
- **Zustand**：轻量级状态管理（authStore, modelStore, quotaStore, toastStore, workspaceStore）
- **React Query (@tanstack/react-query)**：服务端状态管理和数据获取

### 主要依赖
- `@supabase/supabase-js`：Supabase 客户端
- `axios`：HTTP 客户端
- `react-markdown`：Markdown 渲染
- `lucide-react`：图标库
- `clsx` + `tailwind-merge`：样式工具

### 开发工具
- ESLint：代码检查
- TypeScript：类型检查
- Jest + Testing Library：单元测试

## Backend

### 核心技术
- **FastAPI 0.100+**：现代 Python Web 框架
- **Python 3.11+**：编程语言
- **SQLAlchemy 2.0+**：ORM
- **Alembic**：数据库迁移
- **Pydantic**：数据验证和设置管理

### 主要依赖
- `uvicorn`：ASGI 服务器
- `psycopg2-binary`：PostgreSQL 驱动
- `httpx`：异步 HTTP 客户端
- `python-jose`：JWT 处理
- `supabase`：Supabase 客户端
- `python-dotenv`：环境变量管理

### 开发工具
- **pytest**：测试框架
- **pytest-asyncio**：异步测试支持
- **hypothesis**：属性测试
- **ruff**：代码格式化和检查（line-length=100）
- **mypy**：静态类型检查

## 数据库
- **PostgreSQL 15+**：主数据库（托管在 Supabase）

## 常用命令

### Frontend 开发
```bash
cd frontend
npm install              # 安装依赖
npm run dev             # 启动开发服务器 (http://localhost:3000)
npm run build           # 构建生产版本
npm start               # 启动生产服务器
npm run lint            # 代码检查
npm run type-check      # TypeScript 类型检查
npm test                # 运行测试
```

### Backend 开发
```bash
cd backend
python -m venv venv                    # 创建虚拟环境
venv\Scripts\activate                  # 激活虚拟环境 (Windows)
pip install -r requirements.txt        # 安装依赖
uvicorn app.main:app --reload          # 启动开发服务器 (http://localhost:8000)
pytest                                 # 运行所有测试
pytest tests/unit                      # 运行单元测试
pytest tests/property                  # 运行属性测试
ruff check .                           # 代码检查
mypy app                               # 类型检查
```

### 数据库迁移
```bash
cd backend
alembic revision --autogenerate -m "描述"  # 生成迁移文件
alembic upgrade head                       # 应用迁移
alembic downgrade -1                       # 回滚一个版本
```

## API 文档
- Backend API Docs: http://localhost:8000/docs (Swagger UI)
- Backend ReDoc: http://localhost:8000/redoc

## 环境变量

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/db
DEEPSEEK_API_KEY=your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
CREEM_API_KEY=your-creem-key
CREEM_WEBHOOK_SECRET=your-webhook-secret
JWT_SECRET=your-jwt-secret
SENTRY_DSN=your-sentry-dsn (可选)
ENVIRONMENT=development
```
