using System.Linq;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using RDTrackingSystem.Data;
using RDTrackingSystem.Models;

namespace RDTrackingSystem.Services;

public static class DatabaseSeeder
{
    public static void SeedIfEmpty(ApplicationDbContext context)
    {
        try
        {
            // 检查是否已有数据
            Console.WriteLine("[DatabaseSeeder] 检查数据库是否已有数据...");
            var hasUsers = context.Users.Any();
            var hasProjects = context.Projects.Any();
            var hasTasks = context.Tasks.Any();            
            Console.WriteLine($"[DatabaseSeeder] 用户数量: {context.Users.Count()}");
            Console.WriteLine($"[DatabaseSeeder] 项目数量: {context.Projects.Count()}");
            Console.WriteLine($"[DatabaseSeeder] 任务数量: {context.Tasks.Count()}");
            
            if (hasUsers || hasProjects || hasTasks)
            {
                Console.WriteLine("[DatabaseSeeder] 数据库已有数据，跳过初始化");
                return; // 已有数据，不进行初始化
            }

            Console.WriteLine("[DatabaseSeeder] 开始初始化示例数据...");
            
            // 初始化用户数据
            var sampleUsers = new[]
            {
                new User { Id = "eng1", Name = "张三", Role = "结构工程师", Email = "zhang.san@example.com" },
                new User { Id = "eng2", Name = "李四", Role = "软件工程师", Email = "li.si@example.com" },
                new User { Id = "eng3", Name = "王五", Role = "系统工程师", Email = "wang.wu@example.com" },
                new User { Id = "eng4", Name = "赵六", Role = "电子工程师", Email = "zhao.liu@example.com" },
                new User { Id = "eng5", Name = "钱七", Role = "方案工程师", Email = "qian.qi@example.com" },
            };

            Console.WriteLine("[DatabaseSeeder] 添加示例用户...");
            context.Users.AddRange(sampleUsers);

        // 初始化项目数据
        var sampleProjects = new[]
        {
            new Project
            {
                Id = "proj1",
                OrderNumber = "RD-2024-001",
                ProjectName = "高精度传感器模组",
                SalesName = "张明",
                DeviceQuantity = 500,
                Size = "120x80x25mm",
                ModuleModel = "SM-2024-A",
                CurrentStageId = "structural_design",
                Priority = "high",
                EstimatedCompletion = "2025-10-15"
            },
            new Project
            {
                Id = "proj2",
                OrderNumber = "RD-2024-002",
                ProjectName = "低功耗无线模块",
                SalesName = "李华",
                DeviceQuantity = 1000,
                Size = "50x30x8mm",
                ModuleModel = "WM-2024-B",
                CurrentStageId = "software_design",
                Priority = "medium",
                EstimatedCompletion = "2025-11-20"
            }
        };
            Console.WriteLine("[DatabaseSeeder] 添加示例项目...");
            context.Projects.AddRange(sampleProjects);            
            // 保存项目以便获取 ID
            context.SaveChanges();            
            // 添加 timeline 事件
            var timelineEvents = new List<TimelineEvent>
            {
                new TimelineEvent
                {
                    Id = "evt1",
                    ProjectId = "proj1",
                    StageId = "requirements",
                    Date = DateTime.Parse("2025-08-02"),
                    Description = "客户提出初步需求"
                },
                new TimelineEvent
                {
                    Id = "evt2",
                    ProjectId = "proj2",
                    StageId = "electronic_design",
                    Date = DateTime.Parse("2025-09-10"),
                    Description = "更换主控芯片"
                }
            };
            
            Console.WriteLine("[DatabaseSeeder] 添加示例 timeline 事件...");
            context.TimelineEvents.AddRange(timelineEvents);

            // 初始化任务数据（生成一些示例任务）
            Console.WriteLine("[DatabaseSeeder] 创建示例任务...");
            var sampleTasks = new List<Models.Task>();
            var random = new Random();
            var taskNames = new[] { "需求分析", "原型设计", "UI/UX 设计", "数据库设计", "API 开发", "前端开发", "后端开发", "集成测试" };

            for (int i = 0; i < 20; i++)
            {
                var startDate = DateTime.Now.AddDays(-random.Next(30, 90));
                var endDate = startDate.AddDays(random.Next(1, 10));
                
                sampleTasks.Add(new Models.Task
                {
                    Id = $"task{i + 1}",
                    Name = $"{sampleProjects[random.Next(sampleProjects.Length)].ProjectName} - {taskNames[random.Next(taskNames.Length)]}",
                    ProjectId = sampleProjects[random.Next(sampleProjects.Length)].Id,
                    AssignedToJson = JsonConvert.SerializeObject(new[] { sampleUsers[random.Next(sampleUsers.Length)].Id }),
                    StartDate = startDate.ToString("yyyy-MM-dd"),
                    EndDate = endDate.ToString("yyyy-MM-dd")
                });
            }

            Console.WriteLine("[DatabaseSeeder] 添加示例任务...");
            context.Tasks.AddRange(sampleTasks);
            Console.WriteLine("[DatabaseSeeder] 保存数据到数据库...");
            var changes = context.SaveChanges();
            Console.WriteLine($"[DatabaseSeeder] 保存成功，影响 {changes} 行");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DatabaseSeeder] 初始化失败: {ex.Message}");
            Console.WriteLine($"[DatabaseSeeder] 堆栈跟踪: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[DatabaseSeeder] 内部异常: {ex.InnerException.Message}");
            }
            throw;
        }
    }
}
