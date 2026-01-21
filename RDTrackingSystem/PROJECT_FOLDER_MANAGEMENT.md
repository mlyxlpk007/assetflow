# 项目文件夹自动管理功能说明

## 功能概述

根据《研发文件与软件资产管理实践指南》，系统在创建新项目时会自动创建标准化的项目文件夹结构，确保项目文件管理规范有序。

## 主要特性

1. **自动创建文件夹结构**：新建项目时自动创建标准化的文件夹结构
2. **配置化管理**：项目根目录可在配置文件中设置
3. **智能命名**：根据订单号或项目名称自动生成文件夹名称
4. **路径存储**：项目本地路径自动保存到数据库
5. **快速访问**：支持在文件管理器中快速打开项目文件夹

## 文件夹结构

系统会自动创建以下标准文件夹结构：

### 文档目录
- `01_需求文档` - 客户需求、需求分析等文档
- `02_设计文档` - 设计方案、设计图纸等
- `03_测试文档` - 测试计划、测试报告等
- `04_用户手册` - 用户使用手册、操作指南等
- `05_技术文档` - 技术规范、API文档等
- `06_会议记录` - 项目会议记录、讨论纪要等
- `07_变更记录` - 需求变更、设计变更等记录

### 研发目录
- `10_源代码` - 项目源代码文件
- `11_硬件设计` - 硬件原理图、PCB设计等
- `12_软件设计` - 软件架构、模块设计等
- `13_系统设计` - 系统架构、接口设计等
- `14_结构设计` - 结构图纸、3D模型等

### 资源目录
- `20_图片资源` - 项目相关图片、图标等
- `21_配置文件` - 配置文件、参数设置等
- `22_第三方库` - 第三方库文件、依赖包等
- `23_工具脚本` - 工具脚本、自动化脚本等

### 版本管理
- `30_版本发布` - 发布版本、安装包等
- `31_备份归档` - 备份文件、归档文件等

### 生产相关
- `40_生产文件` - 生产相关文件
- `41_BOM清单` - 物料清单、采购清单等
- `42_工艺文件` - 生产工艺、工艺流程等
- `43_质检文件` - 质检报告、检验记录等

### 其他
- `50_临时文件` - 临时文件、草稿等
- `51_参考资料` - 参考资料、学习资料等

## 配置说明

### 配置文件位置
配置文件位于程序运行目录下的 `config.ini`

### 项目根目录配置
在 `config.ini` 文件中添加或修改以下配置：

```ini
[Projects]
; 项目根目录路径（可以是相对路径或绝对路径）
; 相对路径相对于程序运行目录
; 新建项目时会在此目录下自动创建项目文件夹
RootPath=C:\Projects
```

### 默认路径
如果不配置，默认使用：
```
%USERPROFILE%\Documents\RDTrackingSystem\Projects
```

## 使用方法

### 1. 创建新项目
创建新项目时，系统会自动：
- 在项目根目录下创建项目文件夹
- 文件夹名称优先使用订单号，如果没有则使用项目名称
- 如果文件夹已存在，会自动添加序号后缀（如：`项目名_1`）
- 创建所有标准子文件夹
- 生成 `README.txt` 说明文件
- 将项目路径保存到数据库的 `LocalPath` 字段

### 2. 查看项目路径
项目创建后，可以在项目详情中查看 `localPath` 字段获取项目文件夹路径。

### 3. 打开项目文件夹
可以通过以下方式打开项目文件夹：
- 在项目详情页面点击"打开文件夹"按钮（如果前端实现了）
- 使用 API 调用 `OpenProjectFolder` 方法
- 直接访问 `localPath` 字段中的路径

## API 接口

### WebViewBridge 方法

#### GetProjectsRootPath
获取项目根目录路径
```csharp
public string GetProjectsRootPath()
```

#### SetProjectsRootPath
设置项目根目录路径
```csharp
public string SetProjectsRootPath(string pathJson)
```

#### OpenProjectFolder
打开项目文件夹
```csharp
public string OpenProjectFolder(string projectPathJson)
```

### HTTP API 接口（如果实现）

#### GET /api/projects/folder/root
获取项目根目录路径

#### POST /api/projects/folder/root
设置项目根目录路径
```json
{
  "path": "C:\\Projects"
}
```

#### POST /api/projects/folder/open
打开项目文件夹
```json
{
  "projectPath": "C:\\Projects\\项目名"
}
```

## 前端使用示例

### JavaScript/TypeScript

```javascript
import { projectFolderApi } from '@/lib/api';

// 获取项目根目录
const rootPath = await projectFolderApi.getRootPath();
console.log('项目根目录:', rootPath.rootPath);

// 设置项目根目录
await projectFolderApi.setRootPath('C:\\Projects');

// 打开项目文件夹
await projectFolderApi.openFolder(project.localPath);
```

## 数据库变更

### 新增字段
`Projects` 表新增 `LocalPath` 字段：
- 类型：`TEXT` (SQLite) / `NVARCHAR(500)` (SQL Server)
- 允许空值：是
- 说明：存储项目文件夹的完整路径

### 迁移说明
详细迁移说明请参考 `DATABASE_MIGRATION_LOCALPATH.md`

## 注意事项

1. **权限要求**：确保程序对项目根目录有读写权限
2. **路径长度**：Windows 路径最大长度为 260 字符，文件夹名称会自动限制在 100 字符以内
3. **非法字符**：文件夹名称中的非法字符会自动替换为下划线
4. **已存在文件夹**：如果项目文件夹已存在，会自动添加序号后缀
5. **文件夹创建失败**：如果文件夹创建失败，不会阻止项目记录的创建，但 `LocalPath` 字段将为 `NULL`

## 最佳实践

1. **统一管理**：建议将所有项目放在统一的根目录下
2. **定期备份**：定期备份项目根目录
3. **权限管理**：确保项目文件夹有适当的访问权限
4. **文件组织**：按照文件夹结构存放文件，保持项目文件结构清晰
5. **版本控制**：建议在 `10_源代码` 目录下使用版本控制系统（如 Git）

## 故障排除

### 文件夹创建失败
1. 检查项目根目录是否存在且有写入权限
2. 检查磁盘空间是否充足
3. 查看日志文件了解详细错误信息

### 路径显示为 NULL
1. 检查项目创建时是否有错误日志
2. 确认项目根目录配置正确
3. 尝试手动设置项目路径

### 无法打开文件夹
1. 确认路径是否存在
2. 检查路径格式是否正确
3. 确认有访问该路径的权限

## 相关文件

- `RDTrackingSystem/Services/ProjectFolderService.cs` - 项目文件夹管理服务
- `RDTrackingSystem/Models/Project.cs` - Project 模型（包含 LocalPath 字段）
- `RDTrackingSystem/Controllers/ProjectsController.cs` - 项目控制器（集成文件夹创建）
- `RDTrackingSystem/Data/ConfigManager.cs` - 配置管理器
- `RDTrackingSystem/DATABASE_MIGRATION_LOCALPATH.md` - 数据库迁移说明
