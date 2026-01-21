import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Database, Download, Upload, Save, RefreshCw, Trash2, FileText, Calendar, HardDrive, Settings, FolderOpen, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { backupApi, databaseConfigApi } from '@/lib/api';

const DataManagement = () => {
  const { toast } = useToast();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dbConfig, setDbConfig] = useState(null);
  const [newDbPath, setNewDbPath] = useState('');
  const [isSavingPath, setIsSavingPath] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadBackups();
    loadDatabaseConfig();
  }, []);
  
  const loadDatabaseConfig = async () => {
    try {
      setIsLoadingConfig(true);
      const config = await databaseConfigApi.getConfig();
      setDbConfig(config);
      setNewDbPath(config?.currentPath || '');
    } catch (error) {
      console.error('加载数据库配置失败:', error);
      toast({
        title: "加载配置失败",
        description: error.message || "无法获取数据库配置",
        variant: "destructive"
      });
    } finally {
      setIsLoadingConfig(false);
    }
  };
  
  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      
      const result = await databaseConfigApi.testConnection();
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "连接测试成功",
          description: "数据库连接正常",
        });
      } else {
        toast({
          title: "连接测试失败",
          description: "请查看详细测试结果",
          variant: "destructive",
          duration: 10000
        });
      }
    } catch (error) {
      console.error('测试连接失败:', error);
      toast({
        title: "测试失败",
        description: error.message || "无法执行连接测试",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleSaveDatabasePath = async () => {
    if (!newDbPath.trim()) {
      toast({
        title: "路径不能为空",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSavingPath(true);
      const result = await databaseConfigApi.setPath(newDbPath.trim());
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: "配置已保存",
        description: result.message || "数据库路径已更新，请重启程序以应用更改",
        duration: 5000
      });
      
      // 重新加载配置
      await loadDatabaseConfig();
    } catch (error) {
      console.error('保存数据库路径失败:', error);
      toast({
        title: "保存失败",
        description: error.message || "无法保存数据库路径",
        variant: "destructive",
        duration: 10000
      });
    } finally {
      setIsSavingPath(false);
    }
  };

  const loadBackups = async () => {
    try {
      setLoading(true);
      const data = await backupApi.getList();
      setBackups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('加载备份列表失败:', error);
      toast({
        title: "加载备份列表失败",
        description: error.message || "无法连接到服务器",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsExporting(true);
      const result = await backupApi.create();
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "备份创建成功",
        description: "数据库已成功备份",
      });
      
      await loadBackups();
    } catch (error) {
      console.error('创建备份失败:', error);
      toast({
        title: "创建备份失败",
        description: error.message || "无法创建备份",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToLocation = async () => {
    try {
      setIsExporting(true);
      
      // 调用后端 API 导出到指定位置
      const result = await backupApi.exportToLocation();
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "导出成功",
        description: result.message || "数据已导出到指定位置",
      });
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: "导出失败",
        description: error.message || "无法导出数据",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFromFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.db') && !file.name.endsWith('.zip')) {
      toast({
        title: "文件格式错误",
        description: "请选择 .db 或 .zip 格式的数据库文件",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsImporting(true);
      
      // 读取文件并转换为 base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileData = e.target.result;
          const result = await backupApi.importFromFile(file.name, fileData);
          
          if (result.error) {
            throw new Error(result.error);
          }

          toast({
            title: "导入成功",
            description: result.message || "数据已成功导入，请重启程序以应用更改",
          });
        } catch (error) {
          console.error('导入失败:', error);
          toast({
            title: "导入失败",
            description: error.message || "无法导入数据",
            variant: "destructive"
          });
        } finally {
          setIsImporting(false);
          // 重置文件输入
          event.target.value = '';
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('读取文件失败:', error);
      toast({
        title: "读取文件失败",
        description: error.message || "无法读取文件",
        variant: "destructive"
      });
      setIsImporting(false);
    }
  };

  const handleRestoreBackup = async (backupPath) => {
    if (!confirm('确定要恢复此备份吗？当前数据将被替换，此操作不可撤销！')) {
      return;
    }

    try {
      setIsImporting(true);
      const result = await backupApi.restore(backupPath);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "恢复成功",
        description: result.message || "数据库已恢复，请重启程序以应用更改",
      });
    } catch (error) {
      console.error('恢复备份失败:', error);
      toast({
        title: "恢复失败",
        description: error.message || "无法恢复备份",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteBackup = async (backupPath) => {
    if (!confirm('确定要删除此备份吗？此操作不可撤销！')) {
      return;
    }

    try {
      const result = await backupApi.delete(backupPath);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "删除成功",
        description: "备份已删除",
      });
      
      await loadBackups();
    } catch (error) {
      console.error('删除备份失败:', error);
      toast({
        title: "删除失败",
        description: error.message || "无法删除备份",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-900 text-gray-300">
      <header className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Database className="text-indigo-400" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">数据管理</h1>
            <p className="text-sm text-gray-400 mt-1">备份、恢复和管理数据库</p>
          </div>
        </div>
        <Button
          onClick={loadBackups}
          disabled={loading}
          variant="outline"
          className="border-gray-700 hover:bg-gray-800"
        >
          <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
          刷新
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 数据库路径配置区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-lg border border-gray-700"
        >
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/20 p-2 rounded-lg">
                  <Settings className="text-indigo-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">数据库路径配置</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    配置数据库文件的存储位置
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-400 hover:bg-green-600/20"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="mr-2 animate-spin" size={16} />
                      测试中...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2" size={16} />
                      测试连接
                    </>
                  )}
                </Button>
                <Button
                  onClick={loadDatabaseConfig}
                  disabled={isLoadingConfig}
                  variant="outline"
                  size="sm"
                  className="border-gray-700 hover:bg-gray-800"
                >
                  <RefreshCw className={`mr-2 ${isLoadingConfig ? 'animate-spin' : ''}`} size={16} />
                  刷新
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {isLoadingConfig ? (
              <div className="text-center py-8">
                <RefreshCw className="animate-spin mx-auto text-indigo-400" size={32} />
                <p className="text-gray-400 mt-4">加载配置中...</p>
              </div>
            ) : dbConfig ? (
              <>
                {/* 当前配置信息 */}
                <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <FolderOpen className="text-indigo-400 mt-1" size={20} />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">当前数据库路径</div>
                      <div className="text-white font-mono text-sm break-all">{dbConfig.currentPath}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      {dbConfig.fileExists ? (
                        <CheckCircle className="text-green-400" size={16} />
                      ) : (
                        <XCircle className="text-red-400" size={16} />
                      )}
                      <span className="text-sm text-gray-400">
                        文件存在: {dbConfig.fileExists ? '是' : '否'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {dbConfig.hasWritePermission ? (
                        <CheckCircle className="text-green-400" size={16} />
                      ) : (
                        <XCircle className="text-red-400" size={16} />
                      )}
                      <span className="text-sm text-gray-400">
                        写入权限: {dbConfig.hasWritePermission ? '有' : '无'}
                      </span>
                    </div>
                    
                    {dbConfig.fileSize && (
                      <div className="flex items-center gap-2">
                        <Database className="text-indigo-400" size={16} />
                        <span className="text-sm text-gray-400">
                          文件大小: {dbConfig.fileSizeFormatted || `${(dbConfig.fileSize / 1024 / 1024).toFixed(2)} MB`}
                        </span>
                      </div>
                    )}
                    
                    {dbConfig.lastModified && (
                      <div className="flex items-center gap-2">
                        <Calendar className="text-indigo-400" size={16} />
                        <span className="text-sm text-gray-400">
                          修改时间: {dbConfig.lastModified}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {dbConfig.isReadOnly && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                      <AlertCircle className="text-yellow-400" size={16} />
                      <span className="text-sm text-yellow-400">警告: 数据库文件为只读</span>
                    </div>
                  )}
                  
                  {dbConfig.hasWritePermission === false && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
                      <AlertCircle className="text-red-400" size={16} />
                      <span className="text-sm text-red-400">错误: 目录没有写入权限</span>
                    </div>
                  )}
                </div>
                
                {/* 路径输入 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">新数据库路径</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDbPath}
                      onChange={(e) => setNewDbPath(e.target.value)}
                      placeholder="例如: C:\Data\rdtracking_v2.db 或 Data\rdtracking_v2.db"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Button
                      onClick={handleSaveDatabasePath}
                      disabled={isSavingPath || !newDbPath.trim() || newDbPath === dbConfig.currentPath}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isSavingPath ? (
                        <>
                          <RefreshCw className="mr-2 animate-spin" size={16} />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2" size={16} />
                          保存
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    提示: 可以使用绝对路径（如 C:\Data\rdtracking_v2.db）或相对路径（如 Data\rdtracking_v2.db）。修改后需要重启程序才能生效。
                  </p>
                </div>
                
                {/* 连接测试结果 */}
                {testResult && (
                  <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {testResult.success ? (
                          <CheckCircle className="text-green-400" size={20} />
                        ) : (
                          <XCircle className="text-red-400" size={20} />
                        )}
                        连接测试结果
                      </h3>
                      <button
                        onClick={() => setTestResult(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">数据库路径:</span>
                        <span className="ml-2 font-mono text-gray-300">{testResult.databasePath}</span>
                      </div>
                      
                      {testResult.tests && testResult.tests.length > 0 && (
                        <div className="mt-3">
                          <div className="text-gray-400 mb-2">测试项:</div>
                          <div className="space-y-1">
                            {testResult.tests.map((test, index) => (
                              <div key={index} className="flex items-center gap-2">
                                {test.status === '通过' ? (
                                  <CheckCircle className="text-green-400" size={14} />
                                ) : test.status === '失败' ? (
                                  <XCircle className="text-red-400" size={14} />
                                ) : (
                                  <AlertCircle className="text-yellow-400" size={14} />
                                )}
                                <span className="text-gray-300">{test.test}:</span>
                                <span className={test.status === '通过' ? 'text-green-400' : test.status === '失败' ? 'text-red-400' : 'text-yellow-400'}>
                                  {test.status} - {test.message}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {testResult.recommendations && testResult.recommendations.length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                          <div className="text-yellow-400 font-semibold mb-2">建议:</div>
                          <ul className="list-disc list-inside space-y-1 text-yellow-300/80">
                            {testResult.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto text-gray-600" size={48} />
                <p className="text-gray-400 mt-4">无法加载配置信息</p>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* 操作按钮区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Save className="text-blue-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold">创建备份</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              在当前备份目录创建数据库备份
            </p>
            <Button
              onClick={handleCreateBackup}
              disabled={isExporting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="mr-2 animate-spin" size={16} />
                  备份中...
                </>
              ) : (
                <>
                  <Download className="mr-2" size={16} />
                  创建备份
                </>
              )}
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <HardDrive className="text-green-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold">导出到位置</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              将数据库导出到指定位置
            </p>
            <Button
              onClick={handleExportToLocation}
              disabled={isExporting}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="mr-2 animate-spin" size={16} />
                  导出中...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={16} />
                  导出到位置
                </>
              )}
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Upload className="text-purple-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold">从文件导入</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              从本地文件恢复数据库
            </p>
            <label className="w-full">
              <input
                type="file"
                accept=".db,.zip"
                onChange={handleImportFromFile}
                disabled={isImporting}
                className="hidden"
              />
              <Button
                as="span"
                disabled={isImporting}
                className="w-full bg-purple-600 hover:bg-purple-700 cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="mr-2 animate-spin" size={16} />
                    导入中...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2" size={16} />
                    选择文件导入
                  </>
                )}
              </Button>
            </label>
          </motion.div>
        </motion.div>

        {/* 备份列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-lg border border-gray-700"
        >
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="text-indigo-400" size={20} />
              备份列表
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              所有自动和手动创建的备份
            </p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="animate-spin mx-auto text-indigo-400" size={32} />
                <p className="text-gray-400 mt-4">加载中...</p>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8">
                <Database className="mx-auto text-gray-600" size={48} />
                <p className="text-gray-400 mt-4">暂无备份</p>
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((backup, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-indigo-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="text-indigo-400" size={18} />
                          <h3 className="font-semibold text-white">{backup.fileName}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 ml-7">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(backup.createdAt)}
                          </span>
                          <span>{backup.fileSizeFormatted || `${(backup.fileSize / 1024 / 1024).toFixed(2)} MB`}</span>
                        </div>
                        {backup.description && (
                          <p className="text-sm text-gray-500 mt-2 ml-7">{backup.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleRestoreBackup(backup.filePath)}
                          disabled={isImporting}
                          variant="outline"
                          size="sm"
                          className="border-green-600 text-green-400 hover:bg-green-600/20"
                        >
                          <Upload size={14} className="mr-1" />
                          恢复
                        </Button>
                        <Button
                          onClick={() => handleDeleteBackup(backup.filePath)}
                          disabled={isImporting}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-400 hover:bg-red-600/20"
                        >
                          <Trash2 size={14} className="mr-1" />
                          删除
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DataManagement;
