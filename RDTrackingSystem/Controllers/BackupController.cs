using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RDTrackingSystem.Services;
using RDTrackingSystem.Data;

namespace RDTrackingSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BackupController : ControllerBase
{
    private readonly ILogger<BackupController> _logger;

    public BackupController(ILogger<BackupController> logger)
    {
        _logger = logger;
    }

    [HttpPost("create")]
    public ActionResult<object> CreateBackup([FromBody] dynamic? data = null)
    {
        try
        {
            string? backupName = null;
            try
            {
                if (data != null && data.backupName != null)
                {
                    backupName = data.backupName?.ToString();
                }
            }
            catch
            {
                // 忽略 dynamic 访问错误
            }

            var dbPath = DatabaseConstants.GetDatabasePath();
            var backupPath = DatabaseBackupService.CreateBackup(dbPath, backupName, _logger);

            if (string.IsNullOrEmpty(backupPath))
            {
                return StatusCode(500, new { error = "备份创建失败" });
            }

            return Ok(new
            {
                success = true,
                backupPath = backupPath,
                message = "备份创建成功"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "创建备份失败");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("list")]
    public ActionResult<IEnumerable<object>> GetBackupList()
    {
        try
        {
            var backups = DatabaseBackupService.GetBackupList(_logger);
            var result = backups.Select(b => new
            {
                filePath = b.FilePath,
                fileName = b.FileName,
                fileSize = b.FileSize,
                fileSizeFormatted = b.FileSizeFormatted,
                createdAt = b.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                description = b.Description ?? string.Empty
            }).ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取备份列表失败");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("restore")]
    public ActionResult<object> RestoreBackup([FromBody] dynamic data)
    {
        try
        {
            var backupPath = data?.backupPath?.ToString();
            if (string.IsNullOrEmpty(backupPath))
            {
                return BadRequest(new { error = "备份路径不能为空" });
            }

            var dbPath = DatabaseConstants.GetDatabasePath();
            var success = DatabaseBackupService.RestoreBackup(backupPath, dbPath, _logger);

            if (success)
            {
                return Ok(new
                {
                    success = true,
                    message = "数据库恢复成功，请重启程序以应用更改"
                });
            }
            else
            {
                return StatusCode(500, new { error = "数据库恢复失败" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "恢复备份失败");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpDelete("{backupPath}")]
    public ActionResult<object> DeleteBackup(string backupPath)
    {
        try
        {
            var success = DatabaseBackupService.DeleteBackup(backupPath, _logger);
            return Ok(new
            {
                success = success,
                message = success ? "备份已删除" : "删除失败"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "删除备份失败");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("cleanup")]
    public ActionResult<object> CleanupOldBackups([FromBody] dynamic? data = null)
    {
        try
        {
            int keepCount = 10;
            try
            {
                if (data != null && data.keepCount != null)
                {
                    var keepCountStr = data.keepCount?.ToString();
                    if (!string.IsNullOrEmpty(keepCountStr))
                    {
                        keepCount = Convert.ToInt32(keepCountStr);
                    }
                }
            }
            catch
            {
                // 忽略 dynamic 访问错误，使用默认值
            }

            var deletedCount = DatabaseBackupService.CleanupOldBackups(keepCount, _logger);
            return Ok(new
            {
                success = true,
                deletedCount = deletedCount,
                message = $"已删除 {deletedCount} 个旧备份"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "清理旧备份失败");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("export")]
    public ActionResult<object> ExportDatabase()
    {
        try
        {
            // HTTP API 模式下，无法显示文件对话框
            // 返回错误提示使用原生桥接
            return StatusCode(501, new
            {
                error = "导出到指定位置功能需要原生桥接支持，请使用 WebViewBridge"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "导出数据库失败");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("import")]
    public ActionResult<object> ImportDatabase([FromBody] dynamic data)
    {
        var tempDir = string.Empty;
        try
        {
            var fileName = data?.fileName?.ToString();
            var fileData = data?.fileData?.ToString();

            if (string.IsNullOrEmpty(fileName) || string.IsNullOrEmpty(fileData))
            {
                return BadRequest(new { error = "文件名和文件数据不能为空" });
            }

            var dbPath = DatabaseConstants.GetDatabasePath();

            // 解析 base64 数据
            string base64Data = fileData ?? string.Empty;
            if (!string.IsNullOrEmpty(fileData))
            {
                var fileDataStr = fileData.ToString() ?? string.Empty;
                if (fileDataStr.Contains(","))
                {
                    var parts = fileDataStr.Split(',');
                    if (parts.Length > 1)
                    {
                        base64Data = parts[1];
                    }
                }
            }

            if (string.IsNullOrEmpty(base64Data))
            {
                return BadRequest(new { error = "文件数据无效" });
            }

            byte[] fileBytes = Convert.FromBase64String(base64Data);

            // 创建临时文件
            tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
            Directory.CreateDirectory(tempDir);
            var tempFilePath = Path.Combine(tempDir, fileName);

            System.IO.File.WriteAllBytes(tempFilePath, fileBytes);

            // 使用备份服务恢复
            var success = DatabaseBackupService.RestoreBackup(tempFilePath, dbPath, _logger);

            if (success)
            {
                return Ok(new
                {
                    success = true,
                    message = "数据库导入成功，请重启程序以应用更改"
                });
            }
            else
            {
                return StatusCode(500, new { error = "数据库导入失败" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "导入数据库失败");
            return StatusCode(500, new { error = ex.Message });
        }
        finally
        {
            // 清理临时文件
            if (!string.IsNullOrEmpty(tempDir))
            {
                try
                {
                    if (Directory.Exists(tempDir))
                    {
                        Directory.Delete(tempDir, true);
                    }
                }
                catch
                {
                    // 忽略清理错误
                }
            }
        }
    }
}
