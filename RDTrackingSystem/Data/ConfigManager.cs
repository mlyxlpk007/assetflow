using System.Text;
using RDTrackingSystem.Services;

namespace RDTrackingSystem.Data;

/// <summary>
/// 配置文件管理器（INI 格式）
/// </summary>
public static class ConfigManager
{
    private static readonly string ConfigFilePath = Path.Combine(
        AppDomain.CurrentDomain.BaseDirectory, "config.ini");
    
    private static Dictionary<string, Dictionary<string, string>>? _configCache;
    private static readonly object _lockObject = new object();
    
    /// <summary>
    /// 读取配置值
    /// </summary>
    /// <param name="section">节名</param>
    /// <param name="key">键名</param>
    /// <param name="defaultValue">默认值</param>
    /// <returns>配置值，如果不存在则返回默认值</returns>
    public static string GetValue(string section, string key, string defaultValue = "")
    {
        lock (_lockObject)
        {
            if (_configCache == null)
            {
                LoadConfig();
            }
            
            if (_configCache.TryGetValue(section, out var sectionDict) &&
                sectionDict.TryGetValue(key, out var value))
            {
                return value;
            }
            
            return defaultValue;
        }
    }
    
    /// <summary>
    /// 设置配置值
    /// </summary>
    /// <param name="section">节名</param>
    /// <param name="key">键名</param>
    /// <param name="value">值</param>
    public static void SetValue(string section, string key, string value)
    {
        lock (_lockObject)
        {
            if (_configCache == null)
            {
                LoadConfig();
            }
            
            if (!_configCache.ContainsKey(section))
            {
                _configCache[section] = new Dictionary<string, string>();
            }
            
            _configCache[section][key] = value;
            SaveConfig();
        }
    }
    
    /// <summary>
    /// 清除配置缓存，强制重新加载
    /// </summary>
    public static void ClearCache()
    {
        lock (_lockObject)
        {
            _configCache = null;
        }
    }
    
