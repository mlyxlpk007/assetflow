// 全局调试工具
export const debug = {
  // 检查桥接状态
  checkBridge: () => {
    console.log('========== 桥接状态检查 ==========');
    console.log('window.chrome:', window.chrome);
    console.log('window.chrome.webview:', window.chrome?.webview);
    console.log('window.chrome.webview.hostObjects:', window.chrome?.webview?.hostObjects);
    console.log('window.chrome.webview.hostObjects.nativeBridge:', window.chrome?.webview?.hostObjects?.nativeBridge);
    
    const bridge = window.chrome?.webview?.hostObjects?.nativeBridge;
    if (bridge) {
      console.log('✅ 桥接对象存在');
      // 尝试调用测试方法
      if (bridge.TestDatabaseConnection) {
        console.log('✅ TestDatabaseConnection 方法存在');
      } else {
        console.log('❌ TestDatabaseConnection 方法不存在');
      }
    } else {
      console.log('❌ 桥接对象不存在');
    }
    console.log('====================================');
  },
  
  // 测试数据库连接
  testDatabase: async () => {
    try {
      const bridge = window.chrome?.webview?.hostObjects?.nativeBridge;
      if (!bridge) {
        console.error('桥接对象不存在');
        return;
      }
      
      console.log('测试数据库连接...');
      const result = await bridge.TestDatabaseConnection();
      console.log('数据库连接测试结果:', result);
      return result;
    } catch (error) {
      console.error('测试数据库连接失败:', error);
    }
  },
  
  // 测试获取用户
  testGetUsers: async () => {
    try {
      const bridge = window.chrome?.webview?.hostObjects?.nativeBridge;
      if (!bridge) {
        console.error('桥接对象不存在');
        return;
      }
      
      console.log('测试获取用户...');
      const result = await bridge.GetUsers();
      console.log('GetUsers 原始返回:', result);
      console.log('GetUsers 类型:', typeof result);
      
      if (typeof result === 'string') {
        try {
          const parsed = JSON.parse(result);
          console.log('GetUsers 解析后:', parsed);
          return parsed;
        } catch (e) {
          console.error('GetUsers JSON 解析失败:', e);
        }
      }
      
      return result;
    } catch (error) {
      console.error('测试获取用户失败:', error);
    }
  },
  
  // 测试获取任务
  testGetTasks: async () => {
    try {
      const bridge = window.chrome?.webview?.hostObjects?.nativeBridge;
      if (!bridge) {
        console.error('桥接对象不存在');
        return;
      }
      
      console.log('测试获取任务...');
      const result = await bridge.GetTasks();
      console.log('GetTasks 原始返回:', result);
      console.log('GetTasks 类型:', typeof result);
      
      if (typeof result === 'string') {
        try {
          const parsed = JSON.parse(result);
          console.log('GetTasks 解析后:', parsed);
          return parsed;
        } catch (e) {
          console.error('GetTasks JSON 解析失败:', e);
        }
      }
      
      return result;
    } catch (error) {
      console.error('测试获取任务失败:', error);
    }
  },
  
  // 测试获取项目
  testGetProjects: async () => {
    try {
      const bridge = window.chrome?.webview?.hostObjects?.nativeBridge;
      if (!bridge) {
        console.error('桥接对象不存在');
        return;
      }
      
      console.log('测试获取项目...');
      const result = await bridge.GetProjects();
      console.log('GetProjects 原始返回:', result);
      console.log('GetProjects 类型:', typeof result);
      
      if (typeof result === 'string') {
        try {
          const parsed = JSON.parse(result);
          console.log('GetProjects 解析后:', parsed);
          return parsed;
        } catch (e) {
          console.error('GetProjects JSON 解析失败:', e);
        }
      }
      
      return result;
    } catch (error) {
      console.error('测试获取项目失败:', error);
    }
  }
};

// 将调试工具挂载到 window 对象，方便在控制台调用
if (typeof window !== 'undefined') {
  window.debug = debug;
  console.log('🔧 调试工具已加载，可在控制台使用 window.debug 进行测试');
  console.log('可用方法:');
  console.log('  - window.debug.checkBridge() - 检查桥接状态');
  console.log('  - window.debug.testDatabase() - 测试数据库连接');
  console.log('  - window.debug.testGetUsers() - 测试获取用户');
  console.log('  - window.debug.testGetTasks() - 测试获取任务');
  console.log('  - window.debug.testGetProjects() - 测试获取项目');
}
