# 版本回滚功能实现文档

## 概述

实现了版本回滚功能，允许用户将提示词恢复到之前的任何版本。

## 实现内容

### 1. 后端服务层 (`app/services/version_manager.py`)

添加了 `rollback_version` 方法：

```python
async def rollback_version(
    self,
    user_id: str,
    version_id: str
) -> Version:
    """
    回滚到特定版本
    
    将指定版本的内容作为新版本保存（类型为 SAVE）
    """
```

**功能特点：**
- 验证版本是否存在
- 验证版本是否属于该用户
- 创建新版本（类型为 SAVE）而不是直接修改
- 保留完整的版本历史

### 2. API 端点 (`app/api/versions.py`)

添加了回滚端点：

```
POST /api/v1/versions/{version_id}/rollback?user_id={user_id}
```

**响应格式：**
```json
{
  "id": "新版本ID",
  "user_id": "用户ID",
  "content": "回滚后的内容",
  "type": "save",
  "created_at": "2026-01-03T13:11:15Z",
  "formatted_title": "2026-01-03 13:11:15 · 保存"
}
```

**错误处理：**
- 404: 版本不存在
- 404: 版本不属于该用户
- 500: 服务器内部错误

### 3. 前端 API 客户端 (`frontend/lib/api/client.ts`)

添加了完整的版本管理方法：

```typescript
// 获取版本列表
async getVersions(userId: string, limit: number): Promise<Version[]>

// 保存新版本
async saveVersion(request: SaveVersionRequest): Promise<Version>

// 获取特定版本
async getVersion(versionId: string): Promise<Version>

// 回滚版本
async rollbackVersion(versionId: string, userId: string): Promise<Version>

// 获取配额信息
async getQuota(userId: string, accountType: string): Promise<QuotaResponse>
```

## 测试

### 单元测试 (`test_rollback.py`)

测试了以下场景：
- ✅ 创建多个版本
- ✅ 回滚到指定版本
- ✅ 验证回滚后的版本列表
- ✅ 错误处理（版本不存在）
- ✅ 错误处理（用户不匹配）

### API 集成测试 (`test_rollback_api.py`)

测试了以下场景：
- ✅ 通过 API 创建版本
- ✅ 通过 API 获取版本列表
- ✅ 通过 API 回滚版本
- ✅ 验证回滚后的版本列表
- ✅ API 错误处理（404）

## 使用示例

### 后端使用

```python
from app.services.version_manager import VersionManager

manager = VersionManager()

# 回滚到指定版本
new_version = await manager.rollback_version(
    user_id="test_user",
    version_id="version-id-here"
)
```

### 前端使用

```typescript
import { apiClient } from '@/lib/api/client';

// 回滚版本
const newVersion = await apiClient.rollbackVersion(
  'version-id-here',
  'test_user'
);

console.log('回滚成功！新版本:', newVersion);
```

### API 调用

```bash
# 回滚版本
curl -X POST "http://localhost:8000/api/v1/versions/{version_id}/rollback?user_id=test_user"
```

## 设计决策

### 为什么创建新版本而不是直接恢复？

1. **保留完整历史**：不会丢失任何版本信息
2. **可追溯性**：可以看到何时进行了回滚操作
3. **可撤销**：如果回滚错误，可以再次回滚到之前的版本
4. **符合版本管理最佳实践**：类似 Git 的 revert 而不是 reset

### 为什么回滚后的版本类型是 SAVE？

- 区分用户主动保存和系统自动优化
- 回滚是用户的主动操作，应该标记为 SAVE
- 便于在版本列表中识别回滚操作

## 下一步

- [ ] 在前端 UI 中集成回滚按钮
- [ ] 添加回滚确认对话框
- [ ] 在版本列表中显示回滚标记
- [ ] 添加批量回滚功能（可选）

## 相关文件

- `backend/app/services/version_manager.py` - 版本管理服务
- `backend/app/api/versions.py` - 版本 API 端点
- `frontend/lib/api/client.ts` - 前端 API 客户端
- `backend/test_rollback.py` - 单元测试
- `backend/test_rollback_api.py` - API 集成测试
