# 数据库迁移说明 - 添加 LocalPath 字段

## 概述
本次更新为 `Projects` 表添加了 `LocalPath` 字段，用于存储项目的本地文件夹路径。

## 字段信息
- **字段名**: `LocalPath`
- **类型**: `TEXT` (SQLite) / `NVARCHAR(500)` (SQL Server)
- **允许空值**: 是 (NULL)
- **说明**: 存储项目文件夹的完整路径

## 自动迁移
如果使用 Entity Framework Core 的自动迁移功能，程序启动时会自动检测并应用此更改。

## 手动迁移（SQLite）

如果数据库已存在且需要手动添加字段，可以执行以下 SQL：

```sql
ALTER TABLE Projects ADD COLUMN LocalPath TEXT;
```

## 验证迁移

迁移完成后，可以通过以下方式验证：

1. **使用 SQLite 命令行工具**:
   ```bash
   sqlite3 rdtracking_v2.db
   .schema Projects
   ```

2. **查看表结构**:
   应该能看到 `LocalPath TEXT` 字段已添加到表中。

## 注意事项

1. **现有数据**: 现有项目的 `LocalPath` 字段将为 `NULL`，这是正常的。
2. **新项目**: 创建新项目时，系统会自动创建项目文件夹并设置 `LocalPath` 字段。
3. **向后兼容**: 此字段为可选字段，不影响现有功能的正常使用。

## 回滚（如果需要）

如果需要回滚此更改，可以执行：

```sql
-- 注意：SQLite 不支持直接删除列，需要重建表
-- 建议先备份数据库
```

## 相关文件

- `RDTrackingSystem/Models/Project.cs` - Project 模型定义
- `RDTrackingSystem/Data/ApplicationDbContext.cs` - 数据库上下文配置
- `RDTrackingSystem/Services/ProjectFolderService.cs` - 项目文件夹管理服务
