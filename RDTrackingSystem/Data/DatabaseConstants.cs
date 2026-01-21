namespace RDTrackingSystem.Data;

/// <summary>
/// 数据库相关常量（已迁移到 ConfigManager，保留此类以保持向后兼容）
/// </summary>
public static class DatabaseConstants
{
    /// <summary>
    /// 数据库文件名（默认值，实际路径从配置文件读取）
    /// </summary>
    public const string DatabaseFileName = "rdtracking_v2.db";
    
    /// <summary>
    /// 获取数据库文件完整路径（从配置文件读取）
    /// </summary>
    public static string GetDatabasePath()
    {
        return ConfigManager.GetDatabasePath();
    }
    
    /// <summary>
    /// 获取数据库目录路径（从配置文件读取）
    /// </summary>
    public static string GetDatabaseDirectory()
    {
        return ConfigManager.GetDatabaseDirectory();
    }
}
