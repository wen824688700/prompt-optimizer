# Requirements Document

## Introduction

Prompt Optimizer MVP 是一个基于 57 个经过验证的 Prompt 工程框架的智能提示词优化工具。系统通过分析用户输入，自动匹配最合适的框架，并通过交互式追问生成高质量的优化提示词。

## Glossary

- **System**: Prompt Optimizer MVP Web 应用
- **User**: 使用系统优化提示词的用户
- **Framework**: 57 个 Prompt 工程框架中的一个（如 RACEF、Chain of Thought 等）
- **Framework_Mapper**: 框架映射表，使用 Frameworks_Summary.md 中的完整表格
- **Clarification_Questions**: 标准追问问题，包括目标清晰度、目标受众、上下文完整性、格式要求、约束条件（来自 SKILL.md Step 4）
- **Deep_Analysis_Mode**: 付费用户专属的深度分析模式，使用详细的框架映射表（方案 B）
- **LLM_Service**: 大语言模型服务（初期为 DeepSeek）
- **Workspace**: 用户的工作台页面，包含左侧编辑区和右侧版本管理区
- **Version**: 提示词的一个保存版本，支持查看和回滚
- **Free_User**: 免费用户，每日 5 次优化配额
- **Pro_User**: 付费用户（$19/月），每日 100 次优化配额
- **UTC_Quota**: 按 UTC 时区计算的每日配额

## Requirements

### Requirement 1: 响应式设计与极简界面

**User Story:** 作为用户，我想在不同设备上都能流畅使用系统，并享受简洁直观的界面体验，以便提高工作效率。

#### Acceptance Criteria

1. WHEN 用户在桌面浏览器访问 THEN THE System SHALL 以全宽布局展示界面
2. WHEN 用户在移动设备访问 THEN THE System SHALL 自动切换到单列布局
3. WHEN 页面加载时 THEN THE System SHALL 在 2 秒内完成首屏渲染
4. WHEN 用户交互时 THEN THE System SHALL 在 100ms 内响应用户操作
5. WHEN 界面展示时 THEN THE System SHALL 使用 Tailwind CSS 实现极简风格
6. WHEN 首页展示时 THEN THE System SHALL 仅包含输入框、模型选择、上传按钮和优化按钮
7. WHEN 工作台展示时 THEN THE System SHALL 以 5:5 比例展示左右分栏布局

### Requirement 2: 模型选择与附件上传

**User Story:** 作为用户，我想在首页选择不同的 LLM 模型并上传附件作为参考，以便根据不同场景获得更好的优化效果。

#### Acceptance Criteria

1. WHEN 用户在首页输入框上方 THEN THE System SHALL 显示模型选择下拉菜单
2. WHEN 模型选择菜单展开 THEN THE System SHALL 显示可用的 LLM 模型列表（初期仅 DeepSeek）
3. WHEN 用户选择模型 THEN THE System SHALL 保存选择并在后续生成中使用该模型
4. WHEN 用户点击"上传附件"按钮 THEN THE System SHALL 打开文件选择对话框
5. WHEN 用户选择文件 THEN THE System SHALL 验证文件类型（支持 .txt, .md, .pdf）和大小（最大 5MB）
6. WHEN 文件验证通过 THEN THE System SHALL 显示文件名和删除按钮
7. WHEN 生成提示词时 THEN THE System SHALL 将附件内容作为额外上下文传递给 LLM_Service
8. WHEN 系统初始化时 THEN THE System SHALL 配置 DeepSeek API 密钥和端点

### Requirement 3: 用户输入与框架匹配

**User Story:** 作为用户，我想输入一个原始提示词或需求描述，系统能自动为我匹配最合适的 Prompt 框架，以便我获得专业的优化建议。

#### Acceptance Criteria

1. WHEN 用户在首页输入框中输入原始提示词或需求描述 THEN THE System SHALL 接受至少 10 个字符的输入
2. WHEN 用户点击"优化"按钮 THEN THE System SHALL 调用 LLM_Service 并传入 Frameworks_Summary.md 表格进行意图分析
3. WHEN Free_User 使用系统 THEN THE System SHALL 使用方案 C（Frameworks_Summary.md 表格）进行框架匹配
4. WHEN Pro_User 选择深度分析模式 THEN THE System SHALL 使用方案 B（详细框架映射表）进行更精准的匹配
5. WHEN LLM_Service 完成分析 THEN THE System SHALL 返回 1-3 个推荐的 Framework 候选
6. WHEN 推荐框架数量为 1 THEN THE System SHALL 直接展示标准 Clarification_Questions
7. WHEN 推荐框架数量大于 1 THEN THE System SHALL 在弹窗中展示所有候选框架供用户选择

