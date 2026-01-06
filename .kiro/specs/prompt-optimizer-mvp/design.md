# Design Document: Prompt Optimizer MVP

## Overview

Prompt Optimizer MVP 是一个基于 57 个经过验证的 Prompt 工程框架的智能提示词优化工具。系统采用前后端分离架构，前端使用 Next.js + Tailwind CSS 构建极简界面，后端使用 FastAPI 提供 RESTful API 服务。系统通过 DeepSeek LLM 分析用户输入，自动匹配最合适的框架，并通过交互式追问生成高质量的优化提示词。

### 核心特性

- **智能框架匹配**：基于 Frameworks_Summary.md 表格，使用 LLM 自动匹配最合适的 Prompt 框架
- **交互式追问**：使用 SKILL.md 定义的 5 个标准问题收集用户需求
- **迭代优化**：支持多轮对话式优化，保存多个版本并支持回滚
- **配额管理**：Free 用户每日 5 次，Pro 用户每日 100 次（按 UTC 时区重置）
- **付费订阅**：通过 Creem 集成 $19/月的 Pro 订阅
- **极简界面**：响应式设计，5:5 工作台布局，Markdown 展示

## Architecture

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Home Page   │  │  Workspace   │  │ Account Page │      │
│  │  - Input     │  │  - Editor    │  │  - Quota     │      │
│  │  - Model     │  │  - Versions  │  │  - Billing   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Framework    │  │  LLM Service │  │  Auth        │      │
│  │ Matcher      │  │  (DeepSeek)  │  │  (Supabase)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Quota        │  │  Version     │  │  Payment     │      │
│  │ Manager      │  │  Manager     │  │  (Creem)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Users     │  │   Versions   │  │    Quotas    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

**Frontend:**
- Next.js 14+ (App Router)
- React 18+
- Tailwind CSS 3+
- TypeScript
- Zustand (状态管理)
- React Query (数据获取)

**Backend:**
- FastAPI 0.100+
- Python 3.11+
- SQLAlchemy 2.0+ (ORM)
- Alembic (数据库迁移)
- Pydantic (数据验证)

**Database:**
- PostgreSQL 15+

**External Services:**
- DeepSeek API (LLM)
- Supabase Auth (Google 登录)
- Creem (支付订阅)

## Components and Interfaces

### 1. Frontend Components

#### 1.1 HomePage Component

**职责**：首页输入界面，包含模型选择、附件上传和输入框

**Props:**
```typescript
interface HomePageProps {
  onOptimize: (input: string, model: string, attachment?: File) => Promise<void>;
}
```

**State:**
```typescript
interface HomePageState {
  input: string;
  selectedModel: string;
  attachment: File | null;
  isLoading: boolean;
}
```

**子组件:**
- `ModelSelector`: 模型选择下拉菜单
- `AttachmentUploader`: 附件上传组件
- `InputTextarea`: 输入框组件
- `OptimizeButton`: 优化按钮

#### 1.2 ClarificationModal Component

**职责**：展示框架选择和追问问题的弹窗

**Props:**
```typescript
interface ClarificationModalProps {
  frameworks: Framework[];
  onSubmit: (answers: ClarificationAnswers) => Promise<void>;
  onCancel: () => void;
}

interface Framework {
  id: string;
  name: string;
  description: string;
}

interface ClarificationAnswers {
  frameworkId: string;
  goalClarity: string;
  targetAudience: string;
  contextCompleteness: string;
  formatRequirements: string;
  constraints: string;
}
```

**子组件:**
- `FrameworkSelector`: 框架选择（如果有多个候选）
- `QuestionForm`: 5 个标准追问问题的表单

#### 1.3 Workspace Component

**职责**：工作台页面，包含左侧编辑区和右侧展示区

**Props:**
```typescript
interface WorkspaceProps {
  initialPrompt: string;
  generatedOutput: string;
  versions: Version[];
  onRegenerate: (modifiedInput: string) => Promise<void>;
  onSaveVersion: (output: string) => Promise<void>;
  onRollback: (versionId: string) => void;
}

interface Version {
  id: string;
  timestamp: string; // UTC ISO 8601
  type: 'save' | 'optimize';
  content: string;
}
```

