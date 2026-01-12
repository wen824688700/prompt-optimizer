# 测试文件说明

## 📁 目录结构

```
backend/tests/
├── unit/                           # 单元测试
│   ├── test_email_auth.py         # 邮箱认证测试
│   ├── test_resend_email.py       # Resend 邮件发送测试
│   ├── test_frontend_api.py       # 前端 API 测试
│   ├── test_full_workflow.py      # 完整工作流测试
│   ├── test_topic_generation.py   # 主题生成测试
│   ├── test_topic_label.py        # 主题标签测试
│   └── test_health.py             # 健康检查测试
├── property/                       # 属性测试（Hypothesis）
└── cleanup_test_data.py           # 清理测试数据工具
```

---

## 🧪 运行测试

### 运行所有测试
```bash
cd backend
pytest
```

### 运行单元测试
```bash
pytest tests/unit
```

### 运行属性测试
```bash
pytest tests/property
```

### 运行特定测试文件
```bash
# 邮箱认证测试
python tests/unit/test_email_auth.py

# Resend 邮件发送测试
python tests/unit/test_resend_email.py

# 前端 API 测试
python tests/unit/test_frontend_api.py
```

---

## 📝 测试文件说明

### unit/test_email_auth.py
**功能**: 测试邮箱验证码认证服务

**测试内容**:
- 发送验证码
- 验证码注册
- 邮箱登录
- 用户名登录
- 错误处理
- 重置密码
- 用户名可用性检查

**运行方式**:
```bash
python tests/unit/test_email_auth.py
```

**环境**: 开发模式（使用固定验证码 123456）

---

### unit/test_resend_email.py
**功能**: 测试 Resend 邮件发送功能

**测试内容**:
- 发送真实验证码邮件到指定邮箱

**运行方式**:
```bash
python tests/unit/test_resend_email.py
```

**环境**: 生产模式（发送真实邮件）

**注意**: 需要配置 `RESEND_API_KEY` 环境变量

---

### unit/test_frontend_api.py
**功能**: 测试前端 API 端点

**测试内容**:
- 框架匹配 API
- 提示词生成 API
- 版本管理 API
- 配额管理 API

**运行方式**:
```bash
python tests/unit/test_frontend_api.py
```

---

### unit/test_full_workflow.py
**功能**: 测试完整的用户工作流

**测试内容**:
- 用户输入 → 框架匹配 → 生成提示词 → 保存版本

**运行方式**:
```bash
python tests/unit/test_full_workflow.py
```

---

### unit/test_topic_generation.py
**功能**: 测试主题生成功能

**测试内容**:
- 从提示词内容生成主题标签

**运行方式**:
```bash
python tests/unit/test_topic_generation.py
```

---

### unit/test_topic_label.py
**功能**: 测试主题标签功能

**测试内容**:
- 主题标签的生成和管理

**运行方式**:
```bash
python tests/unit/test_topic_label.py
```

---

### cleanup_test_data.py
**功能**: 清理测试数据

**用途**:
- 清理开发/测试环境中的测试数据
- 重置数据库到干净状态

**运行方式**:
```bash
python tests/cleanup_test_data.py
```

**警告**: 不要在生产环境运行！

---

## 🔧 测试配置

### 环境变量

测试需要以下环境变量（在 `backend/.env` 中配置）:

```bash
# 开发模式（单元测试）
ENVIRONMENT=development

# 生产模式（邮件发送测试）
ENVIRONMENT=production
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev

# 数据库（集成测试）
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-service-role-key
```

### pytest 配置

配置文件: `backend/pytest.ini`

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

---

## 📊 测试覆盖率

查看测试覆盖率:

```bash
pytest --cov=app tests/
```

生成 HTML 报告:

```bash
pytest --cov=app --cov-report=html tests/
```

---

## 🐛 调试测试

### 显示详细输出
```bash
pytest -v tests/unit/test_email_auth.py
```

### 显示打印语句
```bash
pytest -s tests/unit/test_email_auth.py
```

### 只运行失败的测试
```bash
pytest --lf
```

### 进入调试模式
```bash
pytest --pdb
```

---

## ✅ 测试检查清单

运行测试前:
- [ ] 确认环境变量已配置
- [ ] 确认依赖已安装 (`pip install -r requirements.txt`)
- [ ] 确认数据库连接正常（如果需要）

运行测试后:
- [ ] 所有测试通过
- [ ] 无警告信息
- [ ] 测试覆盖率达标

---

## 📚 相关文档

- [pytest 官方文档](https://docs.pytest.org/)
- [Hypothesis 文档](https://hypothesis.readthedocs.io/)
- [测试最佳实践](../docs/TESTING_BEST_PRACTICES.md)

---

**最后更新**: 2026-01-12
