using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RDTrackingSystem.Data;
using RDTrackingSystem.Models;

namespace RDTrackingSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UsersController> _logger;

    public UsersController(ApplicationDbContext context, ILogger<UsersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetUsers()
    {
        Console.WriteLine($"[UsersController] GetUsers() 开始执行 - {DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}");
        try
        {
            if (_context == null)
            {
                var errorMsg = "数据库上下文为空";
                Console.WriteLine($"[UsersController] GetUsers() 错误: {errorMsg}");
                _logger.LogError(errorMsg);
                return Ok(new List<object>());
            }

            Console.WriteLine($"[UsersController] GetUsers() 检查数据库连接状态...");
            var canConnect = await _context.Database.CanConnectAsync();
            Console.WriteLine($"[UsersController] GetUsers() 数据库连接状态: {canConnect}");

            if (!canConnect)
            {
                var errorMsg = "无法连接到数据库";
                Console.WriteLine($"[UsersController] GetUsers() 错误: {errorMsg}");
                _logger.LogError(errorMsg);
                return Ok(new List<object>());
            }

            Console.WriteLine($"[UsersController] GetUsers() 开始查询数据库...");
            var users = await _context.Users.ToListAsync();
            Console.WriteLine($"[UsersController] GetUsers() 查询完成，找到 {users.Count} 个用户");

            var result = users.Select(u => new
            {
                id = u.Id,
                name = u.Name,
                email = u.Email,
                role = u.Role,
                avatar = u.Avatar
            }).ToList();

            Console.WriteLine($"[UsersController] GetUsers() 成功，返回 {result.Count} 个用户");
            _logger.LogInformation("GetUsers() 成功，返回 {Count} 个用户", result.Count);
            return Ok(result);
        }
        catch (Exception ex)
        {
            var errorMsg = $"获取用户列表失败: {ex.Message}";
            Console.WriteLine($"[UsersController] GetUsers() 异常: {errorMsg}");
            Console.WriteLine($"[UsersController] GetUsers() 堆栈跟踪: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[UsersController] GetUsers() 内部异常: {ex.InnerException.Message}");
            }
            _logger.LogError(ex, "获取用户列表失败: {Message}\n堆栈跟踪: {StackTrace}", ex.Message, ex.StackTrace);
            return Ok(new List<object>());
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetUser(string id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            id = user.Id,
            name = user.Name,
            email = user.Email,
            role = user.Role,
            avatar = user.Avatar
        });
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreateUser([FromBody] dynamic userData)
    {
        Console.WriteLine($"[UsersController] CreateUser() 开始执行 - {DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}");
        try
        {
            if (userData == null)
            {
                var errorMsg = "用户数据为空";
                Console.WriteLine($"[UsersController] CreateUser() 错误: {errorMsg}");
                return BadRequest(new { error = errorMsg });
            }

            var userId = userData.id?.ToString() ?? Guid.NewGuid().ToString();
            string email = userData.email?.ToString() ?? string.Empty;
            
            Console.WriteLine($"[UsersController] CreateUser() 用户ID: {userId}, 邮箱: {email}");

            // 检查邮箱是否已存在
            if (!string.IsNullOrEmpty(email))
            {
                string emailAddr = email; // 确保是明确的 string 类型
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == emailAddr);
                if (existingUser != null)
                {
                    var errorMsg = $"邮箱 '{email}' 已存在";
                    Console.WriteLine($"[UsersController] CreateUser() 错误: {errorMsg}");
                    _logger.LogWarning(errorMsg);
                    return BadRequest(new { error = errorMsg });
                }
            }

            var user = new User
            {
                Id = userId,
                Name = userData.name?.ToString() ?? string.Empty,
                Email = email,
                Role = userData.role?.ToString() ?? string.Empty,
                Avatar = userData.avatar?.ToString()
            };

            Console.WriteLine($"[UsersController] CreateUser() 准备添加到数据库...");
            _context.Users.Add(user);
            
            Console.WriteLine($"[UsersController] CreateUser() 准备保存到数据库...");
            var changeCount = await _context.SaveChangesAsync();
            Console.WriteLine($"[UsersController] CreateUser() 保存成功，影响行数: {changeCount}");

            _logger.LogInformation("用户创建成功: ID={UserId}, Email={Email}", user.Id, user.Email);
            return Ok(new { id = user.Id, message = "用户添加成功" });
        }
        catch (System.UnauthorizedAccessException authEx)
        {
            var dbPath = DatabaseConstants.GetDatabasePath();
            var errorMsg = $"拒绝访问数据库文件: {dbPath}\n\n" +
                          $"可能的原因:\n" +
                          $"1. 数据库文件或目录权限不足\n" +
                          $"2. 文件被设置为只读\n" +
                          $"3. 程序没有足够的权限写入该位置\n\n" +
                          $"解决方案:\n" +
                          $"1. 检查文件属性，确保不是只读\n" +
                          $"2. 以管理员身份运行程序\n" +
                          $"3. 检查文件夹权限，确保有写入权限\n\n" +
                          $"错误详情: {authEx.Message}";
            Console.WriteLine($"[UsersController] CreateUser() 权限异常: {errorMsg}");
            _logger.LogError(authEx, "创建用户失败（权限异常）: {Message}", authEx.Message);
            return StatusCode(500, new { error = errorMsg });
        }
        catch (System.IO.IOException ioEx)
        {
            var dbPath = DatabaseConstants.GetDatabasePath();
            var errorMsg = $"数据库文件访问失败: {ioEx.Message}\n\n" +
                          $"数据库路径: {dbPath}\n\n" +
                          $"可能的原因:\n" +
                          $"1. 数据库文件被其他程序锁定\n" +
                          $"2. 文件权限不足\n" +
                          $"3. 磁盘空间不足\n\n" +
                          $"解决方案:\n" +
                          $"1. 关闭可能正在使用数据库的其他程序\n" +
                          $"2. 检查文件权限\n" +
                          $"3. 检查磁盘空间";
            Console.WriteLine($"[UsersController] CreateUser() IO异常: {errorMsg}");
            _logger.LogError(ioEx, "创建用户失败（IO异常）: {Message}", ioEx.Message);
            return StatusCode(500, new { error = errorMsg });
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException dbEx)
        {
            var errorMsg = $"数据库更新失败: {dbEx.Message}";
            Console.WriteLine($"[UsersController] CreateUser() 数据库异常: {errorMsg}");
            Console.WriteLine($"[UsersController] CreateUser() 堆栈跟踪: {dbEx.StackTrace}");
            if (dbEx.InnerException != null)
            {
                Console.WriteLine($"[UsersController] CreateUser() 内部异常: {dbEx.InnerException.Message}");
                errorMsg += $"\n内部异常: {dbEx.InnerException.Message}";
                
                // 检查是否是权限问题
                if (dbEx.InnerException is System.UnauthorizedAccessException || 
                    dbEx.InnerException.Message.Contains("拒绝访问") ||
                    dbEx.InnerException.Message.Contains("Access") ||
                    dbEx.InnerException.Message.Contains("denied"))
                {
                    var dbPath = DatabaseConstants.GetDatabasePath();
                    errorMsg = $"拒绝访问数据库文件: {dbPath}\n\n" +
                              $"可能的原因:\n" +
                              $"1. 数据库文件或目录权限不足\n" +
                              $"2. 文件被设置为只读\n" +
                              $"3. 程序没有足够的权限写入该位置\n\n" +
                              $"解决方案:\n" +
                              $"1. 检查文件属性，确保不是只读\n" +
                              $"2. 以管理员身份运行程序\n" +
                              $"3. 检查文件夹权限，确保有写入权限";
                }
            }
            _logger.LogError(dbEx, "创建用户失败（数据库异常）: {Message}", dbEx.Message);
            return StatusCode(500, new { error = errorMsg, details = dbEx.InnerException?.Message });
        }
        catch (Exception ex)
        {
            var errorMsg = $"创建用户失败: {ex.Message}";
            Console.WriteLine($"[UsersController] CreateUser() 异常: {errorMsg}");
            Console.WriteLine($"[UsersController] CreateUser() 堆栈跟踪: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[UsersController] CreateUser() 内部异常: {ex.InnerException.Message}");
                errorMsg += $"\n内部异常: {ex.InnerException.Message}";
            }
            _logger.LogError(ex, "创建用户失败: {Message}\n堆栈跟踪: {StackTrace}", ex.Message, ex.StackTrace);
            return StatusCode(500, new { error = errorMsg, details = ex.InnerException?.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateUser(string id, [FromBody] dynamic userData)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        try
        {
            user.Name = userData.name?.ToString() ?? user.Name;
            user.Email = userData.email?.ToString() ?? user.Email;
            user.Role = userData.role?.ToString() ?? user.Role;
            user.Avatar = userData.avatar?.ToString();

            await _context.SaveChangesAsync();
            return Ok(new { message = "用户更新成功" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "更新用户失败");
            return StatusCode(500, new { message = "更新用户失败", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(string id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return Ok(new { message = "用户已删除" });
    }
}