**Layout:**
- 左侧（50%）：编辑区
  - `EditorPanel`: 可编辑的输入框
  - `RegenerateButton`: 重新生成按钮
- 右侧（50%）：展示区
  - `OutputTabs`: 两个选项卡
    - `MarkdownTab`: Markdown 原文展示
    - `VersionsTab`: 版本记录列表

#### 1.4 AccountPage Component

**职责**：账户管理页面，显示配额和订阅信息

**Props:**
```typescript
interface AccountPageProps {
  user: User;
  quota: QuotaInfo;
  subscription: SubscriptionInfo | null;
  onUpgrade: () => void;
  onCancelSubscription: () => void;
}

interface User {
  id: string;
  email: string;
  avatar: string;
  accountType: 'free' | 'pro';
}

interface QuotaInfo {
  used: number;
  total: number;
  resetTime: string; // UTC ISO 8601
}

interface SubscriptionInfo {
  status: 'active' | 'cancelled' | 'expired';
  nextBillingDate: string;
  amount: number;
}
```

### 2. Backend Services

#### 2.1 FrameworkMatcher Service

**职责**：根据用户输入匹配最合适的 Prompt 框架

**接口:**
```python
class FrameworkMatcher:
    def __init__(self, llm_service: LLMService):
        self.llm_service = llm_service
        self.frameworks_summary = self._load_frameworks_summary()
    
    async def match_frameworks(
        self, 
        user_input: str, 
        user_type: UserType
    ) -> List[FrameworkCandidate]:
        """
        匹配 1-3 个最合适的框架
        
        Args:
            user_input: 用户输入的原始提示词或需求
            user_type: 用户类型（Free/Pro）
        
        Returns:
            1-3 个框架候选，按匹配度排序
        """
        pass
    
    def _load_frameworks_summary(self) -> str:
        """加载 Frameworks_Summary.md 表格"""
        pass
```

**数据模型:**
```python
class FrameworkCandidate(BaseModel):
    id: str
    name: str
    description: str
    match_score: float
    reasoning: str
```

#### 2.2 LLMService

**职责**：封装 DeepSeek API 调用

**接口:**
```python
class LLMService:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.client = self._init_client()
    
    async def analyze_intent(
        self, 
        user_input: str, 
        frameworks_context: str
    ) -> List[str]:
        """
        分析用户意图并返回推荐的框架 ID
        
        Args:
            user_input: 用户输入
            frameworks_context: 框架映射表上下文
        
        Returns:
            1-3 个框架 ID
        """
        pass
    
    async def generate_prompt(
        self,
        user_input: str,
        framework_doc: str,
        clarification_answers: Dict[str, str],
        attachment_content: Optional[str] = None
    ) -> str:
        """
        生成优化后的提示词
        
        Args:
            user_input: 用户原始输入
            framework_doc: 完整的框架文档
            clarification_answers: 追问问题的答案
            attachment_content: 附件内容（可选）
        
        Returns:
            优化后的 Markdown 格式提示词
        """
        pass
```

#### 2.3 QuotaManager Service

**职责**：管理用户配额

**接口:**
```python
class QuotaManager:
    def __init__(self, db: Database):
        self.db = db
    
    async def check_quota(self, user_id: str) -> QuotaStatus:
        """
        检查用户当日配额
        
        Returns:
            QuotaStatus 包含剩余配额和重置时间
        """
        pass
    
    async def consume_quota(self, user_id: str) -> bool:
        """
        消耗一次配额
        
        Returns:
            是否成功消耗（配额不足返回 False）
        """
        pass
    
    async def reset_daily_quotas(self):
        """
        重置所有用户的每日配额（定时任务调用）
        """
        pass
```

**数据模型:**
```python
class QuotaStatus(BaseModel):
    user_id: str
    used: int
    total: int
    reset_time: datetime  # UTC
    can_generate: bool
```

#### 2.4 VersionManager Service

**职责**：管理提示词版本

