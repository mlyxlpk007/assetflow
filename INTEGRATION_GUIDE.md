# C# WinForms + Web 集成指南

## 项目概述

本项目将原有的 React Web 应用集成到 C# WinForms 应用程序中，使用 WebView2 显示 Web UI，C# 作为后端提供 RESTful API，SQLite 作为数据存储。

## 架构设计

```
┌─────────────────────────────────────┐
│      C# WinForms Application        │
│  ┌───────────────────────────────┐  │
│  │      WebView2 Control         │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   React Web App (UI)    │  │  │
│  │  │   - Dashboard           │  │  │
│  │  │   - Projects            │  │  │
│  │  │   - Tasks               │  │  │
│  │  │   - Users               │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   ASP.NET Core Web API       │  │
│  │   - ProjectsController       │  │
│  │   - TasksController          │  │
│  │   - UsersController          │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Entity Framework Core       │  │
│  │   + SQLite Database           │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 数据流

1. **前端请求**：React 应用通过 `src/lib/api.js` 发送 HTTP 请求
2. **API 处理**：ASP.NET Core 控制器接收请求
3. **数据访问**：Entity Framework Core 操作 SQLite 数据库
4. **响应返回**：JSON 数据返回给前端
5. **UI 更新**：React 组件更新显示

## 关键文件说明

### C# 后端文件

- `RDTrackingSystem/Program.cs` - 应用程序入口点
- `RDTrackingSystem/MainForm.cs` - WinForms 主窗体，包含 WebView2
- `RDTrackingSystem/Services/ApiServer.cs` - 内嵌的 Web API 服务器
- `RDTrackingSystem/Controllers/*.cs` - API 控制器
- `RDTrackingSystem/Models/*.cs` - 数据模型
- `RDTrackingSystem/Data/ApplicationDbContext.cs` - EF Core 上下文

### 前端文件

- `src/lib/api.js` - API 客户端封装（新增）
- `src/pages/*.jsx` - 页面组件（已修改为使用 API）
- `src/hooks/useDataInitializer.js` - 数据初始化（已简化）

## 数据迁移说明

### 从 LocalStorage 到 SQLite

**原实现：**
```javascript
// 读取
const data = JSON.parse(localStorage.getItem('rd_projects'));

// 保存
localStorage.setItem('rd_projects', JSON.stringify(data));
```

**新实现：**
```javascript
// 读取
const data = await projectsApi.getAll();

// 保存
await projectsApi.create(projectData);
```

### 数据模型映射

| 前端字段 | 数据库字段 | 说明 |
|---------|-----------|------|
| `id` | `Id` | 唯一标识符 |
| `orderNumber` | `OrderNumber` | 订单编号 |
| `projectName` | `ProjectName` | 项目名称 |
| `timeline` | `TimelineJson` | JSON 字符串存储 |
| `assignedTo` | `AssignedToJson` | JSON 字符串存储 |

## API 端点

### 项目 API
- `GET /api/projects` - 获取所有项目
- `GET /api/projects/{id}` - 获取单个项目
- `POST /api/projects` - 创建项目
- `PUT /api/projects/{id}` - 更新项目
- `DELETE /api/projects/{id}` - 删除项目

### 用户 API
- `GET /api/users` - 获取所有用户
- `POST /api/users` - 创建用户
- `PUT /api/users/{id}` - 更新用户
- `DELETE /api/users/{id}` - 删除用户

### 任务 API
- `GET /api/tasks` - 获取所有任务
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/{id}` - 更新任务
- `DELETE /api/tasks/{id}` - 删除任务

## 构建和部署

### 开发环境

1. **前端开发**
   ```bash
   npm run dev  # 开发模式（使用 Vite 开发服务器）
   ```

2. **后端开发**
   ```bash
   cd RDTrackingSystem
   dotnet watch run  # 热重载模式
   ```

### 生产构建

1. **构建前端**
   ```bash
   npm run build
   ```

2. **复制文件**
   ```bash
   # Windows
   .\build-and-copy.ps1
   
   # Linux/Mac
   ./build-and-copy.sh
   ```

3. **构建 C# 应用**
   ```bash
   cd RDTrackingSystem
   dotnet publish -c Release
   ```

## 数据库管理

### 初始化
首次运行会自动创建数据库和表结构。

### 重置数据库
删除 `RDTrackingSystem/Data/rdtracking.db` 文件，重新运行应用。

### 查看数据库
可以使用 SQLite 工具（如 DB Browser for SQLite）打开数据库文件。

## 常见问题

### Q: WebView2 无法加载页面？
A: 确保：
1. WebView2 Runtime 已安装
2. `wwwroot` 目录存在且包含 `index.html`
3. API 服务器已启动（端口 5000）

### Q: API 请求失败？
A: 检查：
1. API 服务器是否正常运行
2. 端口 5000 是否被占用
3. CORS 配置是否正确

### Q: 数据库操作失败？
A: 检查：
1. 数据库文件权限
2. 数据库文件是否被其他进程占用
3. 数据库目录是否存在

## 未来改进

- [ ] 添加用户认证和授权
- [ ] 实现文件上传功能
- [ ] 添加数据导出功能
- [ ] 实现实时通知
- [ ] 添加数据备份和恢复
- [ ] 性能优化和缓存
