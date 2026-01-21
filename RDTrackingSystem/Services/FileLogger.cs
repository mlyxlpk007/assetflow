using System.Text;

namespace RDTrackingSystem.Services;

/// <summary>
/// 文件日志记录器
/// </summary>
public class FileLogger
{
    private static readonly string LogDirectory = Path.Combine(
        AppDomain.CurrentDomain.BaseDirectory, "Logs");
    private static readonly string LogFileName = $"app_{DateTime.Now:yyyyMMdd}.log";
    private static readonly string LogFilePath = Path.Combine(LogDirectory, LogFileName);
    private static readonly object _lockObject = new object();
    private static FileLogger? _instance;
    
    public static FileLogger Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = new FileLogger();
            }
            return _instance;
        }
    }
    
    private FileLogger()
    {
        // 确保日志目录存在
        if (!Directory.Exists(LogDirectory))
        {
            try
            {
                Directory.CreateDirectory(LogDirectory);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FileLogger] 无法创建日志目录: {ex.Message}");
            }
        }
    }
    
    /// <summary>
    /// 记录信息日志
    /// </summary>
    public void LogInfo(string message, string? category = null)
    {
        WriteLog("INFO", message, category);
    }
    
    /// <summary>
    /// 记录警告日志
    /// </summary>
    public void LogWarning(string message, string? category = null)
    {
        WriteLog("WARN", message, category);
    }
    
    /// <summary>
    /// 记录错误日志
    /// </summary>
    public void LogError(string message, Exception? exception = null, string? category = null)
    {
        var errorMessage = message;
        if (exception != null)
        {
            errorMessage += $"\n异常类型: {exception.GetType().Name}";
            errorMessage += $"\n异常消息: {exception.Message}";
            errorMessage += $"\n堆栈跟踪:\n{exception.StackTrace}";
            
            if (exception.InnerException != null)
            {
                errorMessage += $"\n内部异常: {exception.InnerException.GetType().Name}";
                errorMessage += $"\n内部异常消息: {exception.InnerException.Message}";
                errorMessage += $"\n内部异常堆栈:\n{exception.InnerException.StackTrace}";
            }
        }
        
        WriteLog("ERROR", errorMessage, category);
    }
    
    /// <summary>
    /// 记录调试日志
    /// </summary>
    public void LogDebug(string message, string? category = null)
    {
        WriteLog("DEBUG", message, category);
    }
    
    /// <summary>
    /// 写入日志到文件
    /// </summary>
    private void WriteLog(string level, string message, string? category)
    {
        lock (_lockObject)
        {
            try
            {
                var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff");
                var categoryStr = string.IsNullOrEmpty(category) ? "" : $"[{category}] ";
                var logEntry = $"[{timestamp}] [{level}] {categoryStr}{message}\n";
                
                // 同时输出到控制台
                Console.Write(logEntry);
                
                // 写入文件
                File.AppendAllText(LogFilePath, logEntry, Encoding.UTF8);
            }
            catch (Exception ex)
            {
                // 如果写入日志文件失败，至少输出到控制台
                Console.WriteLine($"[FileLogger] 写入日志文件失败: {ex.Message}");
                Console.WriteLine($"[FileLogger] 原始日志: [{level}] {message}");
            }
        }
    }
    
    /// <summary>
    /// 清理旧日志文件（保留最近7天）
    /// </summary>
    public static void CleanupOldLogs(int keepDays = 7)
    {
        try
        {
            if (!Directory.Exists(LogDirectory))
            {
                return;
            }
            
            var cutoffDate = DateTime.Now.AddDays(-keepDays);
            var logFiles = Directory.GetFiles(LogDirectory, "app_*.log");
            
            foreach (var logFile in logFiles)
            {
                var fileInfo = new FileInfo(logFile);
                if (fileInfo.CreationTime < cutoffDate)
                {
                    try
                    {
                        File.Delete(logFile);
                        Console.WriteLine($"[FileLogger] 已删除旧日志文件: {logFile}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[FileLogger] 删除旧日志文件失败: {ex.Message}");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[FileLogger] 清理旧日志失败: {ex.Message}");
        }
    }
    
    /// <summary>
    /// 获取日志文件路径
    /// </summary>
    public static string GetLogFilePath()
    {
        return LogFilePath;
    }
}