**接口:**
```python
class VersionManager:
    def __init__(self, db: Database):
        self.db = db
    
    async def save_version(
        self,
        user_id: str,
        content: str,
        version_type: VersionType
    ) -> Version:
        """
        保存一个新版本
        
        Args:
            user_id: 用户 ID
            content: 提示词内容
            version_type: 版本类型（save/optimize）
        
        Returns:
            保存的版本对象
        """
        pass
    
    async def get_versions(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[Version]:
        """
        获取用户的版本列表（最近 10 个）
        
        Returns:
            按时间倒序的版本列表
        """
        pass
    
    async def get_version(
        self,
        version_id: str
    ) -> Optional[Version]:
        """
        获取特定版本
        """
        pass
```

**数据模型:**
```python
class Version(BaseModel):
    id: str
    user_id: str
    content: str
    type: VersionType  # 'save' | 'optimize'
    created_at: datetime  # UTC
    
    @property
    def formatted_title(self) -> str:
        """返回格式化的标题：YYYY-MM-DD HH:mm:ss · 保存/优化"""
        pass

class VersionType(str, Enum):
    SAVE = "save"
    OPTIMIZE = "optimize"
```

#### 2.5 AuthService

**职责**：处理用户认证（集成 Supabase Auth）

**接口:**
```python
class AuthService:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase = create_client(supabase_url, supabase_key)
    
    async def verify_token(self, token: str) -> Optional[User]:
        """
        验证 JWT token 并返回用户信息
        """
        pass
    
    async def get_user(self, user_id: str) -> Optional[User]:
        """
        获取用户信息
        """
        pass
```

#### 2.6 PaymentService

**职责**：处理 Creem 支付集成

**接口:**
```python
class PaymentService:
    def __init__(self, creem_api_key: str):
        self.creem_api_key = creem_api_key
    
    async def create_checkout_session(
        self,
        user_id: str,
        plan: str = "pro"
    ) -> str:
        """
        创建 Creem 支付会话
        
        Returns:
            支付页面 URL
        """
        pass
    
    async def handle_webhook(
        self,
        payload: Dict,
        signature: str
    ) -> bool:
        """
        处理 Creem Webhook 事件
        
        Returns:
            是否成功处理
        """
        pass
    
    async def upgrade_user(self, user_id: str):
        """
        升级用户为 Pro
        """
        pass
    
    async def downgrade_user(self, user_id: str):
        """
        降级用户为 Free
        """
        pass
```

### 3. API Endpoints

#### 3.1 Framework Matching

```
POST /api/v1/frameworks/match
```

**Request:**
```json
{
  "input": "string",
  "attachment": "base64_string (optional)"
}
```

**Response:**
```json
{
  "frameworks": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "match_score": 0.95
    }
  ]
}
```

#### 3.2 Prompt Generation

```
POST /api/v1/prompts/generate
```

**Request:**
```json
{
  "input": "string",
  "framework_id": "string",
  "clarification_answers": {
    "goal_clarity": "string",
    "target_audience": "string",
    "context_completeness": "string",
    "format_requirements": "string",
    "constraints": "string"
  },
  "attachment_content": "string (optional)"
}
```

**Response:**
```json
{
  "output": "string (Markdown)",
  "framework_used": "string",
  "version_id": "string"
}
```

#### 3.3 Version Management

```
GET /api/v1/versions
POST /api/v1/versions
GET /api/v1/versions/{version_id}
POST /api/v1/versions/{version_id}/rollback
```

#### 3.4 Quota Management

```
GET /api/v1/quota
```

**Response:**
```json
{
  "used": 3,
  "total": 5,
  "reset_time": "2026-01-04T00:00:00Z",
  "can_generate": true
}
```

#### 3.5 Payment

```
POST /api/v1/payment/checkout
POST /api/v1/payment/webhook
GET /api/v1/payment/subscription
POST /api/v1/payment/cancel
```

## Data Models

### Database Schema

