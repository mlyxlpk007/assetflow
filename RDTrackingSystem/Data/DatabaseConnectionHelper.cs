using Microsoft.Data.Sqlite;
using RDTrackingSystem.Services;

namespace RDTrackingSystem.Data;

/// <summary>
/// 统一的数据库连接辅助类 - 确保所有地方使用相同的路径和连接字符串格式
/// </summary>
public static class DatabaseConnectionHelper
{
    /// <summary>
    /// 获取规范化的数据库路径（统一处理）
    /// </summary>
    public static string GetNormalizedDatabasePath()
    {
        // ConfigManager.GetDatabasePath() 已经返回了规范化的绝对路径
        // 直接使用，不需要再次处理
        var dbPath = DatabaseConstants.GetDatabasePath();
        
        // 确保路径是绝对路径（ConfigManager 应该已经处理了，但双重检查）
        if (!Path.IsPathRooted(dbPath))
        {
            dbPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, dbPath);
            dbPath = Path.GetFullPath(dbPath);
        }
        
        var logger = FileLogger.Instance;
        logger.LogInfo($"GetNormalizedDatabasePath() 返回路径: {dbPath}", "DatabaseConnectionHelper");
        
        return dbPath;
    }
    
    /// <summary>
    /// 构建 SQLite 连接字符串（统一格式）
    /// </summary>
    public static string BuildConnectionString()
    {
        var dbPath = GetNormalizedDatabasePath();
        
        // SQLite 在 Windows 上可以接受反斜杠，但为了兼容性，转换为正斜杠
        // 注意：不要使用 Uri 类，因为它会添加 file:// 前缀
        // 直接替换反斜杠为正斜杠即可
        var normalizedPath = dbPath.Replace('\\', '/');
        
        // 构建连接字符串
        // Cache=Shared: 允许多个连接共享同一个缓存，解决多个DbContext实例并发访问问题
        // Mode=ReadWriteCreate: 允许读写，如果文件不存在则创建
        // Foreign Keys=True: 启用外键约束
        // 重要：路径中的空格和特殊字符不需要转义，SQLite 会自动处理
        var connectionString = $"Data Source={normalizedPath};Cache=Shared;Mode=ReadWriteCreate;Foreign Keys=True;";
        
        var logger = FileLogger.Instance;
        logger.LogInfo($"构建连接字符串", "DatabaseConnectionHelper");
        logger.LogInfo($"  原始路径: {dbPath}", "DatabaseConnectionHelper");
        logger.LogInfo($"  规范化路径: {normalizedPath}", "DatabaseConnectionHelper");
        logger.LogInfo($"  连接字符串: {connectionString}", "DatabaseConnectionHelper");
        
        return connectionString;
    }
    
    /// <summary>
    /// 确保数据库目录存在
    /// </summary>
    public static void EnsureDatabaseDirectory()
    {
        var dbPath = GetNormalizedDatabasePath();
        var dbDirectory = Path.GetDirectoryName(dbPath);
        
        if (!string.IsNullOrEmpty(dbDirectory) && !Directory.Exists(dbDirectory))
        {
            try
            {
                Directory.CreateDirectory(dbDirectory);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    $"无法创建数据库目录: {dbDirectory}\n错误: {ex.Message}", ex);
            }
        }
    }
    
    /// <summary>
    /// 测试数据库连接是否可用
    /// </summary>
    public static bool TestConnection()
    {
        try
        {
            var connectionString = BuildConnectionString();
            using var connection = new SqliteConnection(connectionString);
            connection.Open();
            return true;
        }
        catch
        {
            return false;
        }
    }
}
