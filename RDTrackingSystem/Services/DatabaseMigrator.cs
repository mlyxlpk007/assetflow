using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Logging;

namespace RDTrackingSystem.Services;

public static class DatabaseMigrator
{
    private const int MaxRetries = 5;
    private const int RetryDelayMs = 500;

    public static void MigrateDatabase(string dbPath, ILogger? logger = null)
    {
        try
        {
            if (!File.Exists(dbPath))
            {
                logger?.LogInformation("数据库文件不存在，将使用 EF Core 创建新数据库");
                return;
            }

            // 使用重试机制检查文件是否可访问
            bool fileAccessible = false;
            for (int retry = 0; retry < MaxRetries; retry++)
            {
                try
                {
                    // 使用 FileShare.ReadWrite 允许其他进程读取，但我们需要写入权限
                    using (var testStream = File.Open(dbPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                    {
                        // 文件可以打开，继续
                        fileAccessible = true;
                        break;
                    }
                }
                catch (IOException ioEx)
                {
                    if (retry < MaxRetries - 1)
                    {
                        logger?.LogWarning($"数据库文件暂时无法访问 (尝试 {retry + 1}/{MaxRetries}): {ioEx.Message}，等待 {RetryDelayMs}ms 后重试...");
                        System.Threading.Thread.Sleep(RetryDelayMs);
                    }
                    else
                    {
                        var errorMsg = $"数据库文件被锁定或无法访问: {ioEx.Message}\n\n可能的原因:\n" +
                                      "1. 数据库文件正在被其他程序使用\n" +
                                      "2. 文件权限不足\n" +
                                      "3. 文件已损坏\n\n" +
                                      $"已重试 {MaxRetries} 次，仍然无法访问。\n" +
                                      "请确保没有其他程序正在使用该数据库文件。";
                        logger?.LogError(ioEx, errorMsg);
                        throw new InvalidOperationException(errorMsg, ioEx);
                    }
                }
            }

            if (!fileAccessible)
            {
                throw new InvalidOperationException("无法访问数据库文件");
            }

            logger?.LogInformation("开始检查数据库结构...");
            
            // 使用 WAL 模式提高并发性，并添加超时设置
            var connectionString = $"Data Source={dbPath};Cache=Shared;Mode=ReadWriteCreate";
            using var connection = new SqliteConnection(connectionString);
            
            // 使用重试机制打开连接
            bool connectionOpened = false;
            for (int retry = 0; retry < MaxRetries; retry++)
            {
                try
                {
                    connection.Open();
                    
                    // 启用 WAL 模式以提高并发性
                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = "PRAGMA journal_mode=WAL;";
                        command.ExecuteNonQuery();
                    }
                    
                    connectionOpened = true;
                    break;
                }
                catch (Exception connEx)
                {
                    if (retry < MaxRetries - 1)
                    {
                        logger?.LogWarning($"无法打开数据库连接 (尝试 {retry + 1}/{MaxRetries}): {connEx.Message}，等待 {RetryDelayMs}ms 后重试...");
                        System.Threading.Thread.Sleep(RetryDelayMs);
                    }
                    else
                    {
                        var errorMsg = $"无法打开数据库连接: {connEx.Message}\n\n数据库路径: {dbPath}\n已重试 {MaxRetries} 次。";
                        logger?.LogError(connEx, errorMsg);
                        throw new InvalidOperationException(errorMsg, connEx);
                    }
                }
            }

            if (!connectionOpened)
            {
                throw new InvalidOperationException("无法打开数据库连接");
            }

            // 检查并添加 Tasks 表的新字段
            CheckAndAddColumn(connection, "Tasks", "Requirements", "TEXT", logger);
            CheckAndAddColumn(connection, "Tasks", "Stakeholder", "TEXT", logger);
            CheckAndAddColumn(connection, "Tasks", "Priority", "TEXT", logger);
            CheckAndAddColumn(connection, "Tasks", "Status", "TEXT", logger);
            CheckAndAddColumn(connection, "Tasks", "CompletedDate", "TEXT", logger);
            CheckAndAddColumn(connection, "Tasks", "CompletionNotes", "TEXT", logger);
            CheckAndAddColumn(connection, "Tasks", "CompletedBy", "TEXT", logger);
            
            // 检查并添加 Projects 表的字段（如果缺失）
            CheckAndAddColumn(connection, "Projects", "TimelineJson", "TEXT", logger);
            CheckAndAddColumn(connection, "Projects", "CreatedAt", "TEXT", logger);
            CheckAndAddColumn(connection, "Projects", "UpdatedAt", "TEXT", logger);
            
            // 检查并添加 Users 表的字段（如果缺失）
            CheckAndAddColumn(connection, "Users", "PasswordHash", "TEXT", logger);

            logger?.LogInformation("数据库迁移完成");
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "数据库迁移失败: {Message}\n堆栈跟踪: {StackTrace}", ex.Message, ex.StackTrace);
            // 重新抛出异常，让调用者处理
            throw;
        }
    }

    private static void CheckAndAddColumn(SqliteConnection connection, string tableName, string columnName, string columnType, ILogger? logger)
    {
        try
        {
            // 检查列是否存在
            var checkColumnSql = $@"
                SELECT COUNT(*) 
                FROM pragma_table_info('{tableName}') 
                WHERE name = '{columnName}'
            ";

            using var checkCommand = new SqliteCommand(checkColumnSql, connection);
            var exists = Convert.ToInt32(checkCommand.ExecuteScalar()) > 0;

            if (!exists)
            {
                logger?.LogInformation("添加列: {Table}.{Column}", tableName, columnName);
                
                // SQLite 不支持直接添加带默认值的列，需要分步操作
                // 1. 添加列（允许 NULL）
                var addColumnSql = $"ALTER TABLE {tableName} ADD COLUMN {columnName} {columnType}";
                using var addCommand = new SqliteCommand(addColumnSql, connection);
                addCommand.ExecuteNonQuery();

                // 2. 设置默认值（对于新记录）
                // SQLite 的限制：不能直接设置列的默认值，但可以在插入时使用
                // 这里我们只添加列，默认值由应用程序层处理
                
                logger?.LogInformation("成功添加列: {Table}.{Column}", tableName, columnName);
            }
            else
            {
                logger?.LogDebug("列已存在: {Table}.{Column}", tableName, columnName);
            }
        }
        catch (Exception ex)
        {
            logger?.LogWarning(ex, "检查/添加列失败: {Table}.{Column}, 错误: {Message}", tableName, columnName, ex.Message);
            // 继续处理其他列
        }
    }
}
