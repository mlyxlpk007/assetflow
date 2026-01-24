# 多语言更新指南

## 已完成的工作

1. ✅ 创建了多语言系统（i18n）
   - `src/i18n/I18nContext.jsx` - 多语言上下文
   - `src/i18n/locales/zh-CN.js` - 中文翻译
   - `src/i18n/locales/en-US.js` - 英文翻译

2. ✅ 更新了 App.jsx
   - 添加了 I18nProvider 包装器

3. ✅ 更新了 Sidebar.jsx
   - 添加了语言切换功能（中/英）
   - 所有导航菜单项已国际化

4. ✅ 更新了 Quotes.jsx
   - 所有文本已国际化

## 如何更新其他页面

### 步骤 1: 导入 useI18n Hook

在每个需要国际化的组件文件顶部添加：

```jsx
import { useI18n } from '@/i18n/I18nContext';
```

### 步骤 2: 在组件中使用 t 函数

```jsx
const YourComponent = () => {
  const { t } = useI18n();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
};
```

### 步骤 3: 替换硬编码文本

将所有硬编码的中文文本替换为 `t('key')` 调用。

例如：
- `'项目管理'` → `t('projects.title')`
- `'保存'` → `t('common.save')`
- `'取消'` → `t('common.cancel')`

### 步骤 4: 添加缺失的翻译键

如果某个文本在语言文件中不存在，需要：

1. 在 `src/i18n/locales/zh-CN.js` 中添加中文翻译
2. 在 `src/i18n/locales/en-US.js` 中添加英文翻译

## 需要更新的页面列表

### 高优先级（主要页面）
- [ ] `src/pages/Dashboard.jsx`
- [ ] `src/pages/Projects.jsx`
- [ ] `src/pages/Tasks.jsx`
- [ ] `src/pages/ProjectDetails.jsx`
- [ ] `src/pages/Users.jsx`
- [ ] `src/pages/HumanResources.jsx`
- [ ] `src/pages/LessonLearned.jsx`
- [ ] `src/pages/AssetManagement.jsx`
- [ ] `src/pages/AssetRegister.jsx`
- [ ] `src/pages/AssetEvolution.jsx`
- [ ] `src/pages/AssetHealthDashboard.jsx`
- [ ] `src/pages/ProjectRisks.jsx`
- [ ] `src/pages/DataManagement.jsx`
- [ ] `src/pages/TestData.jsx`

### 组件
- [ ] `src/components/OrderModal.jsx`
- [ ] `src/components/CompleteTaskModal.jsx`
- [ ] `src/components/TagModal.jsx`
- [ ] `src/components/AssetRelationModal.jsx`
- [ ] `src/components/RiskAlerts.jsx`
- [ ] `src/components/TodayTasks.jsx`
- [ ] `src/components/ProjectHealth.jsx`
- [ ] `src/components/NotificationCenter.jsx`
- [ ] `src/components/WelcomeMessage.jsx`

## 翻译键命名规范

使用点号分隔的层级结构：

```
{模块}.{功能}.{具体项}
```

例如：
- `common.save` - 通用保存按钮
- `projects.title` - 项目页面标题
- `tasks.createTask` - 创建任务按钮
- `projectDetails.riskManagement` - 项目详情中的风险管理

## 常见翻译键

已在语言文件中定义的常见键：

### 通用 (common.*)
- `common.loading` - 加载中...
- `common.save` - 保存
- `common.cancel` - 取消
- `common.delete` - 删除
- `common.edit` - 编辑
- `common.add` - 添加
- `common.search` - 搜索
- `common.refresh` - 刷新
- `common.confirm` - 确认
- `common.close` - 关闭
- `common.submit` - 提交
- `common.back` - 返回
- `common.yes` - 是
- `common.no` - 否
- `common.ok` - 确定
- `common.unknown` - 未知
- `common.none` - 无
- `common.all` - 全部
- `common.select` - 选择
- `common.create` - 创建
- `common.update` - 更新
- `common.view` - 查看
- `common.complete` - 完成
- `common.pending` - 待处理
- `common.inProgress` - 进行中
- `common.completed` - 已完成
- `common.failed` - 失败
- `common.success` - 成功
- `common.error` - 错误
- `common.warning` - 警告
- `common.info` - 信息

### 导航 (nav.*)
- `nav.dashboard` - 仪表盘
- `nav.projects` - 项目
- `nav.tasks` - 任务
- `nav.humanResources` - 人力
- `nav.users` - 用户
- `nav.lessonLearned` - 经验教训库
- `nav.assetManagement` - 资产管理
- `nav.managementBubbles` - 管理泡泡
- `nav.dataManagement` - 数据管理
- `nav.dataTest` - 数据测试
- `nav.reports` - 报告
- `nav.notifications` - 通知
- `nav.settings` - 设置

## 示例：更新 Dashboard.jsx

```jsx
// 1. 导入
import { useI18n } from '@/i18n/I18nContext';

// 2. 在组件中使用
const Dashboard = () => {
  const { t } = useI18n();
  
  // 3. 替换文本
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome')}</p>
      <button>{t('dashboard.createProject')}</button>
    </div>
  );
};
```

## 注意事项

1. **保持键的一致性**：确保同一个概念在所有地方使用相同的键
2. **参数化翻译**：对于包含变量的文本，使用 `{variable}` 占位符
3. **测试两种语言**：更新后测试中英文切换是否正常工作
4. **保存语言偏好**：语言选择会自动保存到 localStorage

## 语言切换功能

用户可以通过 Sidebar 中的语言切换按钮（中/EN）来切换语言。语言偏好会自动保存，下次打开应用时会记住用户的选择。
