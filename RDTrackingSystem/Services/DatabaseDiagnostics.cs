using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using RDTrackingSystem.Data;
using RDTrackingSystem.Services;

namespace RDTrackingSystem.Services;

/// <summary>
/// 数据库诊断工具
/// </summary>
public static class DatabaseDiagnostics
{
    /// <summary>
    /// 诊断数据库访问问题
    /// </summary>
    public static string Diagnose()
    {
        var logger = FileLogger.Instance;
        var result = new System.Text.StringBuilder();
        result.AppendLine("========================================");
        result.AppendLine("数据库诊断报告");
        result.AppendLine("========================================");
        result.AppendLine();
        
        try
        {
            var dbPath = DatabaseConstants.GetDatabasePath();
            result.AppendLine($"数据库路径: {dbPath}");
            result.AppendLine();
            
            // 1. 检查文件是否存在
            result.AppendLine("1. 文件存在性检查:");
            if (File.Exists(dbPath))
            {
                result.AppendLine("   ✓ 数据库文件存在");
                var fileInfo = new FileInfo(dbPath);
                result.AppendLine($"   文件大小: {fileInfo.Length} 字节");
                result.AppendLine($"   只读属性: {fileInfo.IsReadOnly}");
                result.AppendLine($"   最后修改时间: {fileInfo.LastWriteTime}");
            }
            else
            {
                result.AppendLine("   ✗ 数据库文件不存在");
            }
            result.AppendLine();
            
            // 2. 检查目录权限
            result.AppendLine("2. 目录权限检查:");
            var dbDirectory = Path.GetDirectoryName(dbPath);
            if (!string.IsNullOrEmpty(dbDirectory))
            {
                result.AppendLine($"   目录路径: {dbDirectory}");
                if (Directory.Exists(dbDirectory))
                {
                    result.AppendLine("   ✓ 目录存在");
                    
                    // 测试写入权限
                    try
                    {
                        var testFile = Path.Combine(dbDirectory, ".write_test");
                        File.WriteAllText(testFile, "test");
                        File.Delete(testFile);
                        result.AppendLine("   ✓ 目录有写入权限");
                    }
                    catch (UnauthorizedAccessException)
                    {
                        result.AppendLine("   ✗ 目录没有写入权限");
                    }
                    catch (Exception ex)
                    {
                        result.AppendLine($"   ✗ 目录写入测试失败: {ex.Message}");
                    }
                }
                else
                {
                    result.AppendLine("   ✗ 目录不存在");
                }
            }
            result.AppendLine();
            
            // 3. 检查文件权限
            result.AppendLine("3. 文件权限检查:");
            if (File.Exists(dbPath))
            {
                try
                {
                    using (var stream = File.Open(dbPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                    {
                        result.AppendLine("   ✓ 文件有读取权限");
                    }
                }
                catch (UnauthorizedAccessException)
                {
                    result.AppendLine("   ✗ 文件没有读取权限");
                }
                catch (Exception ex)
                {
                    result.AppendLine($"   ✗ 文件读取测试失败: {ex.Message}");
                }
                
                try
                {
                    using (var stream = File.Open(dbPath, FileMode.Open, FileAccess.ReadWrite, FileShare.ReadWrite))
                    {
                        result.AppendLine("   ✓ 文件有写入权限");
                    }
                }
                catch (UnauthorizedAccessException)
                {
                    result.AppendLine("   ✗ 文件没有写入权限");
                }
                catch (Exception ex)
                {
                    result.AppendLine($"   ✗ 文件写入测试失败: {ex.Message}");
                }
            }
            result.AppendLine();
            
            // 4. 检查 SQLite 相关文件
            result.AppendLine("4. SQLite 相关文件检查:");
            var journalPath = dbPath + "-journal";
            var walPath = dbPath + "-wal";
            var shmPath = dbPath + "-shm";
            
            if (File.Exists(journalPath))
            {
                result.AppendLine($"   ⚠ journal 文件存在: {journalPath}");
                result.AppendLine("   这可能导致文件锁定问题");
                try
                {
                    var journalInfo = new FileInfo(journalPath);
                    result.AppendLine($"   文件大小: {journalInfo.Length} 字节");
                    result.AppendLine($"   只读属性: {journalInfo.IsReadOnly}");
                }
                catch (Exception ex)
                {
                    result.AppendLine($"   无法获取文件信息: {ex.Message}");
                }
            }
            else
            {
                result.AppendLine("   ✓ 没有 journal 文件");
            }
            
            if (File.Exists(walPath))
            {
                result.AppendLine($"   ⚠ WAL 文件存在: {walPath}");
            }
            else
            {
                result.AppendLine("   ✓ 没有 WAL 文件");
            }
            
            if (File.Exists(shmPath))
            {
                result.AppendLine($"   ⚠ SHM 文件存在: {shmPath}");
            }
            else
            {
                result.AppendLine("   ✓ 没有 SHM 文件");
            }
            result.AppendLine();
            
            // 5. 检查数据库连接
            result.AppendLine("5. 数据库连接测试:");
            try
            {
                using (var context = new ApplicationDbContext())
                {
                    var canConnect = context.Database.CanConnect();
                    if (canConnect)
                    {
                        result.AppendLine("   ✓ 可以连接到数据库");
                        
                        // 检查表
                        var connection = context.Database.GetDbConnection();
                        var wasOpen = connection.State == System.Data.ConnectionState.Open;
                        try
                        {
                            if (!wasOpen)
                            {
                                context.Database.OpenConnection();
                            }
                            
                            using (var command = connection.CreateCommand())
                            {
                                command.CommandText = @"
                                    SELECT name FROM sqlite_master 
                                    WHERE type='table'
                                    ORDER BY name
                                ";
                                using (var reader = command.ExecuteReader())
                                {
                                    var tables = new System.Collections.Generic.List<string>();
                                    while (reader.Read())
                                    {
                                        tables.Add(reader.GetString(0));
                                    }
                                    result.AppendLine($"   表数量: {tables.Count}");
                                    if (tables.Count > 0)
                                    {
                                        result.AppendLine($"   表列表: {string.Join(", ", tables)}");
                                    }
                                }
                            }
                        }
                        finally
                        {
                            if (!wasOpen && connection.State == System.Data.ConnectionState.Open)
                            {
                                context.Database.CloseConnection();
                            }
                        }
                    }
                    else
                    {
                        result.AppendLine("   ✗ 无法连接到数据库");
                    }
                }
            }
            catch (Exception ex)
            {
                result.AppendLine($"   ✗ 数据库连接测试失败: {ex.Message}");
                result.AppendLine($"   错误类型: {ex.GetType().Name}");
                if (ex.InnerException != null)
                {
                    result.AppendLine($"   内部错误: {ex.InnerException.Message}");
                }
            }
            result.AppendLine();
            
            // 6. 建议
            result.AppendLine("6. 建议:");
            if (File.Exists(journalPath))
            {
                result.AppendLine("   - 删除 journal 文件并重试");
            }
            if (!Directory.Exists(dbDirectory))
            {
                result.AppendLine("   - 创建数据库目录");
            }
            result.AppendLine("   - 确保数据库文件及其目录有写入权限");
            result.AppendLine("   - 如果问题持续，尝试将数据库路径配置到用户文档目录");
            result.AppendLine();
        }
        catch (Exception ex)
        {
            result.AppendLine($"诊断过程出错: {ex.Message}");
            result.AppendLine($"错误类型: {ex.GetType().Name}");
            if (ex.InnerException != null)
            {
                result.AppendLine($"内部错误: {ex.InnerException.Message}");
            }
        }
        
        result.AppendLine("========================================");
        var report = result.ToString();
        logger.LogInfo($"数据库诊断报告:\n{report}", "DatabaseDiagnostics");
        return report;
    }
}
