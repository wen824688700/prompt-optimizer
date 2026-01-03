# Toast 通知位置更新

## 更新日期
2026-01-03

## 更新内容

### 问题描述
用户反馈工作台页面点击"保存"或"复制"按钮时，需要在顶部居中显示小字提示，而不是当前的右下角提示。

### 解决方案

#### 修改内容

在 `frontend/components/MarkdownTab.tsx` 中：

1. **添加保存成功提示状态**
```typescript
const [showSavedToast, setShowSavedToast] = useState(false);
```

2. **更新保存按钮处理函数**
```typescript
const handleSave = () => {
  onSave(content);
  setShowSavedToast(true);
  setTimeout(() => setShowSavedToast(false), 2000);
};
```

3. **修改Toast显示位置**
   - 从右下角 (`fixed bottom-4 right-4`) 改为顶部居中
   - 使用 `fixed top-4 left-1/2 transform -translate-x-1/2` 实现居中
   - 添加 `z-50` 确保在最上层显示

4. **统一Toast样式**
   - 复制成功：顶部居中，绿色背景，2秒后消失
   - 保存成功：顶部居中，绿色背景，2秒后消失

### 视觉效果

#### 修改前
```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
│                                         │
│                              ┌────────┐ │
│                              │ 已复制 │ │
│                              └────────┘ │
└─────────────────────────────────────────┘
```

#### 修改后
```
┌─────────────────────────────────────────┐
│          ┌──────────────┐               │
│          │ ✓ 复制成功   │               │
│          └──────────────┘               │
│                                         │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### Toast 样式详情

```tsx
<div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-50">
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
  <span className="text-sm font-medium">复制成功</span>
</div>
```

**样式说明**：
- `fixed top-4`: 距离顶部 1rem (16px)
- `left-1/2 transform -translate-x-1/2`: 水平居中
- `bg-green-600 text-white`: 绿色背景，白色文字
- `px-6 py-3`: 内边距
- `rounded-lg shadow-lg`: 圆角和阴影
- `animate-fade-in`: 淡入动画（0.3秒）
- `z-50`: 确保在最上层

### 动画效果

使用已定义的 `animate-fade-in` 动画：

```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
```

### 显示时长

- 复制成功：2秒后自动消失
- 保存成功：2秒后自动消失

### 修改的文件

1. ✅ `frontend/components/MarkdownTab.tsx`
   - 添加 `showSavedToast` 状态
   - 更新 `handleSave` 函数
   - 修改Toast显示位置和样式
   - 添加保存成功提示

### 测试步骤

1. 启动前端服务：
```bash
cd frontend
npm run dev
```

2. 访问工作台页面

3. 测试复制功能：
   - 点击"复制"按钮
   - 验证顶部居中显示"✓ 复制成功"
   - 验证2秒后自动消失

4. 测试保存功能：
   - 点击"保存"按钮
   - 验证顶部居中显示"✓ 保存成功"
   - 验证2秒后自动消失

### 预期效果

#### 复制成功
```
┌─────────────────────────────────────────┐
│          ┌──────────────┐               │
│          │ ✓ 复制成功   │  ← 绿色背景   │
│          └──────────────┘               │
│                                         │
│  [复制] [修改] [保存]                   │
│                                         │
│  优化后的提示词内容...                  │
└─────────────────────────────────────────┘
```

#### 保存成功
```
┌─────────────────────────────────────────┐
│          ┌──────────────┐               │
│          │ ✓ 保存成功   │  ← 绿色背景   │
│          └──────────────┘               │
│                                         │
│  [复制] [修改] [保存]                   │
│                                         │
│  优化后的提示词内容...                  │
└─────────────────────────────────────────┘
```

---

## 技术细节

### 居中定位原理

```css
/* 水平居中 */
left: 50%;                    /* 左边缘在50%位置 */
transform: translateX(-50%);  /* 向左移动自身宽度的50% */
```

这样无论Toast的宽度是多少，都能保持居中。

### z-index 层级

```
z-50  ← Toast通知（最上层）
z-40  ← Modal弹窗
z-30  ← Dropdown下拉菜单
z-20  ← Fixed导航栏
z-10  ← Sticky元素
z-0   ← 普通内容
```

### 响应式考虑

Toast在移动端和桌面端都能正常显示：
- 移动端：顶部居中，适当的内边距
- 桌面端：顶部居中，相同的样式

---

## 后续优化建议

1. **Toast队列管理**
   - 如果用户快速点击多次，当前会覆盖显示
   - 可以考虑实现Toast队列，依次显示

2. **统一Toast组件**
   - 创建一个通用的Toast组件
   - 支持不同类型（success, error, info, warning）
   - 统一管理所有Toast通知

3. **可配置的显示时长**
   - 允许不同类型的Toast有不同的显示时长
   - 重要提示可以显示更长时间

4. **手动关闭功能**
   - 添加关闭按钮
   - 允许用户手动关闭Toast

---

## 相关文件

- [MarkdownTab组件](frontend/components/MarkdownTab.tsx)
- [全局样式](frontend/app/globals.css)

---

## 提交信息

```
feat: 更新Toast通知位置为顶部居中

- 将复制/保存成功提示从右下角移至顶部居中
- 添加保存成功提示
- 统一Toast样式和动画效果
- 提升用户体验

相关文件：
- frontend/components/MarkdownTab.tsx
```