    /// <summary>
    /// 加载配置文件
    /// </summary>
    private static void LoadConfig()
    {
        _configCache = new Dictionary<string, Dictionary<string, string>>(StringComparer.OrdinalIgnoreCase);
        
        if (!File.Exists(ConfigFilePath))
        {
            // 如果配置文件不存在，创建默认配置
            CreateDefaultConfig();
            return;
        }
        
        try
        {
            string? currentSection = null;
            var lines = File.ReadAllLines(ConfigFilePath, Encoding.UTF8);
            
            foreach (var line in lines)
            {
                var trimmedLine = line.Trim();
                
                // 跳过空行和注释
                if (string.IsNullOrWhiteSpace(trimmedLine) || trimmedLine.StartsWith(";") || trimmedLine.StartsWith("#"))
                {
                    continue;
                }
                
                // 检查是否是节名 [Section]
                if (trimmedLine.StartsWith("[") && trimmedLine.EndsWith("]"))
                {
                    currentSection = trimmedLine.Substring(1, trimmedLine.Length - 2).Trim();
                    if (!_configCache.ContainsKey(currentSection))
                    {
                        _configCache[currentSection] = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                    }
                }
                // 检查是否是键值对 key=value
                else if (trimmedLine.Contains("=") && !string.IsNullOrEmpty(currentSection))
                {
                    var parts = trimmedLine.Split(new[] { '=' }, 2);
                    if (parts.Length == 2)
                    {
                        var key = parts[0].Trim();
                        var value = parts[1].Trim();
                        _configCache[currentSection][key] = value;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ConfigManager] 加载配置文件失败: {ex.Message}");
            // 如果加载失败，创建默认配置
            CreateDefaultConfig();
        }
    }
    
    /// <summary>
    /// 保存配置文件
    /// </summary>
    private static void SaveConfig()
    {
        if (_configCache == null)
        {
            return;
        }
        
        try
        {
            var sb = new StringBuilder();
            
            foreach (var section in _configCache.Keys.OrderBy(k => k))
            {
                sb.AppendLine($"[{section}]");
                
                foreach (var kvp in _configCache[section].OrderBy(k => k.Key))
                {
                    sb.AppendLine($"{kvp.Key}={kvp.Value}");
                }
                
                sb.AppendLine();
            }
            
            File.WriteAllText(ConfigFilePath, sb.ToString(), Encoding.UTF8);
            Console.WriteLine($"[ConfigManager] 配置文件已保存: {ConfigFilePath}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ConfigManager] 保存配置文件失败: {ex.Message}");
        }
    }
    
    /// <summary>
    /// 创建默认配置文件
    /// </summary>
    private static void CreateDefaultConfig()
    {
        try
        {
            var defaultConfig = new StringBuilder();
            defaultConfig.AppendLine("; RDTrackingSystem 配置文件");
            defaultConfig.AppendLine("; 修改此文件后需要重启程序才能生效");
            defaultConfig.AppendLine();
            defaultConfig.AppendLine("[Database]");
            defaultConfig.AppendLine("; 数据库文件路径（可以是相对路径或绝对路径）");
            defaultConfig.AppendLine("; 相对路径相对于程序运行目录");
            defaultConfig.AppendLine("; 默认使用用户文档目录，避免权限问题");
            defaultConfig.AppendLine("; 示例: Data\\rdtracking_v2.db 或 C:\\MyApp\\Data\\rdtracking_v2.db");
            var defaultDbPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
                "RDTrackingSystem",
                "rdtracking_v2.db");
            defaultConfig.AppendLine($"Path={defaultDbPath}");
            defaultConfig.AppendLine();
            defaultConfig.AppendLine("[Logging]");
            defaultConfig.AppendLine("; 日志级别: Debug, Info, Warning, Error");
            defaultConfig.AppendLine("Level=Info");
            defaultConfig.AppendLine();
            defaultConfig.AppendLine("[Projects]");
            defaultConfig.AppendLine("; 项目根目录路径（可以是相对路径或绝对路径）");
            defaultConfig.AppendLine("; 相对路径相对于程序运行目录");
            defaultConfig.AppendLine("; 新建项目时会在此目录下自动创建项目文件夹");
            defaultConfig.AppendLine("; 示例: Projects 或 C:\\Projects");
            var defaultProjectsPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
                "RDTrackingSystem",
                "Projects");
            defaultConfig.AppendLine($"RootPath={defaultProjectsPath}");
            
            File.WriteAllText(ConfigFilePath, defaultConfig.ToString(), Encoding.UTF8);
            Console.WriteLine($"[ConfigManager] 已创建默认配置文件: {ConfigFilePath}");
            
            // 重新加载配置
            LoadConfig();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ConfigManager] 创建默认配置文件失败: {ex.Message}");
            // 如果创建失败，使用内存中的默认配置（用户文档目录）
            var defaultDbPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
                "RDTrackingSystem",
                "rdtracking_v2.db");
            _configCache = new Dictionary<string, Dictionary<string, string>>(StringComparer.OrdinalIgnoreCase)
            {
                ["Database"] = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    ["Path"] = defaultDbPath
                }
            };
        }
    }
    
    /// <summary>
    /// 获取数据库路径（原始路径，不进行规范化）
    /// </summary>
    public static string GetDatabasePath()
    {
        // 默认使用用户目录，避免权限问题
        var defaultPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
            "RDTrackingSystem",
            "rdtracking_v2.db");
        
        var dbPath = GetValue("Database", "Path", defaultPath);
        
        var logger = FileLogger.Instance;
        logger.LogInfo($"从配置文件读取的数据库路径: {dbPath}", "ConfigManager");
        
        // 如果是相对路径，转换为绝对路径（相对于程序目录）
        if (!Path.IsPathRooted(dbPath))
        {
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            dbPath = Path.Combine(baseDir, dbPath);
            logger.LogInfo($"相对路径转换为绝对路径: {dbPath}", "ConfigManager");
        }
        
        // 规范化路径（处理 .. 和 . 等）
        dbPath = Path.GetFullPath(dbPath);
        logger.LogInfo($"规范化后的数据库路径: {dbPath}", "ConfigManager");
        
        return dbPath;
    }
    
    /// <summary>
    /// 获取数据库目录
    /// </summary>
    public static string GetDatabaseDirectory()
    {
        var dbPath = GetDatabasePath();
        return Path.GetDirectoryName(dbPath) ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data");
    }
}
