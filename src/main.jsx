import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import '@/utils/debug'; // 加载调试工具

console.log('========== 应用启动 ==========');
console.log('当前时间:', new Date().toISOString());
console.log('window.chrome:', window.chrome);
console.log('window.chrome.webview:', window.chrome?.webview);
console.log('window.chrome.webview.hostObjects:', window.chrome?.webview?.hostObjects);
console.log('window.chrome.webview.hostObjects.nativeBridge:', window.chrome?.webview?.hostObjects?.nativeBridge);

// 延迟检查桥接对象（给 WebView2 时间注入）
setTimeout(() => {
  console.log('========== 延迟检查桥接对象 ==========');
  console.log('window.chrome.webview.hostObjects.nativeBridge:', window.chrome?.webview?.hostObjects?.nativeBridge);
  
  // 添加全局测试函数
  window.testGetUsers = async () => {
    const bridge = window.chrome?.webview?.hostObjects?.nativeBridge;
    if (!bridge) {
      console.error('桥接对象不存在');
      return null;
    }
    try {
      console.log('========== 测试GetUsers() ==========');
      const result = await bridge.GetUsers();
      console.log('GetUsers() 返回结果类型:', typeof result);
      console.log('GetUsers() 返回结果:', result);
      if (typeof result === 'string') {
        try {
          const parsed = JSON.parse(result);
          console.log('GetUsers() JSON解析成功:', parsed);
          console.log('用户数量:', Array.isArray(parsed) ? parsed.length : 'N/A');
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('第一个用户:', parsed[0]);
          }
          return parsed;
        } catch (e) {
          console.error('GetUsers() JSON解析失败:', e);
          return null;
        }
      }
      return result;
    } catch (error) {
      console.error('GetUsers() 调用失败:', error);
      return null;
    }
  };
  
  console.log('✅ 全局测试函数已添加: window.testGetUsers()');
  
  if (window.debug) {
    window.debug.checkBridge();
  }
}, 2000);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);