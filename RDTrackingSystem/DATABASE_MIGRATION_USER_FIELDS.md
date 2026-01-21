# 数据库迁移说明 - 添加用户技能和能力字段

## 概述
本次更新为 `Users` 表添加了人员技能和能力相关字段，用于存储工程师的技能标签、并行任务上限、可用率以及各种时间占比信息。

## 新增字段

### 1. SkillTags (技能标签)
- **字段名**: `SkillTags`
- **类型**: `TEXT` (SQLite)
- **允许空值**: 是 (NULL)
- **说明**: JSON格式存储技能标签数组，例如：`["硬件设计","嵌入式开发","PCB设计"]`
- **默认值**: NULL

### 2. MaxConcurrentTasks (并行任务上限)
- **字段名**: `MaxConcurrentTasks`
- **类型**: `INTEGER` (SQLite)
- **允许空值**: 否
- **说明**: 该人员可同时处理的最大任务数量
- **默认值**: 5

### 3. AvailabilityRate (可用率)
- **字段名**: `AvailabilityRate`
- **类型**: `REAL` (SQLite) / `FLOAT` (SQL Server)
- **允许空值**: 否
- **说明**: 可用率，范围 0.0-1.0，表示该人员可用于工作的比例
- **默认值**: 1.0 (100%)

### 4. LeavePercentage (请假占比)
- **字段名**: `LeavePercentage`
- **类型**: `REAL` (SQLite) / `FLOAT` (SQL Server)
- **允许空值**: 否
- **说明**: 请假时间占比，范围 0.0-1.0
- **默认值**: 0.0 (0%)

### 5. MeetingPercentage (会议占比)
- **字段名**: `MeetingPercentage`
- **类型**: `REAL` (SQLite) / `FLOAT` (SQL Server)
- **允许空值**: 否
- **说明**: 会议时间占比，范围 0.0-1.0
- **默认值**: 0.1 (10%)

### 6. SupportWorkPercentage (支撑性工作占比)
- **字段名**: `SupportWorkPercentage`
- **类型**: `REAL` (SQLite) / `FLOAT` (SQL Server)
- **允许空值**: 否
- **说明**: 支撑性工作时间占比，范围 0.0-1.0
- **默认值**: 0.1 (10%)

## 自动迁移
如果使用 Entity Framework Core 的自动迁移功能，程序启动时会自动检测并应用此更改。

## 手动迁移（SQLite）

如果数据库已存在且需要手动添加字段，可以执行以下 SQL：

```sql
-- 添加技能标签字段
ALTER TABLE Users ADD COLUMN SkillTags TEXT;

-- 添加并行任务上限字段
ALTER TABLE Users ADD COLUMN MaxConcurrentTasks INTEGER DEFAULT 5;

-- 添加可用率字段
ALTER TABLE Users ADD COLUMN AvailabilityRate REAL DEFAULT 1.0;

-- 添加请假占比字段
ALTER TABLE Users ADD COLUMN LeavePercentage REAL DEFAULT 0.0;

-- 添加会议占比字段
ALTER TABLE Users ADD COLUMN MeetingPercentage REAL DEFAULT 0.1;

-- 添加支撑性工作占比字段
ALTER TABLE Users ADD COLUMN SupportWorkPercentage REAL DEFAULT 0.1;
```

## 验证迁移

迁移完成后，可以通过以下方式验证：

1. **使用 SQLite 命令行工具**:
   ```bash
   sqlite3 rdtracking_v2.db
   .schema Users
   ```

2. **查看表结构**:
   应该能看到所有新字段已添加到表中。

## 注意事项

1. **现有数据**: 
   - 现有用户的 `SkillTags` 字段将为 `NULL`
   - 其他字段将使用默认值（并行任务上限=5，可用率=1.0，请假占比=0.0，会议占比=0.1，支撑性工作占比=0.1）

2. **技能标签格式**: 
   - 前端输入时使用逗号分隔的字符串（如："硬件设计, 嵌入式开发"）
   - 存储时自动转换为JSON数组格式（如：`["硬件设计","嵌入式开发"]`）
   - 读取时自动解析为数组

3. **百分比字段**: 
   - 数据库存储为 0.0-1.0 的小数（如：0.1 表示 10%）
   - 前端显示时转换为百分比（如：10%）
   - 前端输入时接受百分比值（如：10），自动转换为小数存储

4. **向后兼容**: 
   - 所有新字段都有默认值，不影响现有功能的正常使用
   - 如果字段不存在，程序会使用默认值

## 相关文件

- `RDTrackingSystem/Models/User.cs` - User 模型定义
- `RDTrackingSystem/Models/DTOs/UserDto.cs` - UserDto 定义
- `RDTrackingSystem/Data/ApplicationDbContext.cs` - 数据库上下文配置
- `RDTrackingSystem/Services/WebViewBridge.cs` - WebViewBridge 方法（CreateUser, UpdateUser, GetUsers）
- `src/pages/Users.jsx` - 用户管理页面（添加/编辑用户表单）
- `src/pages/HumanResources.jsx` - 人力资源页面（显示工程师详细信息）
