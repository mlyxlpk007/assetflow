# 快速开始指南

## 第一步：构建前端应用

在项目根目录运行：

**Windows (PowerShell):**
```powershell
.\build-and-copy.ps1
```

**Linux/Mac:**
```bash
chmod +x build-and-copy.sh
./build-and-copy.sh
```

**或者手动执行：**
```bash
npm install
npm run build
# 然后将 dist 目录中的所有文件复制到 RDTrackingSystem/wwwroot/
```

## 第二步：运行 C# 应用

**使用 .NET CLI:**
```bash
cd RDTrackingSystem
dotnet run
```

**使用 Visual Studio:**
1. 打开 `RDTrackingSystem/RDTrackingSystem.csproj`
2. 按 F5 运行

## 注意事项

1. **首次运行**：应用会自动创建 SQLite 数据库并初始化示例数据
2. **端口占用**：确保端口 5000 未被占用
3. **WebView2**：需要安装 WebView2 Runtime（Windows 10/11 通常已预装）

## 数据库位置

数据库文件：`RDTrackingSystem/Data/rdtracking.db`

如需重置数据库，删除此文件后重新运行应用即可。

## 故障排除

### WebView2 未安装
- 下载并安装 [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)

### 端口 5000 被占用
- 修改 `RDTrackingSystem/Services/ApiServer.cs` 中的 `_port` 变量

### 前端页面无法加载
- 确保 `wwwroot` 目录中有 `index.html` 文件
- 检查前端构建是否成功