```sql
-- Users table (managed by Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    account_type VARCHAR(10) NOT NULL DEFAULT 'free', -- 'free' | 'pro'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotas table
CREATE TABLE quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL, -- UTC date
    used_count INTEGER NOT NULL DEFAULT 0,
    total_count INTEGER NOT NULL, -- 5 for free, 100 for pro
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Versions table
CREATE TABLE versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(10) NOT NULL, -- 'save' | 'optimize'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_versions_user_created ON versions(user_id, created_at DESC);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creem_subscription_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL, -- 'active' | 'cancelled' | 'expired'
    plan VARCHAR(20) NOT NULL DEFAULT 'pro',
    amount DECIMAL(10, 2) NOT NULL,
    next_billing_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### Local Storage Schema (Frontend)

```typescript
interface LocalDraft {
  input: string;
  lastModified: string; // ISO 8601
}

interface LocalVersions {
  versions: Version[];
  currentVersionId: string | null;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Model Selection Persistence

*For any* selected LLM model, when a user chooses it, the system should save the selection and use it in all subsequent generation requests until changed.

**Validates: Requirements 2.3**

### Property 2: File Validation

*For any* uploaded file, the system should correctly validate its type (must be .txt, .md, or .pdf) and size (must be ≤ 5MB), rejecting invalid files with appropriate error messages.

**Validates: Requirements 2.5**

### Property 3: File Display After Validation

*For any* valid uploaded file, the system should display the filename and a delete button.

**Validates: Requirements 2.6**

### Property 4: Attachment Context Passing

*For any* uploaded attachment, when generating a prompt, the system should include the attachment content as additional context in the LLM request.

**Validates: Requirements 2.7**

### Property 5: Input Length Validation

*For any* user input string, the system should accept it if length ≥ 10 characters, and reject it with validation error if length < 10 characters.

**Validates: Requirements 3.1**

### Property 6: LLM Service Invocation

*For any* valid user input, when the "Optimize" button is clicked, the system should call the LLM_Service with the Frameworks_Summary.md table as context.

**Validates: Requirements 3.2**

### Property 7: Framework Recommendation Count

*For any* LLM analysis result, the system should return between 1 and 3 framework candidates (inclusive).

**Validates: Requirements 3.5**

### Property 8: Clarification Modal Display

*For any* selected or determined framework, the system should display a modal with the 5 standard clarification questions.

**Validates: Requirements 4.1**

### Property 9: Required Field Validation

*For any* required clarification field, the system should validate it on submission and prevent submission if empty.

**Validates: Requirements 4.3**

### Property 10: Optional Field Skipping

*For any* optional clarification field, the system should allow the user to skip it (leave empty) and still submit successfully.

**Validates: Requirements 4.4**

### Property 11: Modal State Transition

*For any* valid clarification form submission, the system should close the modal and display a progress bar.

**Validates: Requirements 4.5**

### Property 12: Prompt Generation with Context

*For any* user clarification answers, the system should call LLM_Service with the complete framework document and user answers as context.

**Validates: Requirements 5.1**

### Property 13: Markdown Content Sync

*For any* Markdown content in the right panel, when the "Modify" button is clicked, the system should copy it exactly to the left editor panel.

**Validates: Requirements 5.9**

### Property 14: Version Saving

*For any* prompt content, when the "Save" button is clicked, the system should save it as a new version with a UTC timestamp and switch to the versions tab.

**Validates: Requirements 5.11**

### Property 15: Auto-save to Local Storage

*For any* edit operation in the left editor panel, the system should automatically save the draft to local storage.

**Validates: Requirements 6.1**

### Property 16: Regeneration with Modified Input

*For any* modified input in the left editor, when "Regenerate" is clicked, the system should call LLM_Service with the modified input.

**Validates: Requirements 6.2**

### Property 17: Version Timestamp Format

*For any* saved version, the system should create a timestamp in UTC with format "YYYY-MM-DD HH:mm:ss · Save/Optimize".

**Validates: Requirements 6.3, 6.5**

### Property 18: Version List Sorting

*For any* list of versions, the system should display them in descending order by timestamp (newest first).

**Validates: Requirements 6.4**

### Property 19: Version Content Display

*For any* version selected from the list, the system should display its content in the Markdown tab.

**Validates: Requirements 6.6**

### Property 20: Version Rollback

*For any* version, when "Rollback" is clicked, the system should replace the current workspace output with that version's content.

**Validates: Requirements 6.7**

### Property 21: Version Persistence

*For any* prompt content, when "Save Current Version" is clicked (user logged in), the system should persist it to the database.

**Validates: Requirements 6.9**

### Property 22: Free User Quota Check

*For any* Free user generation request, the system should check if the current day's (UTC) used quota is less than 5.

**Validates: Requirements 8.1, 8.2**

### Property 23: Pro User Quota Check

*For any* Pro user generation request, the system should check if the current day's (UTC) used quota is less than 100.

**Validates: Requirements 8.4**

### Property 24: Subscription Status Update

*For any* successful Creem subscription confirmation, the system should update the user's account type to Pro and unlock deep analysis mode.

**Validates: Requirements 9.3**

### Property 25: LLM Error Handling

*For any* LLM_Service call failure, the system should display an error message and provide a "Retry" button.

**Validates: Requirements 10.1**

### Property 26: Input Validation Error Display

*For any* invalid user input, the system should display a validation error message below the input field.

**Validates: Requirements 10.3**

### Property 27: File Upload Error Display

*For any* invalid file upload (wrong type or too large), the system should display a specific error message explaining the reason.

**Validates: Requirements 10.4**

## Error Handling

### Error Categories

1. **Validation Errors**
   - Input too short (< 10 characters)
   - Invalid file type or size
   - Required clarification fields empty
   - Response: 400 Bad Request with specific error message

2. **Authentication Errors**
   - Missing or invalid JWT token
   - Expired session
   - Response: 401 Unauthorized, redirect to login

3. **Authorization Errors**
   - Quota exceeded
   - Feature not available for user tier
   - Response: 403 Forbidden with upgrade prompt

4. **External Service Errors**
   - DeepSeek API failure
   - Supabase Auth failure
   - Creem payment failure
   - Response: 502 Bad Gateway with retry option

5. **Server Errors**
   - Database connection failure
   - Unexpected exceptions
   - Response: 500 Internal Server Error with generic message

### Error Response Format

```json
{
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "You've reached your daily limit of 5 optimizations. Upgrade to Pro for 100 daily optimizations.",
    "details": {
      "used": 5,
      "total": 5,
      "reset_time": "2026-01-04T00:00:00Z"
    },
    "action": {
      "type": "upgrade",
      "label": "Upgrade to Pro",
      "url": "/account/upgrade"
    }
  }
}
```

### Retry Strategy

- **Network Errors**: Auto-retry 3 times with exponential backoff (1s, 2s, 4s)
- **LLM Timeout**: Single retry with user confirmation
- **Rate Limiting**: Wait and retry after specified time
- **Other Errors**: Manual retry via UI button

## Testing Strategy

### Dual Testing Approach

This system requires both **unit tests** and **property-based tests** for comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Unit Testing

**Focus Areas:**
- Specific UI component rendering (e.g., homepage contains input box, model selector, upload button, optimize button)
- Specific API endpoint responses (e.g., /api/v1/frameworks/match returns expected format)
- Edge cases:
  - Framework recommendation count = 1 (direct to clarification)
  - Framework recommendation count > 1 (show selection modal)
  - Free user quota = 5 (reject with upgrade prompt)
  - Pro user quota = 100 (reject with wait prompt)
  - Version count > 10 (keep only recent 10)
- Authentication flows (Google login, session creation)
- Payment flows (Creem checkout, webhook handling)

**Example Unit Tests:**
```python
def test_homepage_contains_required_elements():
    """Verify homepage has input, model selector, upload, and optimize button"""
    pass

def test_free_user_quota_limit():
    """Verify Free user is rejected when quota reaches 5"""
    pass

def test_version_limit_enforcement():
    """Verify only 10 most recent versions are kept"""
    pass
```

### Property-Based Testing

**Configuration:**
- Minimum 100 iterations per property test
- Use `hypothesis` (Python) or `fast-check` (TypeScript)
- Each test must reference its design document property
- Tag format: `# Feature: prompt-optimizer-mvp, Property {number}: {property_text}`

**Property Test Examples:**

```python
from hypothesis import given, strategies as st

@given(st.text(min_size=10))
def test_property_5_input_length_validation(user_input: str):
    """
    Feature: prompt-optimizer-mvp, Property 5: Input Length Validation
    For any user input string with length ≥ 10, system should accept it
    """
    result = validate_input(user_input)
    assert result.is_valid == True

@given(st.text(max_size=9))
def test_property_5_input_length_validation_reject(user_input: str):
    """
    Feature: prompt-optimizer-mvp, Property 5: Input Length Validation
    For any user input string with length < 10, system should reject it
    """
    result = validate_input(user_input)
    assert result.is_valid == False
    assert "at least 10 characters" in result.error_message

@given(st.sampled_from(['txt', 'md', 'pdf']), st.integers(min_value=1, max_value=5*1024*1024))
def test_property_2_file_validation_valid(file_ext: str, file_size: int):
    """
    Feature: prompt-optimizer-mvp, Property 2: File Validation
    For any file with valid type and size ≤ 5MB, system should accept it
    """
    file = create_mock_file(f"test.{file_ext}", file_size)
    result = validate_file(file)
    assert result.is_valid == True

@given(st.lists(st.builds(Version), min_size=1, max_size=20))
def test_property_18_version_list_sorting(versions: List[Version]):
    """
    Feature: prompt-optimizer-mvp, Property 18: Version List Sorting
    For any list of versions, system should sort by timestamp descending
    """
    sorted_versions = sort_versions(versions)
    for i in range(len(sorted_versions) - 1):
        assert sorted_versions[i].created_at >= sorted_versions[i+1].created_at

@given(st.integers(min_value=0, max_value=4))
def test_property_22_free_user_quota_check(used_quota: int):
    """
    Feature: prompt-optimizer-mvp, Property 22: Free User Quota Check
    For any Free user with used quota < 5, system should allow generation
    """
    user = create_free_user(used_quota=used_quota)
    result = check_quota(user)
    assert result.can_generate == True

@given(st.integers(min_value=5, max_value=100))
def test_property_22_free_user_quota_exceeded(used_quota: int):
    """
    Feature: prompt-optimizer-mvp, Property 22: Free User Quota Check
    For any Free user with used quota ≥ 5, system should reject generation
    """
    user = create_free_user(used_quota=used_quota)
    result = check_quota(user)
    assert result.can_generate == False
```

### Integration Testing

**Focus Areas:**
- End-to-end user flows:
  - Complete optimization flow (input → match → clarify → generate → display)
  - Version management flow (save → list → view → rollback)
  - Subscription flow (upgrade → payment → webhook → unlock features)
- External service integration:
  - DeepSeek API calls with real responses
  - Supabase Auth with test accounts
  - Creem webhook handling with test events

### Performance Testing

**Targets:**
- Homepage first render: < 2 seconds
- User interaction response: < 100ms
- LLM API call: < 30 seconds (with timeout)
- Database queries: < 100ms

### Test Coverage Goals

- Unit test coverage: > 80%
- Property test coverage: All 27 properties implemented
- Integration test coverage: All critical user flows
- E2E test coverage: Happy path + error scenarios

## Deployment

### Environment Variables

**Frontend (.env.production):**
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

**Backend (.env.production):**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx
CREEM_API_KEY=xxx
CREEM_WEBHOOK_SECRET=xxx
JWT_SECRET=xxx
SENTRY_DSN=https://xxx@sentry.io/xxx
ENVIRONMENT=production
```

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│                  (main branch = production)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   Vercel (Frontend)      │  │  Railway/Render (Backend)│
│   - Next.js Build        │  │  - FastAPI + Uvicorn     │
│   - Custom Domain        │  │  - Docker Container      │
│   - Auto SSL             │  │  - Auto Deploy           │
└──────────────────────────┘  └──────────────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase (PostgreSQL + Auth)                │
│                  - Database Hosting                          │
│                  - Google OAuth                              │
└─────────────────────────────────────────────────────────────┘
```

### GitHub Repository Structure

```
prompt-optimizer-mvp/
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml      # Frontend CI/CD
│       └── backend-ci.yml       # Backend CI/CD
├── frontend/                    # Next.js app
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── vercel.json             # Vercel configuration
├── backend/                     # FastAPI app
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   └── main.py
│   ├── alembic/                # Database migrations
│   ├── requirements.txt
│   ├── Dockerfile
│   └── railway.json            # Railway configuration
├── skills-main/                 # Prompt frameworks
│   └── skills/
│       └── prompt-optimizer/
├── .gitignore
├── README.md
└── LICENSE
```

### CI/CD Pipeline

#### Frontend Deployment (Vercel)

**GitHub Actions Workflow (.github/workflows/frontend-ci.yml):**
```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Lint
        run: cd frontend && npm run lint
      - name: Type check
        run: cd frontend && npm run type-check
      - name: Unit tests
        run: cd frontend && npm run test
      - name: Build
        run: cd frontend && npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: echo "Vercel auto-deploys from GitHub"
```

**Vercel Configuration (frontend/vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

**Vercel Setup Steps:**
1. 连接 GitHub 仓库到 Vercel
2. 设置 Root Directory 为 `frontend`
3. 配置环境变量（从 Vercel Dashboard）
4. 绑定自定义域名（yourdomain.com）
5. 启用 Vercel Analytics

#### Backend Deployment (Railway/Render)

**GitHub Actions Workflow (.github/workflows/backend-ci.yml):**
```yaml
name: Backend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
  pull_request:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: cd backend && pip install -r requirements.txt
      - name: Lint
        run: cd backend && ruff check .
      - name: Type check
        run: cd backend && mypy app/
      - name: Unit tests
        run: cd backend && pytest tests/unit
      - name: Property tests
        run: cd backend && pytest tests/property

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: echo "Railway auto-deploys from GitHub"
```

**Railway Configuration (backend/railway.json):**
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

**Dockerfile (backend/Dockerfile):**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Railway Setup Steps:**
1. 连接 GitHub 仓库到 Railway
2. 设置 Root Directory 为 `backend`
3. 配置环境变量（从 Railway Dashboard）
4. 设置自定义域名（api.yourdomain.com）
5. 配置 Cron Job for quota reset (daily at UTC 00:00)

### Database Migration

**Alembic Setup:**
```bash
# 初始化 Alembic
cd backend
alembic init alembic

# 创建迁移脚本
alembic revision --autogenerate -m "Initial schema"

# 应用迁移（生产环境）
alembic upgrade head
```

**Migration Workflow:**
1. 本地开发：修改 SQLAlchemy models
2. 生成迁移脚本：`alembic revision --autogenerate -m "description"`
3. 审查迁移脚本：检查 `alembic/versions/xxx.py`
4. 测试迁移：在本地数据库运行 `alembic upgrade head`
5. 提交到 GitHub
6. 生产环境：手动触发 Railway 运行 `alembic upgrade head`

### Custom Domain Setup

**配置自定义域名：**

**Frontend 域名配置：**
1. Vercel Dashboard → Settings → Domains
2. 添加您的域名（例如 `example.com` 和 `www.example.com`）
3. 在 DNS 提供商配置 CNAME 记录：
   ```
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
   TTL: Auto
   
   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   TTL: Auto
   ```
4. 等待 DNS 传播（通常 5-10 分钟）
5. Vercel 自动配置 SSL 证书（Let's Encrypt）

**Backend 域名配置：**
1. Railway Dashboard → Settings → Domains
2. 添加您的 API 子域名（例如 `api.example.com`）
3. 在 DNS 提供商配置 CNAME 记录：
   ```
   Type: CNAME
   Name: api
   Target: xxx.up.railway.app (从 Railway 获取)
   TTL: Auto
   ```
4. 等待 DNS 传播
5. Railway 自动配置 SSL 证书

**Cloudflare 额外配置（可选）:**
- SSL/TLS 模式：Full (strict)
- Always Use HTTPS：开启
- Automatic HTTPS Rewrites：开启
- HTTP Strict Transport Security (HSTS)：开启
- Minimum TLS Version：TLS 1.2

**注意事项：**
- 初次配置时，Proxy status 必须设置为 "DNS only"（灰色云朵），让 Vercel/Railway 能够验证域名所有权
- SSL 证书配置完成后，可以选择开启 Cloudflare Proxy（橙色云朵）以获得 CDN 加速和 DDoS 防护
- 如果开启 Cloudflare Proxy，需要在 Cloudflare 设置 SSL/TLS 为 "Full (strict)" 模式

### Monitoring & Alerts

**Sentry Setup:**
```bash
# Frontend
npm install @sentry/nextjs

# Backend
pip install sentry-sdk[fastapi]
```

**Sentry Configuration:**
```typescript
// frontend/sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

```python
# backend/app/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment=os.getenv("ENVIRONMENT"),
    traces_sample_rate=1.0,
    integrations=[FastApiIntegration()],
)
```

**Vercel Analytics:**
- 自动启用（Vercel Dashboard → Analytics）
- 监控页面性能、Core Web Vitals

**Railway Metrics:**
- 自动启用（Railway Dashboard → Metrics）
- 监控 CPU、内存、网络使用

**Alert Configuration:**
- Sentry: 配置 Slack/Email 通知
- Vercel: 配置部署失败通知
- Railway: 配置健康检查失败通知

### Deployment Checklist

**Pre-deployment:**
- [ ] 所有测试通过（Unit + Property + Integration）
- [ ] 环境变量已配置（Vercel + Railway）
- [ ] 数据库迁移脚本已审查
- [ ] Sentry DSN 已配置
- [ ] 自定义域名 DNS 已配置

**Deployment:**
- [ ] 推送代码到 GitHub main 分支
- [ ] Vercel 自动部署前端
- [ ] Railway 自动部署后端
- [ ] 运行数据库迁移（Railway CLI）
- [ ] 验证健康检查端点（/health）

**Post-deployment:**
- [ ] 访问自定义域名验证前端
- [ ] 测试 API 端点（api.yourdomain.com/docs）
- [ ] 测试 Google 登录流程
- [ ] 测试 Creem 支付流程
- [ ] 检查 Sentry 错误日志
- [ ] 检查 Vercel Analytics 数据
- [ ] 配置 Cron Job（每日 UTC 00:00 重置配额）

### Rollback Strategy

**Frontend Rollback:**
1. Vercel Dashboard → Deployments
2. 选择上一个稳定版本
3. 点击 "Promote to Production"

**Backend Rollback:**
1. Railway Dashboard → Deployments
2. 选择上一个稳定版本
3. 点击 "Redeploy"

**Database Rollback:**
```bash
# 回滚到上一个迁移版本
alembic downgrade -1

# 回滚到特定版本
alembic downgrade <revision_id>
```

## Security Considerations

1. **Authentication**
   - JWT tokens with 7-day expiration
   - Refresh tokens for seamless re-authentication
   - HTTPS only for all communications

2. **Authorization**
   - Role-based access control (Free/Pro)
   - API rate limiting: 100 requests/minute per user
   - Quota enforcement at database level

3. **Data Protection**
   - User data encrypted at rest (PostgreSQL encryption)
   - Sensitive data (API keys) stored in environment variables
   - No PII in logs

4. **Input Validation**
   - All user inputs sanitized
   - File uploads scanned for malware (future enhancement)
   - SQL injection prevention via ORM

5. **API Security**
   - CORS configured for frontend domain only
   - CSRF protection for state-changing operations
   - Webhook signature verification (Creem)

## Future Enhancements

1. **Multi-language Support**: i18n for Chinese/English
2. **Collaborative Editing**: Share prompts with team members
3. **Prompt Templates**: Pre-built templates for common use cases
4. **Analytics Dashboard**: Track optimization success metrics
5. **AI Model Comparison**: Compare outputs from different LLMs
6. **Export Formats**: Export to PDF, DOCX, or API
7. **Browser Extension**: Optimize prompts directly in ChatGPT/Claude UI
8. **Mobile App**: Native iOS/Android apps
