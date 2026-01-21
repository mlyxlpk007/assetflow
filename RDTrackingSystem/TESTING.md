# 测试和验证指南

## 验证直接通信是否工作

### 方法 1: 浏览器控制台检查

1. 运行应用程序
2. 在 WebView2 中按 `F12` 打开开发者工具（如果启用了）
3. 在控制台中输入：

```javascript
// 检查桥接对象是否存在
console.log(window.chrome?.webview?.hostObjects?.nativeBridge);

// 测试调用
window.chrome.webview.hostObjects.nativeBridge.GetProjects().then(result => {
  console.log('Result:', result);
});
```

### 方法 2: 在代码中添加日志

在 `src/lib/api.js` 中，已经包含了自动检测和回退逻辑。查看浏览器控制台：

- 如果看到 "Native bridge initialized successfully" - 直接通信已启用
- 如果看到 "Native bridge not available, will use HTTP API" - 使用 HTTP API

### 方法 3: 性能测试

直接通信模式下的操作应该几乎瞬间完成（<5ms），而 HTTP API 模式会有明显延迟（10-30ms）。

## 常见问题

### Q: 桥接对象未找到？

**可能原因：**
1. WebView2 版本过旧
2. 对象注入时机不对

**解决方案：**
- 确保使用最新版本的 WebView2
- 检查 `MainForm.cs` 中的注入代码是否正确执行

### Q: 方法调用返回 undefined？

**可能原因：**
1. 方法名不匹配
2. 参数格式错误

**解决方案：**
- 检查 C# 方法名是否与 JavaScript 调用一致
- 确保参数已正确序列化为 JSON 字符串

### Q: 如何切换到 HTTP API 模式？

在 `Program.cs` 中修改：
```csharp
var useDirectCommunication = false;
```

## 调试技巧

### 启用开发者工具

在 `MainForm.cs` 中修改：
```csharp
_webView.CoreWebView2!.Settings.AreDevToolsEnabled = true;
```

### 添加详细日志

在 `WebViewBridge.cs` 的方法中添加日志：
```csharp
_logger?.LogInformation($"GetProjects called, returning {projects.Count} projects");
```

### JavaScript 端调试

在 `src/lib/api.js` 中添加：
```javascript
console.log('Using native bridge:', useNativeBridge);
console.log('Method:', method, 'Args:', args);
```
