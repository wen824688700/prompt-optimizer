# ⚠️ 已废弃 - 旧版 API 代码

**注意**: 此目录包含旧版的 Vercel Serverless Functions 代码,已不再使用。

## 当前架构

项目现在使用以下架构:
- **后端**: `backend/app/` - FastAPI 应用
- **部署入口**: `api/index.py` - Vercel Serverless Function 入口
- **前端**: `frontend/app/` - Next.js 应用

## 迁移说明

所有 API 功能已迁移到 `backend/app/api/`:
- ~~`frontend/api/frameworks.py`~~ → `backend/app/api/frameworks.py`
- ~~`frontend/api/prompts.py`~~ → `backend/app/api/prompts.py`
- ~~`frontend/api/quota.py`~~ → **已移除** (配额管理已废弃)
- ~~`frontend/api/versions.py`~~ → `backend/app/api/versions.py`

## 配额管理移除

从 2026-01-25 开始,配额管理系统已完全移除:
- 用户自行配置 LLM API 密钥
- 无使用次数限制
- API 密钥加密存储在浏览器 IndexedDB

---

**保留此目录仅供参考,请勿使用其中的代码。**
