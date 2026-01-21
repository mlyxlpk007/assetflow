using System.Text;
using RDTrackingSystem.Data;

namespace RDTrackingSystem.Services;

/// <summary>
/// 项目文件夹管理服务
/// 根据研发文件与软件资产管理实践指南自动创建项目文件夹结构
/// </summary>
public static class ProjectFolderService
{
    /// <summary>
    /// 获取项目根目录路径
    /// </summary>
    public static string GetProjectsRootPath()
    {
        var rootPath = ConfigManager.GetValue("Projects", "RootPath", "");
        
        if (string.IsNullOrEmpty(rootPath))
        {
            // 默认使用用户文档目录下的Projects文件夹
            rootPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
                "RDTrackingSystem",
                "Projects");
        }
        
        // 如果是相对路径，转换为绝对路径（相对于程序目录）
        if (!Path.IsPathRooted(rootPath))
        {
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            rootPath = Path.Combine(baseDir, rootPath);
        }
        
        // 规范化路径
        rootPath = Path.GetFullPath(rootPath);
        
        return rootPath;
    }
    
    /// <summary>
    /// 设置项目根目录路径
    /// </summary>
    public static void SetProjectsRootPath(string path)
    {
        ConfigManager.SetValue("Projects", "RootPath", path);
    }
    
    /// <summary>
    /// 根据项目信息生成项目文件夹名称
    /// </summary>
    /// <param name="orderNumber">订单号</param>
    /// <param name="projectName">项目名称</param>
    /// <param name="projectId">项目ID（作为备用）</param>
    /// <returns>项目文件夹名称</returns>
    public static string GenerateProjectFolderName(string orderNumber, string projectName, string projectId)
    {
        // 优先使用订单号，如果没有则使用项目名称，最后使用项目ID
        string folderName;
        
        if (!string.IsNullOrWhiteSpace(orderNumber))
        {
            folderName = SanitizeFileName(orderNumber);
        }
        else if (!string.IsNullOrWhiteSpace(projectName))
        {
            folderName = SanitizeFileName(projectName);
        }
        else
        {
            folderName = projectId;
        }
        
        // 添加日期前缀（可选，格式：YYYYMMDD_）
        // 如果需要日期前缀，可以取消下面的注释
        // folderName = $"{DateTime.Now:yyyyMMdd}_{folderName}";
        
        return folderName;
    }
    
    /// <summary>
    /// 创建项目文件夹结构
    /// </summary>
    /// <param name="orderNumber">订单号</param>
    /// <param name="projectName">项目名称</param>
    /// <param name="projectId">项目ID</param>
    /// <param name="logger">日志记录器（可选）</param>
    /// <returns>项目根目录路径，如果创建失败则返回null</returns>
    public static string? CreateProjectFolderStructure(
        string orderNumber, 
        string projectName, 
        string projectId,
        FileLogger? logger = null)
    {
        logger ??= FileLogger.Instance;
        
        try
        {
            // 获取项目根目录
            var projectsRoot = GetProjectsRootPath();
            logger.LogInfo($"项目根目录: {projectsRoot}", "ProjectFolderService");
            
            // 确保项目根目录存在
            if (!Directory.Exists(projectsRoot))
            {
                Directory.CreateDirectory(projectsRoot);
                logger.LogInfo($"已创建项目根目录: {projectsRoot}", "ProjectFolderService");
            }
            
            // 生成项目文件夹名称
            var projectFolderName = GenerateProjectFolderName(orderNumber, projectName, projectId);
            var projectPath = Path.Combine(projectsRoot, projectFolderName);
            
            // 如果文件夹已存在，添加序号后缀
            int suffix = 1;
            var originalPath = projectPath;
            while (Directory.Exists(projectPath))
            {
                projectPath = $"{originalPath}_{suffix}";
                suffix++;
            }
            
            logger.LogInfo($"创建项目文件夹: {projectPath}", "ProjectFolderService");
            
            // 创建项目根文件夹
            Directory.CreateDirectory(projectPath);
            
            // 创建标准文件夹结构（根据研发文件与软件资产管理实践指南）
            var folderStructure = GetStandardFolderStructure();
            
            foreach (var folder in folderStructure)
            {
                var folderPath = Path.Combine(projectPath, folder);
                Directory.CreateDirectory(folderPath);
                logger.LogInfo($"已创建文件夹: {folderPath}", "ProjectFolderService");
            }
            
            // 创建README文件说明文件夹结构
            CreateReadmeFile(projectPath, orderNumber, projectName, logger);
            
            logger.LogInfo($"项目文件夹结构创建成功: {projectPath}", "ProjectFolderService");
            return projectPath;
        }
        catch (Exception ex)
        {
            logger.LogError($"创建项目文件夹结构失败: {ex.Message}", ex, "ProjectFolderService");
            return null;
        }
    }
    
    /// <summary>
    /// 获取标准文件夹结构（根据研发文件与软件资产管理实践指南）
    /// </summary>
    /// <returns>文件夹名称列表</returns>
    private static List<string> GetStandardFolderStructure()
    {
        return new List<string>
        {
            // 1. 文档目录
            "01_需求文档",
            "02_设计文档",
            "03_测试文档",
            "04_用户手册",
            "05_技术文档",
            "06_会议记录",
            "07_变更记录",
            
            // 2. 研发目录
            "10_源代码",
            "11_硬件设计",
            "12_软件设计",
            "13_系统设计",
            "14_结构设计",
            
            // 3. 资源目录
            "20_图片资源",
            "21_配置文件",
            "22_第三方库",
            "23_工具脚本",
            
            // 4. 版本管理
            "30_版本发布",
            "31_备份归档",
            
            // 5. 生产相关
            "40_生产文件",
            "41_BOM清单",
            "42_工艺文件",
            "43_质检文件",
            
            // 6. 其他
            "50_临时文件",
            "51_参考资料"
        };
    }
    
    /// <summary>
    /// 创建README文件说明项目信息
    /// </summary>
    private static void CreateReadmeFile(string projectPath, string orderNumber, string projectName, FileLogger logger)
    {
        try
        {
            var readmePath = Path.Combine(projectPath, "README.txt");
            var content = new StringBuilder();
            
            content.AppendLine("=".PadRight(60, '='));
            content.AppendLine("项目文件夹说明");
            content.AppendLine("=".PadRight(60, '='));
            content.AppendLine();
            content.AppendLine($"项目名称: {projectName}");
            content.AppendLine($"订单号: {orderNumber}");
            content.AppendLine($"创建时间: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
            content.AppendLine();
            content.AppendLine("文件夹结构说明:");
            content.AppendLine();
            content.AppendLine("文档目录:");
            content.AppendLine("  01_需求文档  - 客户需求、需求分析等文档");
            content.AppendLine("  02_设计文档  - 设计方案、设计图纸等");
            content.AppendLine("  03_测试文档  - 测试计划、测试报告等");
            content.AppendLine("  04_用户手册  - 用户使用手册、操作指南等");
            content.AppendLine("  05_技术文档  - 技术规范、API文档等");
            content.AppendLine("  06_会议记录  - 项目会议记录、讨论纪要等");
            content.AppendLine("  07_变更记录  - 需求变更、设计变更等记录");
            content.AppendLine();
            content.AppendLine("研发目录:");
            content.AppendLine("  10_源代码    - 项目源代码文件");
            content.AppendLine("  11_硬件设计  - 硬件原理图、PCB设计等");
            content.AppendLine("  12_软件设计  - 软件架构、模块设计等");
            content.AppendLine("  13_系统设计  - 系统架构、接口设计等");
            content.AppendLine("  14_结构设计  - 结构图纸、3D模型等");
            content.AppendLine();
            content.AppendLine("资源目录:");
            content.AppendLine("  20_图片资源  - 项目相关图片、图标等");
            content.AppendLine("  21_配置文件  - 配置文件、参数设置等");
            content.AppendLine("  22_第三方库  - 第三方库文件、依赖包等");
            content.AppendLine("  23_工具脚本  - 工具脚本、自动化脚本等");
            content.AppendLine();
            content.AppendLine("版本管理:");
            content.AppendLine("  30_版本发布  - 发布版本、安装包等");
            content.AppendLine("  31_备份归档  - 备份文件、归档文件等");
            content.AppendLine();
            content.AppendLine("生产相关:");
            content.AppendLine("  40_生产文件  - 生产相关文件");
            content.AppendLine("  41_BOM清单  - 物料清单、采购清单等");
            content.AppendLine("  42_工艺文件  - 生产工艺、工艺流程等");
            content.AppendLine("  43_质检文件  - 质检报告、检验记录等");
            content.AppendLine();
            content.AppendLine("其他:");
            content.AppendLine("  50_临时文件  - 临时文件、草稿等");
            content.AppendLine("  51_参考资料  - 参考资料、学习资料等");
            content.AppendLine();
            content.AppendLine("=".PadRight(60, '='));
            content.AppendLine("请按照文件夹说明存放相应文件，保持项目文件结构清晰有序。");
            content.AppendLine("=".PadRight(60, '='));
            
            File.WriteAllText(readmePath, content.ToString(), Encoding.UTF8);
            logger.LogInfo($"已创建README文件: {readmePath}", "ProjectFolderService");
        }
        catch (Exception ex)
        {
            logger.LogWarning($"创建README文件失败: {ex.Message}", "ProjectFolderService");
            // 不抛出异常，README文件创建失败不影响项目创建
        }
    }
    
    /// <summary>
    /// 清理文件名中的非法字符
    /// </summary>
    private static string SanitizeFileName(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return "Project";
        }
        
        // Windows文件系统不允许的字符: < > : " / \ | ? *
        var invalidChars = Path.GetInvalidFileNameChars();
        var sanitized = fileName;
        
        foreach (var c in invalidChars)
        {
            sanitized = sanitized.Replace(c, '_');
        }
        
        // 移除首尾空格和点
        sanitized = sanitized.Trim().TrimEnd('.');
        
        // 限制长度（Windows路径最大260字符，但文件夹名建议不超过100字符）
        if (sanitized.Length > 100)
        {
            sanitized = sanitized.Substring(0, 100);
        }
        
        return sanitized;
    }
    
    /// <summary>
    /// 打开项目文件夹（在文件管理器中显示）
    /// </summary>
    public static bool OpenProjectFolder(string projectPath, FileLogger? logger = null)
    {
        logger ??= FileLogger.Instance;
        
        try
        {
            if (!Directory.Exists(projectPath))
            {
                logger.LogWarning($"项目文件夹不存在: {projectPath}", "ProjectFolderService");
                return false;
            }
            
            // Windows系统使用explorer命令打开文件夹
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
            {
                FileName = "explorer.exe",
                Arguments = projectPath,
                UseShellExecute = true
            });
            
            logger.LogInfo($"已打开项目文件夹: {projectPath}", "ProjectFolderService");
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError($"打开项目文件夹失败: {ex.Message}", ex, "ProjectFolderService");
            return false;
        }
    }
    
    /// <summary>
    /// 删除项目文件夹（谨慎使用）
    /// </summary>
    public static bool DeleteProjectFolder(string projectPath, FileLogger? logger = null)
    {
        logger ??= FileLogger.Instance;
        
        try
        {
            if (!Directory.Exists(projectPath))
            {
                logger.LogWarning($"项目文件夹不存在: {projectPath}", "ProjectFolderService");
                return true; // 已经不存在，视为成功
            }
            
            Directory.Delete(projectPath, true);
            logger.LogInfo($"已删除项目文件夹: {projectPath}", "ProjectFolderService");
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError($"删除项目文件夹失败: {ex.Message}", ex, "ProjectFolderService");
            return false;
        }
    }
}