### Requirement 4: 交互式追问与选项确认

**User Story:** 作为用户，我想通过回答系统的追问问题来提供更多上下文信息，以便生成更精准的优化提示词。

#### Acceptance Criteria

1. WHEN 用户选择或系统确定一个 Framework THEN THE System SHALL 展示标准 Clarification_Questions 弹窗
2. WHEN 弹窗展示时 THEN THE System SHALL 包含以下 5 个标准追问选项：
   - 目标清晰度（Goal Clarity）：期望的结果是什么？
   - 目标受众（Target Audience）：谁会接收 AI 的回复？
   - 上下文完整性（Context Completeness）：是否提供了足够的背景信息？
   - 格式要求（Format Requirements）：是否有特定的输出格式需求？
   - 约束条件（Constraints）：是否有任何限制或约束？
3. WHEN 追问选项为必填项 THEN THE System SHALL 标记为必填并在提交时验证
4. WHEN 追问选项为可选项 THEN THE System SHALL 允许用户跳过
5. WHEN 用户填写完追问选项并点击"生成" THEN THE System SHALL 关闭弹窗并显示进度条
6. WHEN 用户点击弹窗的"取消"按钮 THEN THE System SHALL 关闭弹窗并返回首页输入状态

### Requirement 5: 提示词生成与展示

**User Story:** 作为用户，我想看到系统生成的优化提示词，并能够复制使用或继续编辑，以便我能快速应用到实际工作中。

#### Acceptance Criteria

1. WHEN 用户提交追问选项 THEN THE System SHALL 调用 LLM_Service 并传入完整的 Framework 文档和用户答案
2. WHEN LLM_Service 生成提示词时 THEN THE System SHALL 显示进度条和生成状态
3. WHEN 生成完成 THEN THE System SHALL 跳转到 Workspace 页面
4. WHEN 进入 Workspace THEN THE System SHALL 以 5:5 比例展示左右分栏布局
5. WHEN 右侧展示区加载时 THEN THE System SHALL 显示两个选项卡：Markdown 原文展示和版本记录
6. WHEN Markdown 原文选项卡激活时 THEN THE System SHALL 展示生成的 Markdown 格式提示词
7. WHEN 提示词展示时 THEN THE System SHALL 提供"复制"、"修改"、"保存"三个按钮
8. WHEN 用户点击"复制"按钮 THEN THE System SHALL 复制 Markdown 原文到剪贴板并显示"已复制"提示 2 秒
9. WHEN 用户点击"修改"按钮 THEN THE System SHALL 将右侧 Markdown 原文覆盖到左侧输入框
10. WHEN 修改操作完成 THEN THE System SHALL 在左侧显示灰字提示："已将优化后的 Prompt 放入左侧，你可以直接编辑，或在末尾追加修改要求。"
11. WHEN 用户点击"保存"按钮 THEN THE System SHALL 将当前输出写入版本记录并切换到版本记录选项卡

### Requirement 6: 迭代优化与版本管理

**User Story:** 作为用户，我想在工作台中继续编辑需求或追加修改要求，并保存多个版本，以便我能迭代改进提示词并随时回滚到之前的版本。

#### Acceptance Criteria

1. WHEN 用户在 Workspace 左侧编辑区修改需求 THEN THE System SHALL 实时保存草稿到本地存储
2. WHEN 用户点击"重新生成"按钮 THEN THE System SHALL 使用修改后的需求调用 LLM_Service
3. WHEN 生成新版本提示词 THEN THE System SHALL 自动保存为新的 Version 并标记 UTC 时间戳
4. WHEN 版本记录选项卡激活时 THEN THE System SHALL 按时间倒序展示版本列表
5. WHEN 版本标题展示时 THEN THE System SHALL 使用格式："YYYY-MM-DD HH:mm:ss · 保存"或"YYYY-MM-DD HH:mm:ss · 优化"
6. WHEN 用户点击版本列表中的某个 Version THEN THE System SHALL 在右侧 Markdown 原文选项卡展示该版本内容
7. WHEN 用户点击"回滚到此版本"按钮 THEN THE System SHALL 将该版本的输出覆盖当前工作区输出
8. WHEN 版本数量超过 10 个 THEN THE System SHALL 仅保留最近 10 个版本
9. WHEN 用户点击"保存当前版本" THEN THE System SHALL 将当前提示词保存到数据库（需登录）

### Requirement 7: 用户认证与权限控制

**User Story:** 作为系统管理员，我想要求用户必须通过 Google 登录后才能提交生成请求，以便控制配额和防止滥用。

#### Acceptance Criteria

