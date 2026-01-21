using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using RDTrackingSystem.Data;
using RDTrackingSystem.Models;
using RDTrackingSystem.Models.DTOs;
using RDTrackingSystem.Services;

namespace RDTrackingSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LessonLearnedController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<LessonLearnedController> _logger;

    public LessonLearnedController(ApplicationDbContext context, ILogger<LessonLearnedController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetLessonLearned()
    {
        try
        {
            // 确保数据库架构是最新的
            DatabaseSchemaMigrator.MigrateSchema();
            
            var lessons = await _context.LessonLearned.ToListAsync();
            
            var result = lessons.Select(l => new
            {
                id = l.Id,
                tagType = l.TagType,
                projectId = l.ProjectId,
                taskId = l.TaskId,
                timelineEventId = l.TimelineEventId,
                background = l.Background,
                rootCause = l.RootCause,
                ifRedo = l.IfRedo,
                hasReuseValue = l.HasReuseValue,
                relatedProjectName = l.RelatedProjectName,
                relatedTaskName = l.RelatedTaskName,
                createdBy = l.CreatedBy,
                createdAt = l.CreatedAt,
                updatedAt = l.UpdatedAt
            }).ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取经验教训列表失败");
            return StatusCode(500, new { message = "获取经验教训列表失败", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetLessonLearned(string id)
    {
        var lesson = await _context.LessonLearned.FindAsync(id);
        if (lesson == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            id = lesson.Id,
            tagType = lesson.TagType,
            projectId = lesson.ProjectId,
            taskId = lesson.TaskId,
            timelineEventId = lesson.TimelineEventId,
            background = lesson.Background,
            rootCause = lesson.RootCause,
            ifRedo = lesson.IfRedo,
            hasReuseValue = lesson.HasReuseValue,
            relatedProjectName = lesson.RelatedProjectName,
            relatedTaskName = lesson.RelatedTaskName,
            createdBy = lesson.CreatedBy,
            createdAt = lesson.CreatedAt,
            updatedAt = lesson.UpdatedAt
        });
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreateLessonLearned([FromBody] dynamic lessonData)
    {
        try
        {
            // 确保数据库架构是最新的
            DatabaseSchemaMigrator.MigrateSchema();
            
            if (lessonData == null)
            {
                return BadRequest(new { error = "经验教训数据为空" });
            }

            var lesson = new LessonLearned
            {
                Id = lessonData.id?.ToString() ?? Guid.NewGuid().ToString(),
                TagType = lessonData.tagType?.ToString() ?? string.Empty,
                ProjectId = lessonData.projectId?.ToString(),
                TaskId = lessonData.taskId?.ToString(),
                TimelineEventId = lessonData.timelineEventId?.ToString(),
                Background = lessonData.background?.ToString() ?? string.Empty,
                RootCause = lessonData.rootCause?.ToString() ?? string.Empty,
                IfRedo = lessonData.ifRedo?.ToString() ?? string.Empty,
                HasReuseValue = lessonData.hasReuseValue != null && (bool)lessonData.hasReuseValue,
                RelatedProjectName = lessonData.relatedProjectName?.ToString(),
                RelatedTaskName = lessonData.relatedTaskName?.ToString(),
                CreatedBy = lessonData.createdBy?.ToString(),
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.LessonLearned.Add(lesson);
            
            // 如果关联了任务或时间线事件，更新它们的标签和经验教训ID
            if (!string.IsNullOrEmpty(lesson.TaskId))
            {
                var task = await _context.Tasks.FindAsync(lesson.TaskId);
                if (task != null)
                {
                    task.TagType = lesson.TagType;
                    task.LessonLearnedId = lesson.Id;
                }
            }
            
            if (!string.IsNullOrEmpty(lesson.TimelineEventId))
            {
                var timelineEvent = await _context.TimelineEvents.FindAsync(lesson.TimelineEventId);
                if (timelineEvent != null)
                {
                    timelineEvent.TagType = lesson.TagType;
                    timelineEvent.LessonLearnedId = lesson.Id;
                }
            }
            
            await _context.SaveChangesAsync();

            return Ok(new { id = lesson.Id, message = "经验教训创建成功" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "创建经验教训失败");
            return StatusCode(500, new { message = "创建经验教训失败", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateLessonLearned(string id, [FromBody] dynamic lessonData)
    {
        var lesson = await _context.LessonLearned.FindAsync(id);
        if (lesson == null)
        {
            return NotFound();
        }

        try
        {
            lesson.Background = lessonData.background?.ToString() ?? lesson.Background;
            lesson.RootCause = lessonData.rootCause?.ToString() ?? lesson.RootCause;
            lesson.IfRedo = lessonData.ifRedo?.ToString() ?? lesson.IfRedo;
            lesson.HasReuseValue = lessonData.hasReuseValue != null ? (bool)lessonData.hasReuseValue : lesson.HasReuseValue;
            lesson.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { message = "经验教训更新成功" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "更新经验教训失败");
            return StatusCode(500, new { message = "更新经验教训失败", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteLessonLearned(string id)
    {
        var lesson = await _context.LessonLearned.FindAsync(id);
        if (lesson == null)
        {
            return NotFound();
        }

        // 清除关联的任务和时间线事件的标签和经验教训ID
        if (!string.IsNullOrEmpty(lesson.TaskId))
        {
            var task = await _context.Tasks.FindAsync(lesson.TaskId);
            if (task != null)
            {
                task.TagType = null;
                task.LessonLearnedId = null;
            }
        }
        
        if (!string.IsNullOrEmpty(lesson.TimelineEventId))
        {
            var timelineEvent = await _context.TimelineEvents.FindAsync(lesson.TimelineEventId);
            if (timelineEvent != null)
            {
                timelineEvent.TagType = null;
                timelineEvent.LessonLearnedId = null;
            }
        }

        _context.LessonLearned.Remove(lesson);
        await _context.SaveChangesAsync();
        return Ok(new { message = "经验教训删除成功" });
    }
}