1. WHEN 未登录用户访问首页 THEN THE System SHALL 允许输入和预览选项弹窗
2. WHEN 未登录用户点击"生成"按钮 THEN THE System SHALL 显示登录提示并跳转到 Google 登录页面
3. WHEN 用户完成 Google 登录 THEN THE System SHALL 通过 Supabase Auth 验证身份并创建会话
4. WHEN 登录成功 THEN THE System SHALL 返回到之前的操作页面并允许提交生成请求
5. WHEN 用户已登录 THEN THE System SHALL 在页面右上角显示用户头像和账户类型（Free/Pro）

### Requirement 8: 配额管理与限制

**User Story:** 作为系统管理员，我想按 UTC 时区统计每日配额使用情况，并对 Free 和 Pro 用户实施不同的限制，以便控制成本和鼓励付费订阅。

#### Acceptance Criteria

1. WHEN Free_User 提交生成请求 THEN THE System SHALL 检查当日（UTC）已使用配额
2. WHEN Free_User 当日配额小于 5 次 THEN THE System SHALL 允许生成并增加配额计数
3. WHEN Free_User 当日配额已达到 5 次 THEN THE System SHALL 拒绝请求并提示升级到 Pro
4. WHEN Pro_User 提交生成请求 THEN THE System SHALL 检查当日（UTC）已使用配额是否小于 100
5. WHEN Pro_User 当日配额已用完 THEN THE System SHALL 拒绝请求并提示明日（UTC）重置
6. WHEN 每日 UTC 00:00 THEN THE System SHALL 重置所有用户的配额计数器
7. WHEN 用户查看账户页面 THEN THE System SHALL 显示当日剩余配额和下次重置时间（UTC）

### Requirement 9: Creem 付费订阅集成

**User Story:** 作为用户，我想通过 Creem 订阅 Pro 计划（$19/月），以便获得每日 100 次的优化配额和深度分析模式。

#### Acceptance Criteria

1. WHEN Free_User 点击"升级到 Pro"按钮 THEN THE System SHALL 跳转到 Creem 支付页面
2. WHEN 用户在 Creem 完成支付 THEN THE System SHALL 通过 Webhook 接收订阅确认
3. WHEN 订阅确认成功 THEN THE System SHALL 更新用户账户类型为 Pro_User 并解锁深度分析模式
4. WHEN Pro_User 订阅到期 THEN THE System SHALL 自动降级为 Free_User
5. WHEN Pro_User 取消订阅 THEN THE System SHALL 在当前计费周期结束后降级为 Free_User
6. WHEN 用户查看账户页面 THEN THE System SHALL 显示订阅状态、下次扣费日期和取消订阅选项

### Requirement 10: 错误处理与用户反馈

**User Story:** 作为用户，我想在系统出现错误时看到清晰的提示信息，以便我知道如何解决问题或重试操作。

#### Acceptance Criteria

1. WHEN LLM_Service 调用失败 THEN THE System SHALL 显示错误提示并提供"重试"按钮
2. WHEN 网络连接中断 THEN THE System SHALL 显示"网络错误"提示并自动重试 3 次
3. WHEN 用户输入不符合要求 THEN THE System SHALL 在输入框下方显示验证错误信息
4. WHEN 文件上传失败 THEN THE System SHALL 显示具体的失败原因（如文件过大、格式不支持）
5. WHEN 配额不足时 THEN THE System SHALL 显示友好的提示并引导用户升级或等待重置
6. WHEN 系统维护时 THEN THE System SHALL 显示维护公告页面并预计恢复时间


### Requirement 11: 部署与发布流程

**User Story:** 作为开发者，我想将系统部署到 Vercel 并绑定自定义域名，以便用户可以通过我的域名访问系统。

#### Acceptance Criteria

1. WHEN 代码推送到 GitHub main 分支 THEN THE System SHALL 自动触发 Vercel 部署流程
2. WHEN Vercel 部署完成 THEN THE System SHALL 在自定义域名上可访问
3. WHEN 前端部署时 THEN THE System SHALL 使用环境变量配置 API 端点和 Supabase 连接
4. WHEN 后端部署时 THEN THE System SHALL 使用环境变量配置数据库连接、DeepSeek API 和 Creem API
5. WHEN 数据库 Schema 更新时 THEN THE System SHALL 通过 Alembic 迁移脚本应用更改
6. WHEN 部署失败时 THEN THE System SHALL 发送通知并保持上一个稳定版本运行
7. WHEN 自定义域名配置时 THEN THE System SHALL 自动配置 SSL 证书（Let's Encrypt）
8. WHEN 生产环境运行时 THEN THE System SHALL 启用错误监控（Sentry）和性能监控（Vercel Analytics）
